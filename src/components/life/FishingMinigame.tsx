import React, { useState, useEffect, useCallback } from 'react'
import { X, ArrowLeft, ArrowUp, ArrowRight, Fish } from 'lucide-react'
import { useGameStore } from '../../stores'
import { loadDropTable } from '../../utils/dataLoader'
import { getItemName } from '../../utils/itemSystem'

interface FishingMinigameProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (success: boolean, perfect: boolean) => void
  skillLevel: number
}

const FishingMinigame: React.FC<FishingMinigameProps> = ({ isOpen, onClose, onComplete, skillLevel }) => {
  const { addMaterial, addSkillPage, addCombatLog, saveGame } = useGameStore()
  const [sequence, setSequence] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playerInput, setPlayerInput] = useState<string[]>([])
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [timeLeft, setTimeLeft] = useState(3000) // 3초
  const [score, setScore] = useState(0)
  const [perfect, setPerfect] = useState(true)
  const [rewards, setRewards] = useState<any[]>([])

  // 낚시 보상 테이블
  const fishingRewards = {
    fish: [
      { id: 'small_fish', name: '작은 물고기', chance: 60, minLevel: 1 },
      { id: 'medium_fish', name: '중간 물고기', chance: 30, minLevel: 3 },
      { id: 'large_fish', name: '큰 물고기', chance: 15, minLevel: 5 },
      { id: 'rare_fish', name: '희귀한 물고기', chance: 8, minLevel: 8 }
    ],
    gems: [
      { id: 'flame_gem', name: '화염 보석', chance: 5, minLevel: 5 },
      { id: 'frost_gem', name: '서리 보석', chance: 5, minLevel: 5 },
      { id: 'thunder_gem', name: '번개 보석', chance: 5, minLevel: 5 },
      { id: 'shadow_gem', name: '어둠 보석', chance: 3, minLevel: 8 },
      { id: 'toxic_gem', name: '독 보석', chance: 3, minLevel: 8 },
      { id: 'verdant_gem', name: '자연 보석', chance: 3, minLevel: 8 }
    ],
    skillPages: [
      { id: 'skill_page_random', name: '스킬 페이지', chance: 2, minLevel: 10 }
    ]
  }

  // 방향키 맵핑
  const directions = ['←', '↑', '→']
  const directionIcons = {
    '←': ArrowLeft,
    '↑': ArrowUp,
    '→': ArrowRight
  }

  // 보상 계산 함수
  const calculateRewards = async (score: number, perfect: boolean, skillLevel: number) => {
    const rewards: any[] = []
    
    try {
      // 드롭 테이블 로드
      const dropTable = await loadDropTable('fishing_rewards')
      if (!dropTable || !dropTable.drops) {
        console.warn('낚시 드롭 테이블을 찾을 수 없습니다.')
        return rewards
      }

      // 점수와 스킬 레벨에 따른 레벨 보정
      const levelBonus = Math.min(5, Math.floor(skillLevel / 2)) // 스킬 레벨 2당 +1 레벨 (최대 +5)
      const scoreBonus = Math.min(3, Math.floor(score / 30)) // 점수 30당 +1 레벨 (최대 +3)
      const totalLevelBonus = levelBonus + scoreBonus
      
      console.log('낚시 보상 계산:', {
        skillLevel,
        score,
        levelBonus,
        scoreBonus,
        totalLevelBonus
      })

      // 드롭 테이블에서 아이템 선택
      for (const drop of dropTable.drops) {
        if (Math.random() < drop.chance) {
          const quantity = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
          
          if (drop.type === 'skillPage') {
            // 스킬 페이지는 레벨 보정 없음
            const skillName = drop.itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            rewards.push({
              type: 'skillPage',
              id: drop.itemId,
              name: skillName,
              koreanName: skillName, // 스킬 페이지는 영어 이름 사용
              quantity: quantity
            })
                     } else {
             // 아이템은 레벨 보정 적용
             const adjustedLevel = Math.max(1, skillLevel + totalLevelBonus)
             console.log('아이템 생성:', {
               itemId: drop.itemId,
               baseLevel: skillLevel,
               adjustedLevel,
               quantity
             })
             
             // 한글 이름 가져오기
             const koreanName = await getItemName(drop.itemId)
             
             rewards.push({
               type: 'material',
               id: drop.itemId,
               name: drop.itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
               koreanName: koreanName,
               quantity: quantity,
               level: adjustedLevel
             })
           }
        }
      }

      // 최소 1개의 물고기는 보장
      if (rewards.filter(r => r.type === 'material' && r.id.includes('fish')).length === 0) {
        const fishItems = dropTable.drops.filter(drop => drop.itemId.includes('fish'))
        if (fishItems.length > 0) {
          const fishDrop = fishItems[Math.floor(Math.random() * fishItems.length)]
          const adjustedLevel = Math.max(1, skillLevel + totalLevelBonus)
          const koreanName = await getItemName(fishDrop.itemId)
          rewards.push({
            type: 'material',
            id: fishDrop.itemId,
            name: fishDrop.itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            koreanName: koreanName,
            quantity: fishDrop.min,
            level: adjustedLevel
          })
        }
      }

    } catch (error) {
      console.error('낚시 보상 계산 실패:', error)
    }

    return rewards
  }

  // 보상 지급 함수
  const giveRewards = (rewards: any[]) => {
    console.log('🎣 낚시 보상 지급:', rewards)
    
    rewards.forEach(reward => {
      if (reward.type === 'material') {
        addMaterial(reward.id, reward.quantity, reward.level)
        const levelText = reward.level ? ` (Lv${reward.level})` : ''
        addCombatLog('loot', `🎣 ${reward.name} ${reward.quantity}개${levelText} 획득!`)
        console.log(`📦 ${reward.name} ${reward.quantity}개 (Lv${reward.level}) 인벤토리에 추가됨`)
      } else if (reward.type === 'skillPage') {
        addSkillPage(reward.id)
        addCombatLog('loot', `📜 ${reward.name} 획득!`)
        console.log(`📜 ${reward.name} 스킬 페이지 획득!`)
      }
    })
    
    // 게임 저장
    saveGame()
    console.log('💾 낚시 완료 후 게임 저장됨')
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
      const baseScore = Math.floor(100 / sequence.length) // 각 정답당 기본 점수 (정수)
      const levelBonus = Math.min(20, skillLevel * 2) // 레벨 보너스 (최대 20점)
      const scoreGain = baseScore + levelBonus
      setScore(prev => Math.min(100, Math.floor(prev + scoreGain)))
      setCurrentIndex(prev => prev + 1)

      // 모든 시퀀스 완료 시 자동으로 게임 종료
      if (currentIndex + 1 >= sequence.length) {
        setTimeout(async () => {
          const success = score >= 50
          if (success) {
            const calculatedRewards = await calculateRewards(score, perfect, skillLevel)
            setRewards(calculatedRewards)
            // 보상 지급
            giveRewards(calculatedRewards)
          }
          setGameState('finished')
          // 게임 완료 시 바로 보상 지급
          onComplete(success, perfect)
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
      const success = score >= 50
      if (success) {
        calculateRewards(score, perfect, skillLevel).then(calculatedRewards => {
          setRewards(calculatedRewards)
          // 보상 지급
          giveRewards(calculatedRewards)
        })
      }
      setGameState('finished')
      // 시간 초과 시에도 보상 지급
      onComplete(success, perfect)
    }
  }, [gameState, timeLeft])

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
            <p className="text-gray-300 mb-4">점수: {Math.floor(score)}/100</p>

            
            {/* 획득 보상 표시 */}
            {score >= 50 && rewards.length > 0 && (
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-3 mb-4">
                <p className="text-green-400 font-medium mb-2">획득 보상</p>
                <div className="text-sm space-y-1">
                  {rewards.map((reward, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{reward.type === 'skillPage' ? '📜' : '🎣'} {reward.koreanName || reward.name}:</span>
                      <span className="text-green-400">
                        {reward.quantity}개
                        {reward.level && reward.type !== 'skillPage' && ` (Lv${reward.level})`}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>📚 낚시 경험치:</span>
                    <span className="text-blue-400">+{perfect ? 50 : 30}</span>
                  </div>
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
                  setGameState('ready') // 게임 상태를 ready로 초기화
                  setScore(0)
                  setPerfect(true)
                  setSequence([])
                  setCurrentIndex(0)
                  setPlayerInput([])
                  setTimeLeft(3000)
                  setRewards([])
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