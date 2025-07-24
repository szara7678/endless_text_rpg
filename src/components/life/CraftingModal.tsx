import React, { useState, useEffect } from 'react'
import { X, Hammer, Clock, Star, Zap, Package, ArrowRight } from 'lucide-react'
import { useGameStore } from '../../stores'
import { LifeSkillType } from '../../types'
import { loadItem } from '../../utils/dataLoader'
import { generateItem } from '../../utils/itemGenerator'

interface CraftingRecipe {
  id: string
  name: string
  description: string
  skillType: LifeSkillType
  requiredLevel: number
  craftingMaterials: Record<string, number>
  craftingTime: number
  resultItem: {
    itemId: string
    quantity: number
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  skillType: LifeSkillType | null
}

const CraftingModal: React.FC<Props> = ({ isOpen, onClose, skillType }) => {
  const { life, inventory, addLifeSkillXp, addItem, addMaterial, removeMaterial } = useGameStore()
  const [recipes, setRecipes] = useState<CraftingRecipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null)
  const [isCrafting, setIsCrafting] = useState(false)
  const [qualityBonus, setQualityBonus] = useState(0)
  const [slots, setSlots] = useState<number[]>([0, 0, 0])
  const [showSlotGame, setShowSlotGame] = useState(false)
  const [craftedItem, setCraftedItem] = useState<any>(null)

  // 스킬별 레시피 로드 (실제 아이템 데이터에서)
  useEffect(() => {
    if (!isOpen || !skillType) return

    const loadRecipes = async () => {
      const skillRecipes: CraftingRecipe[] = []

      try {
        // 각 스킬별로 해당하는 아이템들을 찾아서 레시피로 변환
        const itemIds = await getItemIdsBySkill(skillType)
        
        for (const itemId of itemIds) {
          const itemData = await loadItem(itemId)
          if (itemData && itemData.craftingMaterials) {
            const recipe: CraftingRecipe = {
              id: `${itemId}_recipe`,
              name: itemData.name,
              description: itemData.description,
              skillType: skillType,
              requiredLevel: itemData.requirements?.requiredSkillLevel || 1,
              craftingMaterials: itemData.craftingMaterials,
              craftingTime: calculateCraftingTime(itemData),
              resultItem: {
                itemId: itemId,
                quantity: 1
              }
            }
            skillRecipes.push(recipe)
          }
        }

        setRecipes(skillRecipes)
      } catch (error) {
        console.error('레시피 로드 실패:', error)
        // 기본 레시피 사용 (fallback)
        setRecipes(getDefaultRecipes(skillType))
      }
    }
    loadRecipes()
  }, [isOpen, skillType])

  // 스킬별 아이템 ID 목록 반환
  const getItemIdsBySkill = async (skill: LifeSkillType): Promise<string[]> => {
    const skillItemMap: Record<LifeSkillType, string[]> = {
      smithing: ['iron_sword', 'flame_sword', 'frost_sword', 'shadow_sword', 'thunder_staff', 'flame_armor', 'toxic_armor', 'verdant_armor'],
      alchemy: ['health_potion', 'mana_potion', 'greater_health_potion', 'greater_mana_potion', 'stamina_potion', 'energy_drink'],
      cooking: ['bread', 'meat_stew'],
      fishing: [],
      farming: [],
      herbalism: [],
      mining: []
    }
    return skillItemMap[skill] || []
  }

  // 제작 시간 계산
  const calculateCraftingTime = (itemData: any): number => {
    const baseTime = 15000 // 15초
    const rarityMultiplier = {
      'Common': 1,
      'Fine': 1.5,
      'Superior': 2,
      'Epic': 3,
      'Legendary': 5
    }
    return baseTime * (rarityMultiplier[itemData.rarity as keyof typeof rarityMultiplier] || 1)
  }

  // 기본 레시피 (fallback)
  const getDefaultRecipes = (skill: LifeSkillType): CraftingRecipe[] => {
    if (skill === 'smithing') {
      return [
        {
          id: 'iron_sword_recipe',
          name: '철 검',
          description: '튼튼한 철로 만든 검입니다',
          skillType: 'smithing',
          requiredLevel: 1,
          craftingMaterials: { 'iron_ore': 3, 'common_metal': 2 },
          craftingTime: 30000,
          resultItem: { itemId: 'iron_sword', quantity: 1 }
        }
      ]
    }
    return []
  }

  if (!isOpen || !skillType) return null

  const currentSkill = life.skills[skillType]
  const skillLevel = currentSkill?.level || 1

