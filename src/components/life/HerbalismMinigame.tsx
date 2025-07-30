import React, { useState, useEffect } from 'react'
import { X, Leaf, Bomb, Eye } from 'lucide-react'
import { useGameStore } from '../../stores'

interface HerbalismMinigameProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (success: boolean, perfect: boolean) => void
  skillLevel?: number
}

interface Cell {
  id: string
  isHerb: boolean
  isPoison: boolean
  isRevealed: boolean
  neighborPoisons: number
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

const HerbalismMinigame: React.FC<HerbalismMinigameProps> = ({ isOpen, onClose, onComplete, skillLevel = 1 }) => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [score, setScore] = useState(0)
  const [herbsFound, setHerbsFound] = useState(0)
  const [poisonsFound, setPoisonsFound] = useState(0)
  const [totalHerbs] = useState(12)
  const [gameOver, setGameOver] = useState(false)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [showResults, setShowResults] = useState(false)
  const [dropTable, setDropTable] = useState<DropItem[]>([])

  const gridSize = 8
  const poisonCount = Math.min(20, Math.max(5, 5 + Math.floor(skillLevel / 2))) // 레벨에 따라 5~20개

  // 드롭 테이블 로드
  useEffect(() => {
    const loadDropTable = async () => {
      try {
        const response = await fetch('/src/data/drops/herbalism_rewards.json')
        const data = await response.json()
        setDropTable(data.drops)
      } catch (error) {
        console.error('채집 보상 테이블 로드 실패:', error)
        // 기본 드롭 테이블 설정
        setDropTable([
          { itemId: "healing_herb", chance: 0.4, min: 1, max: 1 },
          { itemId: "green_herb", chance: 0.3, min: 1, max: 1 },
          { itemId: "red_herb", chance: 0.25, min: 1, max: 1 },
          { itemId: "blue_herb", chance: 0.2, min: 1, max: 1 },
          { itemId: "mana_flower", chance: 0.15, min: 1, max: 1 }
        ])
      }
    }

    if (isOpen) {
      loadDropTable()
    }
  }, [isOpen])

  // 단일 아이템 보상 계산 함수
  const calculateSingleReward = (poisonsFound: number, skillLevel: number) => {
    const itemLevel = Math.max(1, Math.floor((skillLevel + 1 + poisonsFound) / 3))
    
    if (dropTable.length === 0) {
      // 드롭 테이블이 로드되지 않았으면 기본 아이템 반환
      return {
        itemId: "healing_herb",
        quantity: 1,
        level: itemLevel,
        quality: 'Common'
      }
    }

    // 하나의 아이템만 선택
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

    // 아이템이 선택되지 않았으면 기본 아이템 (healing_herb)
    if (!selectedItem) {
      selectedItem = dropTable[0]
    }

    // JSON 파일의 min/max 값을 사용
    const quantity = Math.floor(Math.random() * (selectedItem.max - selectedItem.min + 1)) + selectedItem.min
    return {
      itemId: selectedItem.itemId,
      quantity,
      level: itemLevel,
      quality: 'Common',
      type: selectedItem.type
    }
  }

  // 보상 계산 함수 (게임 종료 시 사용)
  const calculateRewards = (herbsFound: number, poisonsFound: number, skillLevel: number) => {
    const rewards: RewardItem[] = []
    
    // 허브 발견 시마다 보상 지급
    for (let i = 0; i < herbsFound; i++) {
      const reward = calculateSingleReward(poisonsFound, skillLevel)
      rewards.push(reward)
    }

    return rewards
  }

