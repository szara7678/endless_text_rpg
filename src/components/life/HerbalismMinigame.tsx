import React, { useState, useEffect } from 'react'
import { X, Leaf, Skull, Flag, Eye } from 'lucide-react'

interface HerbalismMinigameProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (success: boolean, perfect: boolean) => void
}

interface Cell {
  id: string
  isHerb: boolean
  isPoison: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborPoisons: number
}

const HerbalismMinigame: React.FC<HerbalismMinigameProps> = ({ isOpen, onClose, onComplete }) => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [score, setScore] = useState(0)
  const [herbsFound, setHerbsFound] = useState(0)
  const [totalHerbs] = useState(12)
  const [flagsUsed, setFlagsUsed] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const gridSize = 8
  const poisonCount = 10

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
          isFlagged: false,
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
    setFlagsUsed(0)
    setGameOver(false)
    setGameState('playing')
  }

  // 셀 클릭 (왼쪽 클릭)
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || gameOver) return
    
    const cell = grid[row][col]
    if (cell.isRevealed || cell.isFlagged) return

    if (cell.isPoison) {
      // 독성 식물을 클릭하면 게임 오버
      setGrid(prev => prev.map(r => r.map(c => 
        c.isPoison ? { ...c, isRevealed: true } : c
      )))
      setGameOver(true)
      setGameState('finished')
      setTimeout(() => {
        onComplete(false, false)
      }, 1000)
      return
    }

    // 안전한 셀 공개
    const newGrid = [...grid]
    revealCell(newGrid, row, col)
    setGrid(newGrid)

    // 허브 발견 체크
    if (cell.isHerb) {
      setHerbsFound(prev => prev + 1)
      setScore(prev => prev + 50)
    } else {
      setScore(prev => prev + 10)
    }
  }

  // 셀 우클릭 (깃발 표시)
  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (gameState !== 'playing' || gameOver) return
    
    const cell = grid[row][col]
    if (cell.isRevealed) return

    setGrid(prev => prev.map((r, rIndex) => 
      r.map((c, cIndex) => {
        if (rIndex === row && cIndex === col) {
          const newFlagged = !c.isFlagged
          if (newFlagged) {
            setFlagsUsed(prev => prev + 1)
          } else {
            setFlagsUsed(prev => prev - 1)
          }
          return { ...c, isFlagged: newFlagged }
        }
        return c
      })
    ))
  }

  // 셀 공개 (연쇄 공개 포함)
  const revealCell = (grid: Cell[][], row: number, col: number) => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return
    
    const cell = grid[row][col]
    if (cell.isRevealed || cell.isFlagged || cell.isPoison) return

    cell.isRevealed = true

    // 주변에 독성 식물이 없으면 인접 셀들도 자동으로 공개
    if (cell.neighborPoisons === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(grid, row + dr, col + dc)
        }
      }
    }
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
      if (cell.isFlagged) {
        return <Flag size={16} className="text-red-400" />
      }
      return ''
    }

    if (cell.isPoison) {
      return <Skull size={16} className="text-red-500" />
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
      if (cell.isFlagged) {
        return 'bg-red-700 border-red-500'
      }
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
              💡 좌클릭: 채집, 우클릭: 독성 표시<br/>
              숫자는 주변 독성 식물의 개수입니다
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
                <Flag size={16} />
                <span>깃발: {flagsUsed}</span>
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

            {/* 게임 그리드 */}
            <div className="grid grid-cols-8 gap-1 mb-4">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={cell.id}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all duration-200 ${getCellStyle(cell)}`}
                    disabled={gameOver}
                  >
                    {getCellContent(cell)}
                  </button>
                ))
              )}
            </div>

            <div className="text-center text-xs text-gray-500">
              좌클릭: 채집 | 우클릭: 독성 표시
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center">
            <div className="text-2xl mb-4">
              {herbsFound === totalHerbs ? '🎉' : '💀'}
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {herbsFound === totalHerbs ? '성공!' : '실패...'}
            </h4>
            <p className="text-gray-300 mb-2">
              허브 발견: {herbsFound}/{totalHerbs}
            </p>
            <p className="text-gray-300 mb-4">
              최종 점수: {score}
            </p>
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
                  setGameState('ready') // 게임 상태를 ready로 초기화
                  setHerbsFound(0)
                  setFlagsUsed(0)
                  setScore(0)
                  setGameOver(false)
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