  const canCraft = (recipe: CraftingRecipe) => {
    if (skillLevel < recipe.requiredLevel) return false
    
    return Object.entries(recipe.craftingMaterials).every(([materialId, required]) => {
      const material = inventory.materials.find(m => m.materialId === materialId)
      return material && material.count >= required
    })
  }

  const executeCraft = async (recipe: CraftingRecipe) => {
    if (!canCraft(recipe) || isCrafting) return

    setSelectedRecipe(recipe)
    setShowSlotGame(true)
    setQualityBonus(0)
    setSlots([0, 0, 0])
  }

  // 슬롯 게임 스핀
  const spinSlots = () => {
    if (!selectedRecipe || isCrafting) return
    
    // 재료 소모 확인 및 처리
    if (!canCraft(selectedRecipe)) {
      console.error('재료가 부족합니다.')
      return
    }
    
    // 재료 소모 (실제 구현)
    Object.entries(selectedRecipe.craftingMaterials).forEach(([materialId, count]) => {
      removeMaterial(materialId, count)
    })
    
    // 품질 보너스 초기화
    setQualityBonus(0)
    
    setIsCrafting(true)
    const symbols = ['🔥', '⚡', '💎', '⭐', '🌟', '💰']
    
    // 스핀 애니메이션 시뮬레이션
    let spinCount = 0
    const maxSpins = 20
    
    const spinInterval = setInterval(() => {
      setSlots([
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length)
      ])
      
      spinCount++
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval)
        setIsCrafting(false)
        
        // 최종 결과
        const finalReels = [
          Math.floor(Math.random() * symbols.length),
          Math.floor(Math.random() * symbols.length),
          Math.floor(Math.random() * symbols.length)
        ]
        
        setSlots(finalReels)
        
        // 보너스 계산 (3개 같으면 30점, 2개 같으면 15점)
        let bonus = 0
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          bonus = 30 // 3개 매치
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
          bonus = 15 // 2개 매치
        }
        
        setQualityBonus(bonus)
        