  // 그리드 초기화
  const initializeGrid = () => {
    const newGrid: Cell[][] = []
    
    // 빈 그리드 생성
    for (let row = 0; row < gridSize; row++) {
      newGrid[row] = []
      for (let col = 0; col < gridSize; col++) {
        newGrid[row][col] = {
          id: `${row}-${col}`,
          isHerb: false,
          isPoison: false,
          isRevealed: false,
          neighborPoisons: 0
        }
      }
    }

    // 독성 식물 배치
    const poisonPositions = new Set<string>()
    while (poisonPositions.size < poisonCount) {
      const row = Math.floor(Math.random() * gridSize)
      const col = Math.floor(Math.random() * gridSize)
      poisonPositions.add(`${row}-${col}`)
    }

    poisonPositions.forEach(pos => {
      const [row, col] = pos.split('-').map(Number)
      newGrid[row][col].isPoison = true
    })

    // 허브 배치 (독성 식물이 아닌 곳 중 랜덤)
    const herbPositions = new Set<string>()
    while (herbPositions.size < totalHerbs) {
      const row = Math.floor(Math.random() * gridSize)
      const col = Math.floor(Math.random() * gridSize)
      const pos = `${row}-${col}`
      
      if (!poisonPositions.has(pos)) {
        herbPositions.add(pos)
      }
    }

    herbPositions.forEach(pos => {
      const [row, col] = pos.split('-').map(Number)
      newGrid[row][col].isHerb = true
    })

    // 주변 독성 식물 개수 계산
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!newGrid[row][col].isPoison) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr
              const newCol = col + dc
              
