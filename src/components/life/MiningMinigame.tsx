import React, { useState, useEffect } from 'react'
import { X, Mountain, Gem, Zap } from 'lucide-react'
import { useGameStore } from '../../stores'
import { loadDropTable } from '../../utils/dataLoader'

interface MiningMinigameProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (success: boolean, perfect: boolean) => void
  skillLevel: number
}

interface RewardItem {
  itemId: string
  quantity: number
  level: number
  quality: string
  type?: string
}

interface DropItem {
  itemId: string
  chance: number
  min: number
  max: number
  type?: string
}

type GemType = '💎' | '💍' | '🟢' | '🔵' | '🟡' | '🔴'

interface GridCell {
  id: string
  gem: GemType
  matched: boolean
  selected: boolean
}

const MiningMinigame: React.FC<MiningMinigameProps> = ({ isOpen, onClose, onComplete, skillLevel }) => {
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(15)
  const [targetScore] = useState(300)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [matchedCount, setMatchedCount] = useState(0)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [showResults, setShowResults] = useState(false)
  const [dropTable, setDropTable] = useState<DropItem[]>([])

  const gems: GemType[] = ['💎', '💍', '🟢', '🔵', '🟡', '🔴']
  const gridSize = 6

  // 드랍 테이블 로드
  useEffect(() => {
    const loadDropTableData = async () => {
      try {
        const dropData = await loadDropTable('mining_rewards')
        if (dropData && dropData.drops) {
          setDropTable(dropData.drops)
        } else {
          throw new Error('드롭 테이블 데이터가 없습니다.')
        }
      } catch (error) {
        console.error('광산 보상 테이블 로드 실패:', error)
        // 기본 드랍 테이블 설정
        setDropTable([
          { itemId: "iron_ore", chance: 0.4, min: 1, max: 1 },
          { itemId: "steel_ore", chance: 0.3, min: 1, max: 1 },
          { itemId: "mithril_ore", chance: 0.25, min: 1, max: 1 },
          { itemId: "dragon_ore", chance: 0.2, min: 1, max: 1 },
          { itemId: "common_metal", chance: 0.35, min: 1, max: 1 },
          { itemId: "refined_metal", chance: 0.25, min: 1, max: 1 }
        ])
      }
    }

    loadDropTableData()
  }, [])

  // 그리드 초기화
  const initializeGrid = () => {
    const newGrid: GridCell[][] = []
    for (let row = 0; row < gridSize; row++) {
      newGrid[row] = []
      for (let col = 0; col < gridSize; col++) {
        newGrid[row][col] = {
          id: `${row}-${col}`,
          gem: gems[Math.floor(Math.random() * gems.length)],
          matched: false,
          selected: false
        }
      }
    }
    
    // 초기 매치 제거
    removeInitialMatches(newGrid)
    return newGrid
  }

  // 초기 매치 제거
  const removeInitialMatches = (grid: GridCell[][]) => {
    let hasMatches = true
    while (hasMatches) {
      hasMatches = false
      
      // 가로 매치 체크
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize - 2; col++) {
          if (grid[row][col].gem === grid[row][col + 1].gem && 
              grid[row][col].gem === grid[row][col + 2].gem) {
            grid[row][col].gem = gems[Math.floor(Math.random() * gems.length)]
            hasMatches = true
          }
        }
      }
      
      // 세로 매치 체크
      for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize - 2; row++) {
          if (grid[row][col].gem === grid[row + 1][col].gem && 
              grid[row][col].gem === grid[row + 2][col].gem) {
            grid[row][col].gem = gems[Math.floor(Math.random() * gems.length)]
            hasMatches = true
          }
        }
      }
    }
  }

  // 단일 보상 계산
  const calculateSingleReward = (matchedCount: number, skillLevel: number) => {
    const itemLevel = Math.max(1, Math.floor((skillLevel + 1 + matchedCount) / 3))
    
    if (dropTable.length === 0) {
      return { itemId: "iron_ore", quantity: 1, level: itemLevel, quality: 'Common' }
    }

    const random = Math.random()
    let cumulativeChance = 0
    let selectedItem = null

    for (const drop of dropTable) {
      cumulativeChance += drop.chance
      if (random <= cumulativeChance) {
        selectedItem = drop
        break
      }
    }
    if (!selectedItem) { selectedItem = dropTable[0] }

    const quantity = Math.floor(Math.random() * (selectedItem.max - selectedItem.min + 1)) + selectedItem.min
    return { itemId: selectedItem.itemId, quantity, level: itemLevel, quality: 'Common', type: selectedItem.type }
  }

  // 최종 보상 계산
  const calculateRewards = (matchedCount: number, skillLevel: number) => {
    const finalRewards: RewardItem[] = []
    for (let i = 0; i < matchedCount; i++) {
      finalRewards.push(calculateSingleReward(i, skillLevel))
    }
    return finalRewards
  }

  // 게임 종료
  const endGame = () => {
    setGameState('finished')
    
    const finalRewards = calculateRewards(matchedCount, skillLevel)
    setRewards(finalRewards)
    setShowResults(true)
    
    // 경험치 추가
    const { addLifeSkillXp, saveGame } = useGameStore.getState()
    const xpGain = matchedCount * 15
    addLifeSkillXp('mining', xpGain)
    
    saveGame()
  }

  // 게임 시작
  const startGame = () => {
    const newGrid = initializeGrid()
    setGrid(newGrid)
    setSelectedCells([])
    setScore(0)
    setMoves(15)
    setMatchedCount(0)
    setRewards([])
    setShowResults(false)
    setGameState('playing')
  }

  // 셀 클릭
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || moves <= 0) return
    
    const cellId = `${row}-${col}`
    
    if (selectedCells.length === 0) {
      // 첫 번째 선택
      setSelectedCells([cellId])
      setGrid(prev => prev.map(r => r.map(cell => 
        cell.id === cellId ? { ...cell, selected: true } : { ...cell, selected: false }
      )))
    } else if (selectedCells.length === 1) {
      // 두 번째 선택
      const firstCellId = selectedCells[0]
      const [firstRow, firstCol] = firstCellId.split('-').map(Number)
      
      // 인접한 셀인지 확인
      const isAdjacent = 
        (Math.abs(row - firstRow) === 1 && col === firstCol) ||
        (Math.abs(col - firstCol) === 1 && row === firstRow)
      
      if (isAdjacent && cellId !== firstCellId) {
        // 보석 교체
        swapGems(firstRow, firstCol, row, col)
        setMoves(prev => prev - 1)
      }
      
      // 선택 초기화
      setSelectedCells([])
      setGrid(prev => prev.map(r => r.map(cell => ({ ...cell, selected: false }))))
    }
  }

  // 보석 교체
  const swapGems = (row1: number, col1: number, row2: number, col2: number) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      const temp = newGrid[row1][col1].gem
      newGrid[row1][col1].gem = newGrid[row2][col2].gem
      newGrid[row2][col2].gem = temp
      
      // 매치 확인 및 처리
      setTimeout(() => {
        checkAndRemoveMatches(newGrid)
      }, 300)
      
      return newGrid
    })
  }

  // 매치 확인 및 제거
  const checkAndRemoveMatches = (currentGrid: GridCell[][]) => {
    const matches: string[] = []
    
    // 가로 매치 확인
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize - 2; col++) {
        if (currentGrid[row][col].gem === currentGrid[row][col + 1].gem && 
            currentGrid[row][col].gem === currentGrid[row][col + 2].gem) {
          matches.push(`${row}-${col}`, `${row}-${col + 1}`, `${row}-${col + 2}`)
        }
      }
    }
    
    // 세로 매치 확인
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize - 2; row++) {
        if (currentGrid[row][col].gem === currentGrid[row + 1][col].gem && 
            currentGrid[row][col].gem === currentGrid[row + 2][col].gem) {
          matches.push(`${row}-${col}`, `${row + 1}-${col}`, `${row + 2}-${col}`)
        }
      }
    }
    
    if (matches.length > 0) {
      // 점수 추가
      const uniqueMatches = [...new Set(matches)]
      const points = uniqueMatches.length * 20
      setScore(prev => prev + points)
      setMatchedCount(prev => prev + uniqueMatches.length)
      
      // 매치된 보석마다 즉시 보상 지급
      const { addMaterial, addSkillPage } = useGameStore.getState()
      uniqueMatches.forEach((_, index) => {
        const reward = calculateSingleReward(index, skillLevel)
        if (reward.type === 'skillPage') {
          addSkillPage(reward.itemId)
        } else {
          addMaterial(reward.itemId, reward.quantity, reward.level)
        }
      })
      
      // 매치된 보석 제거 및 새로운 보석 떨어뜨리기
      setGrid(prev => {
        const newGrid = prev.map(row => [...row])
        
        // 매치된 셀 표시
        uniqueMatches.forEach(cellId => {
          const [row, col] = cellId.split('-').map(Number)
          newGrid[row][col].matched = true
        })
        
        setTimeout(() => {
          dropNewGems(newGrid, uniqueMatches)
        }, 500)
        
        return newGrid
      })
    }
  }

  // 새로운 보석 떨어뜨리기
  const dropNewGems = (currentGrid: GridCell[][], matchedCells: string[]) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      
      // 각 열에 대해 처리
      for (let col = 0; col < gridSize; col++) {
        const matchedInColumn = matchedCells.filter(cellId => 
          cellId.split('-')[1] === col.toString()
        ).length
        
        if (matchedInColumn > 0) {
          // 기존 보석들을 아래로 이동
          for (let row = gridSize - 1; row >= 0; row--) {
            const cellId = `${row}-${col}`
            if (!matchedCells.includes(cellId)) {
              // 이 보석을 아래로 이동
              let newRow = row + matchedInColumn
              if (newRow < gridSize) {
                newGrid[newRow][col].gem = newGrid[row][col].gem
              }
            }
          }
          
          // 상단에 새로운 보석 생성
          for (let i = 0; i < matchedInColumn; i++) {
            newGrid[i][col].gem = gems[Math.floor(Math.random() * gems.length)]
            newGrid[i][col].matched = false
          }
        }
      }
      
      // 모든 matched 상태 초기화
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          newGrid[row][col].matched = false
        }
      }
      
      // 새로운 보석이 떨어진 후 연쇄 매치 확인
      setTimeout(() => {
        checkAndRemoveMatches(newGrid)
      }, 300)
      
      return newGrid
    })
  }

  // 게임 종료 체크
  useEffect(() => {
    if (gameState === 'playing') {
      if (score >= targetScore || moves <= 0) {
        endGame()
      }
    }
  }, [score, moves, targetScore, gameState])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Mountain className="text-gray-400" size={24} />
            광산 매칭 게임
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {gameState === 'ready' && (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              같은 보석 3개 이상을 연결하여 매치하세요!
            </p>
            <p className="text-sm text-gray-400 mb-6">
              목표: {targetScore}점 달성 (15번의 이동 기회)
            </p>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors"
            >
              시작!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            {/* 게임 정보 */}
            <div className="flex justify-between text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <Gem size={16} />
                <span>점수: {score}/{targetScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} />
                <span>이동: {moves}회</span>
              </div>
            </div>

            {/* 진행도 바 */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
              />
            </div>

            {/* 게임 그리드 */}
            <div className="flex justify-center mb-4">
              <div className="grid grid-cols-6 gap-1" style={{ width: 'fit-content' }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={cell.id}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all duration-200 ${
                        cell.selected
                          ? 'bg-yellow-400 border-2 border-yellow-200'
                          : cell.matched
                            ? 'bg-red-600 animate-pulse'
                            : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                      disabled={cell.matched}
                    >
                      {cell.gem}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="text-center text-xs text-gray-500">
              인접한 두 보석을 클릭하여 교체하세요
            </div>
          </div>
        )}

        {gameState === 'finished' && !showResults && (
          <div className="text-center">
            <div className="text-2xl mb-4">
              {score >= targetScore ? '🎉' : '😅'}
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {score >= targetScore ? '성공!' : '실패...'}
            </h4>
            <p className="text-gray-300 mb-4">
              최종 점수: {score}/{targetScore}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              매치한 보석: {matchedCount}개
            </p>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                다시하기
              </button>
              <button
                onClick={() => setShowResults(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                결과 보기
              </button>
            </div>
          </div>
        )}

        {showResults && (
          <div className="text-center">
            <div className="text-2xl mb-4">📦</div>
            <h4 className="text-lg font-bold text-white mb-2">
              광산 결과
            </h4>
            <p className="text-gray-300 mb-4">
              매치한 보석: {matchedCount}개
            </p>
            <p className="text-sm text-gray-400 mb-4">
              경험치 획득: +{matchedCount * 15} XP
            </p>
            
            {rewards.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">획득한 아이템:</p>
                <div className="bg-gray-700 rounded p-3 max-h-32 overflow-y-auto">
                  {rewards.map((reward, index) => (
                    <div key={index} className="text-sm text-gray-300 mb-1">
                      {reward.type === 'skillPage' ? '📖' : '⛏️'} {reward.itemId} {reward.quantity}개 (레벨: {reward.level})
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                다시하기
              </button>
              <button
                onClick={() => {
                  onComplete(score >= targetScore, score >= targetScore * 1.5)
                  setGameState('ready')
                  setScore(0)
                  setMoves(15)
                  setMatchedCount(0)
                  setRewards([])
                  setShowResults(false)
                  setGrid(initializeGrid())
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MiningMinigame 