        // 슬롯머신 완료 후 바로 아이템 제작
        setTimeout(() => {
          completeSlotGame(bonus)
        }, 1000) // 1초 후 자동 제작
      }
    }, 100)
  }

  const completeSlotGame = async (matches: number) => {
    if (!selectedRecipe) return

    // 품질 보너스 계산
    let bonus = 0
    if (matches === 3) bonus = 30
    else if (matches === 2) bonus = 15

    setQualityBonus(bonus)

    // 제작 진행
    setTimeout(async () => {
      try {
        // 품질 계산 (스킬 레벨 + 보너스)
        const baseQuality = Math.min(100, skillLevel * 15 + bonus)
        let quality = 'Common'
        if (baseQuality >= 80) quality = 'Epic'
        else if (baseQuality >= 60) quality = 'Superior'
        else if (baseQuality >= 40) quality = 'Fine'

        // 고유 아이템 생성
        const level = Math.max(1, Math.floor(skillLevel / 2) + 1)
        const generatedItem = await generateItem(
          selectedRecipe.resultItem.itemId,
          level,
          quality,
          selectedRecipe.resultItem.quantity
        )

        // 아이템 타입에 따라 추가
        const itemData = await loadItem(selectedRecipe.resultItem.itemId)
        if (itemData.type === 'consumable') {
          // addConsumable(selectedRecipe.resultItem.itemId, selectedRecipe.resultItem.quantity)
          console.log('소모품 제작:', selectedRecipe.resultItem.itemId, selectedRecipe.resultItem.quantity)
        } else {
          addItem(selectedRecipe.resultItem.itemId, selectedRecipe.resultItem.quantity)
          console.log('장비 제작:', selectedRecipe.resultItem.itemId, selectedRecipe.resultItem.quantity)
        }

        // 경험치 추가
        addLifeSkillXp(skillType!, 25 + bonus)

        // 제작된 아이템 저장
        setCraftedItem({
          name: selectedRecipe.name,
          quality: quality,
          itemId: selectedRecipe.resultItem.itemId,
          quantity: selectedRecipe.resultItem.quantity
        })

        // 전투 로그에 제작 완료 메시지 추가
        const { addCombatLog } = useGameStore.getState()
        addCombatLog('loot', `✅ ${selectedRecipe.name} 제작 완료! (품질: ${quality})`)
        
      } catch (error) {
        console.error('제작 실패:', error)
        const { addCombatLog } = useGameStore.getState()
        addCombatLog('loot', `❌ 제작 실패`)
      }

      setIsCrafting(false)
      setQualityBonus(0)
    }, selectedRecipe.craftingTime)
  }

  // 더 만들기 함수
  const makeMore = () => {
    if (!selectedRecipe) return
    setQualityBonus(0)
    setSlots([0, 0, 0])
    setTimeout(() => {
      spinSlots()
    }, 300)
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Hammer className="text-orange-400" size={24} />
            {skillType === 'smithing' ? '대장기술' : skillType === 'alchemy' ? '연금술' : '요리'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 레시피 목록 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => {
              const craftable = canCraft(recipe)
              
              return (
                <div
                  key={recipe.id}
                  className={`bg-gray-800 rounded-lg p-4 border transition-all duration-200 ${
                    craftable
                      ? 'border-gray-600 hover:border-gray-500 cursor-pointer'
                      : 'border-red-600 opacity-75'
                  }`}
                  onClick={() => executeCraft(recipe)}
                >
                  {/* 레시피 헤더 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-600">
                      <Package size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{recipe.name}</h3>
                      <p className="text-xs text-gray-400">필요 레벨: {recipe.requiredLevel}</p>
                    </div>
                    {craftable && (
                      <ArrowRight size={16} className="text-green-400" />
                    )}
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-gray-400 mb-3">{recipe.description}</p>

                  {/* 재료 목록 */}
                  <div className="space-y-2 mb-3">
                    <div className="text-xs font-medium text-gray-300">필요 재료:</div>
                    {Object.entries(recipe.craftingMaterials).map(([materialId, quantity]) => {
                      const have = inventory.materials.find(
                        (m: any) => m.materialId === materialId
                      )?.count || 0
                      const hasEnough = have >= quantity

                      return (
                        <div key={materialId} className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            {materialId.replace(/_/g, ' ')}
                          </span>
                          <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                            {have}/{quantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* 제작 시간 */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>제작 시간: {recipe.craftingTime / 1000}초</span>
                  </div>

                  {/* 상태 표시 */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    {craftable ? (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <Star size={12} />
                        제작 가능
                      </div>
                    ) : skillLevel < recipe.requiredLevel ? (
                      <div className="text-xs text-yellow-400">
                        ⚠️ 스킬 레벨 부족 (현재: {skillLevel})
                      </div>
                    ) : (
                      <div className="text-xs text-red-400">
                        ❌ 재료 부족
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 안내 메시지 */}
          {recipes.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>해당 스킬의 레시피를 로드하고 있습니다...</p>
            </div>
          )}

          {/* 제작 안내 */}
          <div className="mt-6 text-center text-gray-400">
            <p className="text-sm">
              🔨 제작할 레시피를 클릭하여 미니게임을 시작하세요!
            </p>
            <p className="text-xs mt-2">
              💡 슬롯 게임에서 좋은 결과를 얻으면 더 높은 품질의 아이템을 제작할 수 있습니다.
            </p>
            <p className="text-xs mt-1">
              🎯 현재 스킬 레벨: {skillLevel} | 레벨이 높을수록 더 좋은 품질로 제작됩니다.
            </p>
          </div>
        </div>
      </div>

          {/* 슬롯머신 모달 */}
          {showSlotGame && selectedRecipe && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    🎰 품질 미니게임
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedRecipe.name} 제작 중...
                  </p>
                </div>

                {/* 슬롯머신 */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex justify-center gap-2 mb-4">
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl border-2 border-yellow-400"
                      >
                        {['🔥', '⚡', '💎', '⭐', '🌟', '💰'][slot]}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={spinSlots}
                      disabled={isCrafting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      {isCrafting ? '돌리는 중...' : '제작하기'}
                    </button>
                  </div>
                </div>

                {/* 품질 보너스 표시 */}
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-400">
                    현재 품질 보너스: <span className="text-yellow-400">+{qualityBonus}</span>
                  </p>
                </div>

                {/* 제작 결과 표시 */}
                {craftedItem && (
                  <div className="text-center mb-4 p-3 bg-green-900/30 rounded-lg border border-green-500">
                    <p className="text-green-400 font-medium">✅ 제작 완료!</p>
                    <p className="text-white">{craftedItem.name} (품질: {craftedItem.quality})</p>
                    <p className="text-gray-300 text-sm">{craftedItem.quantity}개 획득</p>
                  </div>
                )}

                {/* 버튼들 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSlotGame(false)
                      setSelectedRecipe(null)
                      setIsCrafting(false)
                      setCraftedItem(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setShowSlotGame(false)
                      setSelectedRecipe(null)
                      setIsCrafting(false)
                      setCraftedItem(null)
                    }}
                    disabled={isCrafting}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    제작 완료
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}

export default CraftingModal 