              if (newRow >= 0 && newRow < gridSize && 
                  newCol >= 0 && newCol < gridSize &&
                  newGrid[newRow][newCol].isPoison) {
                count++
              }
            }
          }
          newGrid[row][col].neighborPoisons = count
        }
      }
    }

    setGrid(newGrid)
    return newGrid
  }

  // 게임 시작
  const startGame = () => {
    initializeGrid()
    setScore(0)
    setHerbsFound(0)
    setPoisonsFound(0)
    setGameOver(false)
    setRewards([])
    setShowResults(false)
    setGameState('playing')
  }

  // 게임 종료 처리
  const endGame = (hitPoison: boolean = false) => {
    setGameOver(true)
    setGameState('finished')
    
    // 최종 보상 계산 및 표시
    const finalRewards = calculateRewards(herbsFound, poisonsFound + (hitPoison ? 1 : 0), skillLevel)
    setRewards(finalRewards)
    setShowResults(true)
    
    // 경험치 추가 (아이템은 이미 게임 중에 지급됨)
    const { addLifeSkillXp, saveGame } = useGameStore.getState()
    const xpGain = herbsFound * 10 + poisonsFound * 5
    addLifeSkillXp('herbalism', xpGain)
    
    // 게임 저장
    saveGame()
  }

  // 셀 클릭 (왼쪽 클릭)
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || gameOver) return
    
    const cell = grid[row][col]
    if (cell.isRevealed) return

    if (cell.isPoison) {
      // 독성 식물을 클릭하면 게임 종료
      setGrid(prev => prev.map(r => r.map(c => 
        c.isPoison ? { ...c, isRevealed: true } : c
      )))
      setPoisonsFound(prev => prev + 1)
      endGame(true)
      return
    }

    // 안전한 셀 공개
    const newGrid = [...grid]
    const revealedCells = revealCell(newGrid, row, col)
    setGrid(newGrid)

    // 공개된 셀들 중 허브가 있는지 확인
    let newHerbsFound = herbsFound
    revealedCells.forEach(({ r, c }) => {
      if (newGrid[r][c].isHerb) {
        newHerbsFound++
        setScore(prev => prev + 50)
        
        // 허브 발견 시 즉시 보상 지급
        const reward = calculateSingleReward(poisonsFound, skillLevel)
        const { addMaterial, addSkillPage } = useGameStore.getState()
        if (reward.type === 'skillPage') {
          addSkillPage(reward.itemId)
        } else {
          addMaterial(reward.itemId, reward.quantity, reward.level)
        }
      } else {
        setScore(prev => prev + 10)
      }
    })
    setHerbsFound(newHerbsFound)

    // 모든 허브를 찾았으면 게임 종료
    if (newHerbsFound === totalHerbs) {
      endGame(false)
    }
  }

  // 셀 공개 (연쇄 공개 포함) - 공개된 셀들의 위치를 반환
  const revealCell = (grid: Cell[][], row: number, col: number): Array<{r: number, c: number}> => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return []
    
    const cell = grid[row][col]
    if (cell.isRevealed || cell.isPoison) return []

    cell.isRevealed = true
    const revealedCells = [{ r: row, c: col }]

    // 주변에 독성 식물이 없으면 인접 셀들도 자동으로 공개
    if (cell.neighborPoisons === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const newRevealed = revealCell(grid, row + dr, col + dc)
          revealedCells.push(...newRevealed)
        }
      }
    }

    return revealedCells
  }

  // 승리 조건 체크
  useEffect(() => {
    if (gameState === 'playing' && herbsFound === totalHerbs) {
      setGameState('finished')
      // 자동 onComplete 호출 제거 - 사용자가 완료 버튼을 눌러야 호출됨
    }
  }, [gameState, herbsFound, totalHerbs])

  // 셀 표시 내용 결정
  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) {
      return ''
    }

    if (cell.isPoison) {
      return <Bomb size={16} className="text-red-500" />
    }

    if (cell.isHerb) {
      return <Leaf size={16} className="text-green-400" />
    }

    if (cell.neighborPoisons > 0) {
      return <span className="text-blue-300 font-bold text-sm">{cell.neighborPoisons}</span>
    }

    return ''
  }

  // 셀 색상 결정
  const getCellStyle = (cell: Cell) => {
    if (!cell.isRevealed) {
      return 'bg-gray-600 hover:bg-gray-500 border-gray-500'
    }

    if (cell.isPoison) {
      return 'bg-red-600 border-red-400'
    }

    if (cell.isHerb) {
      return 'bg-green-600 border-green-400'
    }

    return 'bg-gray-700 border-gray-600'
  }

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
            <Leaf className="text-green-400" size={24} />
            채집 지뢰찾기
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
              독성 식물을 피해 허브 {totalHerbs}개를 모두 찾으세요!
            </p>
            <p className="text-sm text-gray-400 mb-6">
              💡 좌클릭: 채집<br/>
              숫자는 주변 독성 식물의 개수입니다<br/>
              레벨 {skillLevel}: 지뢰 {poisonCount}개
            </p>
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition-colors"
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
                <Leaf size={16} />
                <span>허브: {herbsFound}/{totalHerbs}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bomb size={16} />
                <span>지뢰: {poisonCount}개</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>점수: {score}</span>
              </div>
            </div>

            {/* 진행도 바 */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(herbsFound / totalHerbs) * 100}%` }}
              />
            </div>

            {/* 게임 그리드 - 고정 크기로 설정 */}
            <div className="flex justify-center mb-4">
              <div className="grid grid-cols-8 gap-1" style={{ width: 'fit-content' }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={cell.id}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all duration-200 ${getCellStyle(cell)}`}
                      disabled={gameOver}
                    >
                      {getCellContent(cell)}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showResults && (
          <div className="text-center">
            <h4 className="text-lg font-bold text-white mb-4">채집 결과</h4>
            <div className="text-left mb-4">
              <p className="text-gray-300 mb-2">허브 발견: {herbsFound}/{totalHerbs}</p>
              <p className="text-gray-300 mb-4">최종 점수: {score}</p>
              
              {rewards.length > 0 && (
                <div className="mb-4">
                  <p className="text-green-400 font-semibold mb-2">획득 아이템:</p>
                  <div className="bg-gray-700 rounded p-3 max-h-32 overflow-y-auto">
                    <div className="space-y-1">
                      {rewards.map((reward, index) => (
                        <p key={index} className="text-sm text-gray-300">
                          {reward.type === 'skillPage' ? '📖' : '🌿'} {reward.itemId} x{reward.quantity} (레벨: {reward.level})
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-blue-400 text-sm">
                채집 경험치 +{herbsFound * 10 + poisonsFound * 5}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                다시하기
              </button>
              <button
                onClick={() => {
                  onComplete(herbsFound === totalHerbs, score >= totalHerbs * 50)
                  setGameState('ready')
                  setHerbsFound(0)
                  setPoisonsFound(0)
                  setScore(0)
                  setGameOver(false)
                  setRewards([])
                  setShowResults(false)
                  setGrid(initializeGrid())
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
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

export default HerbalismMinigame 