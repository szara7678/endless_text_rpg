import React, { useState, useEffect, useCallback } from 'react'
import { X, ArrowLeft, ArrowUp, ArrowRight, Fish } from 'lucide-react'

interface FishingMinigameProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (success: boolean, perfect: boolean) => void
  skillLevel: number
}

const FishingMinigame: React.FC<FishingMinigameProps> = ({ isOpen, onClose, onComplete, skillLevel }) => {
  const [sequence, setSequence] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playerInput, setPlayerInput] = useState<string[]>([])
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [timeLeft, setTimeLeft] = useState(3000) // 3초
  const [score, setScore] = useState(0)
  const [perfect, setPerfect] = useState(true)

  // 방향키 맵핑
  const directions = ['←', '↑', '→']
  const directionIcons = {
    '←': ArrowLeft,
    '↑': ArrowUp,
    '→': ArrowRight
  }

  // 게임 시퀀스 생성 (레벨에 따라 길이 조정)
  const generateSequence = useCallback(() => {
    const sequenceLength = Math.min(10, Math.max(3, 3 + Math.floor(skillLevel / 2))) // 레벨에 따라 3~10개
    const newSequence = []
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(directions[Math.floor(Math.random() * directions.length)])
    }
    setSequence(newSequence)
  }, [skillLevel])

  // 게임 시작
  const startGame = () => {
    generateSequence()
    setCurrentIndex(0)
    setPlayerInput([])
    setGameState('playing')
    setTimeLeft(3000)
    setScore(0)
    setPerfect(true)
  }

  // 키보드 입력 처리
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return

    let inputDirection = ''
    switch (event.key) {
      case 'ArrowLeft':
        inputDirection = '←'
        break
      case 'ArrowUp':
        inputDirection = '↑'
        break
      case 'ArrowRight':
        inputDirection = '→'
        break
      default:
        return
    }

    event.preventDefault()
    handleInput(inputDirection)
  }, [gameState, currentIndex, sequence])

  // 입력 처리
  const handleInput = (direction: string) => {
    if (gameState !== 'playing' || currentIndex >= sequence.length) return

    const isCorrect = direction === sequence[currentIndex]
    setPlayerInput(prev => [...prev, direction])

    if (isCorrect) {
      // 정답 시 점수 계산 (레벨에 따라 보너스)
      const baseScore = 100 / sequence.length // 각 정답당 기본 점수
      const levelBonus = Math.min(20, skillLevel * 2) // 레벨 보너스 (최대 20점)
      const scoreGain = baseScore + levelBonus
      setScore(prev => Math.min(100, prev + scoreGain))
      setCurrentIndex(prev => prev + 1)

      // 모든 시퀀스 완료 시 자동으로 게임 종료
      if (currentIndex + 1 >= sequence.length) {
        setTimeout(() => {
          setGameState('finished')
        }, 500)
      }
    } else {
      setPerfect(false)
      // 오답 시 페널티 (레벨이 높을수록 페널티 감소)
      const penalty = Math.max(5, 15 - skillLevel)
      setScore(prev => Math.max(0, prev - penalty))
    }
  }

  // 타이머
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 100)
      }, 100)
      return () => clearTimeout(timer)
    } else if (gameState === 'playing' && timeLeft <= 0) {
      setGameState('finished')
      // onComplete 자동 호출 제거 - 사용자가 완료 버튼을 눌러야 호출됨
    }
  }, [gameState, timeLeft, onComplete])

  // 키보드 이벤트 리스너
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isOpen, handleKeyPress])

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
            <Fish className="text-blue-400" size={24} />
            낚시 리듬 게임
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
              화면에 나타나는 방향키 순서대로 입력하세요!
            </p>
            <p className="text-sm text-gray-400 mb-2">
              ← ↑ → 키를 사용하거나 버튼을 클릭하세요
            </p>
            <p className="text-sm text-blue-400 mb-6">
              레벨 {skillLevel}: {Math.min(10, Math.max(3, 3 + Math.floor(skillLevel / 2)))}개 시퀀스
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
            {/* 타이머 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>시간</span>
                <span>점수: {score}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${(timeLeft / 3000) * 100}%` }}
                />
              </div>
            </div>

            {/* 시퀀스 표시 */}
            <div className="flex justify-center gap-2 mb-6">
              {sequence.map((direction, index) => {
                const IconComponent = directionIcons[direction as keyof typeof directionIcons]
                const isCurrentTarget = index === currentIndex
                const isCompleted = index < currentIndex
                const isPlayerCorrect = playerInput[index] === direction

                return (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all ${
                      isCurrentTarget
                        ? 'border-yellow-400 bg-yellow-900/30 scale-110'
                        : isCompleted
                          ? isPlayerCorrect
                            ? 'border-green-400 bg-green-900/30'
                            : 'border-red-400 bg-red-900/30'
                          : 'border-gray-600 bg-gray-700'
                    }`}
                  >
                    <IconComponent
                      size={20}
                      className={
                        isCurrentTarget
                          ? 'text-yellow-400'
                          : isCompleted
                            ? isPlayerCorrect
                              ? 'text-green-400'
                              : 'text-red-400'
                            : 'text-gray-400'
                      }
                    />
                  </div>
                )
              })}
            </div>

            {/* 입력 버튼 */}
            <div className="flex justify-center gap-2">
              {directions.map((direction) => {
                const IconComponent = directionIcons[direction as keyof typeof directionIcons]
                return (
                  <button
                    key={direction}
                    onClick={() => handleInput(direction)}
                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <IconComponent size={20} className="text-white" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center">
            <div className="text-2xl mb-4">
              {score >= 80 ? '🎉' : score >= 50 ? '👍' : '😅'}
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {score >= 80 ? '완벽!' : score >= 50 ? '성공!' : '실패...'}
            </h4>
            <p className="text-gray-300 mb-4">점수: {score}/100</p>
            {perfect && <p className="text-yellow-400 text-sm mb-4">✨ 퍼펙트!</p>}
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                다시하기
              </button>
              <button
                onClick={() => {
                  onComplete(score >= 50, perfect)
                  setGameState('ready') // 게임 상태를 ready로 초기화
                  setScore(0)
                  setPerfect(true)
                  setSequence([])
                  setCurrentIndex(0)
                  setPlayerInput([])
                  setTimeLeft(3000)
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

export default FishingMinigame 