import React, { useState } from 'react'
import { 
  Hammer, 
  FlaskConical, 
  ChefHat, 
  Fish, 
  Sprout, 
  Leaf, 
  Mountain, 
  X, 
  Clock, 
  Zap 
} from 'lucide-react'
import { useGameStore } from '../../stores'
import CraftingModal from './CraftingModal'
import FishingMinigame from './FishingMinigame'
import FarmingSystem from './FarmingSystem'
import MiningMinigame from './MiningMinigame'
import HerbalismMinigame from './HerbalismMinigame'
import { LifeSkillType } from '../../types'

interface LifePanelProps {
  isOpen: boolean
  onClose: () => void
}

const LifePanel: React.FC<LifePanelProps> = ({ isOpen, onClose }) => {
  const { addLifeSkillXp, addItem, addCombatLog, addMaterial, life } = useGameStore()
  const [showCraftingModal, setShowCraftingModal] = useState(false)
  const [selectedCraftingSkill, setSelectedCraftingSkill] = useState<any>(null)
  const [showFishingGame, setShowFishingGame] = useState(false)
  const [showFarmingSystem, setShowFarmingSystem] = useState(false)
  const [showMiningGame, setShowMiningGame] = useState(false)
  const [showHerbalismGame, setShowHerbalismGame] = useState(false)

  // 실제 스토어의 생활 스킬 데이터 사용
  const lifeSkills = [
    { id: 'smithing', name: '제작', icon: Hammer, color: 'orange', level: life?.skills?.smithing?.level || 1, xp: life?.skills?.smithing?.currentXp || 0, maxXp: life?.skills?.smithing?.maxXp || 100 },
    { id: 'alchemy', name: '연금술', icon: FlaskConical, color: 'purple', level: life?.skills?.alchemy?.level || 1, xp: life?.skills?.alchemy?.currentXp || 0, maxXp: life?.skills?.alchemy?.maxXp || 100 },
    { id: 'cooking', name: '요리', icon: ChefHat, color: 'yellow', level: life?.skills?.cooking?.level || 1, xp: life?.skills?.cooking?.currentXp || 0, maxXp: life?.skills?.cooking?.maxXp || 100 },
    { id: 'fishing', name: '낚시', icon: Fish, color: 'blue', level: life?.skills?.fishing?.level || 1, xp: life?.skills?.fishing?.currentXp || 0, maxXp: life?.skills?.fishing?.maxXp || 100 },
    { id: 'farming', name: '농사', icon: Sprout, color: 'green', level: life?.skills?.farming?.level || 1, xp: life?.skills?.farming?.currentXp || 0, maxXp: life?.skills?.farming?.maxXp || 100 },
    { id: 'herbalism', name: '채집', icon: Leaf, color: 'emerald', level: life?.skills?.herbalism?.level || 1, xp: life?.skills?.herbalism?.currentXp || 0, maxXp: life?.skills?.herbalism?.maxXp || 100 },
    { id: 'mining', name: '광산', icon: Mountain, color: 'gray', level: life?.skills?.mining?.level || 1, xp: life?.skills?.mining?.currentXp || 0, maxXp: life?.skills?.mining?.maxXp || 100 }
  ]

  // 생활 스킬 실행
  const executeLifeSkill = (skill: any) => {
    // 제작 계열 스킬은 제작 모달 열기
    if (skill.id === 'smithing' || skill.id === 'alchemy' || skill.id === 'cooking') {
      setSelectedCraftingSkill(skill.id as LifeSkillType)
      setShowCraftingModal(true)
      return
    }

    // 낚시는 리듬 게임
    if (skill.id === 'fishing') {
      setShowFishingGame(true)
      return
    }

    // 농사는 실시간 성장 시스템
    if (skill.id === 'farming') {
      setShowFarmingSystem(true)
      return
    }

    // 광산은 매칭 게임
    if (skill.id === 'mining') {
      setShowMiningGame(true)
      return
    }

    // 채집은 지뢰찾기 게임
    if (skill.id === 'herbalism') {
      setShowHerbalismGame(true)
      return
    }

    console.log(`${skill.name} 스킬 실행!`)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="absolute top-16 left-0 right-0 bg-gray-900 border-t border-gray-700 max-h-[calc(100vh-8rem)] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            생활 스킬
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 생활 스킬 그리드 */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lifeSkills.map((skill) => {
              const IconComponent = skill.icon
              const cooldownRemaining = 0 // 쿨다운 관련 코드 제거
              const isOnCooldown = false // 쿨다운 관련 코드 제거

              return (
                <div
                  key={skill.id}
                  className={`relative bg-gray-800 rounded-lg p-3 border transition-all duration-200 ${
                    isOnCooldown 
                      ? 'border-gray-600 opacity-75' 
                      : 'border-gray-700 hover:border-gray-600 cursor-pointer hover:bg-gray-750'
                  }`}
                  onClick={() => !isOnCooldown && executeLifeSkill(skill)}
                >
                  {/* 스킬 헤더 */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-${skill.color}-600`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{skill.name}</h3>
                      <p className="text-sm text-gray-400">Lv {skill.level}</p>
                    </div>
                  </div>

                  {/* 경험치 바 */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>경험치</span>
                      <span>{skill.xp}/{skill.maxXp}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${skill.color}-500 transition-all duration-300`}
                        style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 쿨다운 또는 액션 버튼 */}
                  <div className="flex items-center justify-between">
                    {isOnCooldown ? (
                      <div className="flex items-center gap-2 text-orange-400">
                        <Clock size={14} />
                        <span className="text-sm font-medium">
                          {/* 쿨다운 포맷팅 제거 */}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400">
                        <Zap size={14} />
                        <span className="text-sm font-medium">
                          실행 가능
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      언제든지 사용 가능
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 제작 모달 */}
      <CraftingModal
        isOpen={showCraftingModal}
        skillType={selectedCraftingSkill}
        onClose={() => setShowCraftingModal(false)}
      />

      {/* 낚시 미니게임 */}
      <FishingMinigame
        isOpen={showFishingGame}
        onClose={() => setShowFishingGame(false)}
        skillLevel={life?.skills?.fishing?.level || 1}
        onComplete={(success, perfect) => {
          console.log('낚시 결과:', success ? '성공' : '실패', perfect ? '(퍼펙트!)' : '')
          // 경험치만 추가 (아이템은 미니게임 내에서 처리)
          if (success) {
            const xpGain = perfect ? 50 : 30
            addLifeSkillXp('fishing', xpGain)
          }
        }}
      />

      {/* 농사 시스템 */}
      <FarmingSystem
        isOpen={showFarmingSystem}
        onClose={() => setShowFarmingSystem(false)}
        onComplete={(success, rewards) => {
          console.log('농사 결과:', success ? '성공' : '실패', rewards)
          // 경험치와 아이템 보상
          if (success) {
            const xpGain = 40
            const cropType = 'vegetable' // 실제 아이템 ID 사용
            console.log(`농사 성공! +${xpGain} XP, ${cropType} 획득`)
            
            // 실제 경험치와 아이템 추가
            addLifeSkillXp('farming', xpGain)
            addMaterial(cropType, 3) // 농사는 기본적으로 3개 획득
          }
        }}
      />

      {/* 광산 미니게임 */}
              <MiningMinigame
          isOpen={showMiningGame}
          onClose={() => setShowMiningGame(false)}
          skillLevel={life?.skills?.mining?.level || 1}
          onComplete={(success, perfect) => {
            console.log('광산 결과:', success ? '성공' : '실패', perfect ? '(퍼펙트!)' : '')
          }}
        />

      {/* 채집 미니게임 */}
      <HerbalismMinigame
        isOpen={showHerbalismGame}
        onClose={() => setShowHerbalismGame(false)}
        skillLevel={life?.skills?.herbalism?.level || 1}
        onComplete={(success, perfect) => {
          console.log('채집 결과:', success ? '성공' : '실패', perfect ? '(퍼펙트!)' : '')
          // 경험치와 아이템 보상
          if (success) {
            const xpGain = perfect ? 45 : 25
            const herbType = perfect ? 'healing_herb' : 'healing_herb' // 실제 아이템 ID 사용
            console.log(`채집 성공! +${xpGain} XP, ${herbType} 획득`)
            
            // 실제 경험치와 아이템 추가
            addLifeSkillXp('herbalism', xpGain)
            addMaterial(herbType, perfect ? 2 : 1) // 퍼펙트면 2개, 일반 성공이면 1개
          }
        }}
      />
    </>
  )
}

export default LifePanel 