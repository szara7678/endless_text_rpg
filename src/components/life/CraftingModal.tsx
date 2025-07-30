import React, { useState, useEffect } from 'react'
import { X, Hammer, Clock, Star, Zap, Package, ArrowRight } from 'lucide-react'
import { useGameStore } from '../../stores'
import { LifeSkillType } from '../../types'
import { loadItem } from '../../utils/dataLoader'
import { generateItem } from '../../utils/itemGenerator'
import { getItemName } from '../../utils/itemSystem'

interface CraftingRecipe {
  id: string
  name: string
  description: string
  skillType: LifeSkillType
  requiredLevel: number
  craftingMaterials: Record<string, number>
  resultItem: {
    itemId: string
    quantity: number
  }
}

interface MaterialSelection {
  materialId: string
  selectedItems: Array<{
    uniqueId: string
    level: number
    quality: string
  }>
}

interface CraftedItem {
  name: string
  quality: string
  level: number
  quantity: number
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
  const [craftedItems, setCraftedItems] = useState<CraftedItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'accessory'>('all')
  const [showMaterialSelection, setShowMaterialSelection] = useState(false)
  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>([])
  const [materialNames, setMaterialNames] = useState<Record<string, string>>({})
  const [craftQuantity, setCraftQuantity] = useState(1)

  // 동시 제작 가능한 최대 수량 계산
  const calculateMaxCraftQuantity = () => {
    if (!selectedRecipe) return 1
    
    let maxQuantity = Infinity
    for (const [materialId, required] of Object.entries(selectedRecipe.craftingMaterials)) {
      const availableMaterials = inventory.materials.filter(m => m.materialId === materialId)
      
      // 레벨별 개수 계산
      const levelCounts = availableMaterials.reduce((acc, material) => {
        const level = material.level || 1
        acc[level] = (acc[level] || 0) + material.count
        return acc
      }, {} as Record<number, number>)
      
      // 가장 많은 개수를 가진 레벨 찾기
      const maxCount = Math.max(...Object.values(levelCounts), 0)
      const possibleQuantity = Math.floor(maxCount / required)
      maxQuantity = Math.min(maxQuantity, possibleQuantity)
    }
    
    return Math.max(1, maxQuantity)
  }

  // 재료 이름 로드
  useEffect(() => {
    if (!isOpen || !skillType) return

    const loadMaterialNames = async () => {
      const names: Record<string, string> = {}
      
      // 모든 레시피의 재료 이름을 로드
      for (const recipe of recipes) {
        for (const materialId of Object.keys(recipe.craftingMaterials)) {
          if (!names[materialId]) {
            try {
              const materialName = await getItemName(materialId)
              names[materialId] = materialName
            } catch (error) {
              console.warn(`재료 이름 로드 실패: ${materialId}`, error)
              names[materialId] = materialId.replace(/_/g, ' ')
            }
          }
        }
      }
      
      setMaterialNames(names)
    }

    if (recipes.length > 0) {
      loadMaterialNames()
    }
  }, [isOpen, skillType, recipes])

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

  // 아이템 카테고리별 필터링
  const getItemCategory = async (itemId: string): Promise<'weapon' | 'armor' | 'accessory'> => {
    try {
      const itemData = await loadItem(itemId)
      if (itemData.type === 'weapon') return 'weapon'
      if (itemData.type === 'armor') return 'armor'
      if (itemData.type === 'accessory') return 'accessory'
      return 'weapon' // 기본값
    } catch (error) {
      return 'weapon' // 기본값
    }
  }

  // 필터링된 레시피
  const [filteredRecipes, setFilteredRecipes] = useState<CraftingRecipe[]>([])

  useEffect(() => {
    const filterRecipes = async () => {
      if (selectedCategory === 'all') {
        setFilteredRecipes(recipes)
        return
      }

      const filtered = []
      for (const recipe of recipes) {
        const category = await getItemCategory(recipe.resultItem.itemId)
        if (category === selectedCategory) {
          filtered.push(recipe)
        }
      }
      setFilteredRecipes(filtered)
    }

    filterRecipes()
  }, [recipes, selectedCategory])

  // 스킬별 아이템 ID 목록 반환
  const getItemIdsBySkill = async (skill: LifeSkillType): Promise<string[]> => {
    const skillItemMap: Record<LifeSkillType, string[]> = {
      smithing: [
        // 검류
        'wooden_sword', 'iron_sword', 'flame_sword', 'frost_sword', 'shadow_sword', 'thunder_sword', 'toxic_sword', 'verdant_sword',
        // 지팡이류
        'flame_staff', 'frost_staff', 'shadow_staff', 'thunder_staff', 'toxic_staff', 'verdant_staff',
        // 갑옷류
        'leather_armor', 'flame_armor', 'frost_armor', 'shadow_armor', 'thunder_armor', 'toxic_armor', 'verdant_armor',
        // 반지류
        'flame_ring', 'frost_ring', 'shadow_ring', 'thunder_ring', 'toxic_ring', 'verdant_ring'
      ],
              alchemy: ['health_potion', 'mana_potion', 'energy_drink'],
      cooking: ['bread', 'meat_stew', 'fish_stew', 'herb_soup', 'divine_feast'],
      fishing: [],
      farming: [],
      herbalism: [],
      mining: []
    }
    return skillItemMap[skill] || []
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
    return Object.entries(recipe.craftingMaterials).every(([materialId, required]) => {
      const availableMaterials = inventory.materials.filter(m => m.materialId === materialId)
      
      // 레벨별 개수 계산
      const levelCounts = availableMaterials.reduce((acc, material) => {
        const level = material.level || 1
        acc[level] = (acc[level] || 0) + material.count
        return acc
      }, {} as Record<number, number>)
      
      // 가장 많은 개수를 가진 레벨 찾기
      const maxCount = Math.max(...Object.values(levelCounts), 0)
      return maxCount >= required
    })
  }

  const executeCraft = async (recipe: CraftingRecipe) => {
    if (!canCraft(recipe) || isCrafting) return

    setSelectedRecipe(recipe)
    setShowMaterialSelection(true)
    setCraftQuantity(1) // 동시 제작 수량 초기화
    
    // 재료 선택 초기화 (선택되지 않은 상태로)
    const selections: MaterialSelection[] = []
    for (const [materialId, required] of Object.entries(recipe.craftingMaterials)) {
      selections.push({
        materialId,
        selectedItems: []
      })
    }
    setMaterialSelections(selections)
  }

  // 재료 레벨과 제작 스킬 레벨에 따른 품질 계산 (랜덤성 포함)
  const calculateQuality = (materialSelections: MaterialSelection[], skillLevel: number) => {
    let totalMaterialLevel = 0
    let totalMaterialQuality = 0
    let materialCount = 0

    // 선택된 재료들의 평균 레벨과 품질 계산
    materialSelections.forEach(selection => {
      selection.selectedItems.forEach(item => {
        totalMaterialLevel += item.level
        totalMaterialQuality += getQualityValue(item.quality)
        materialCount++
      })
    })

    const avgMaterialLevel = totalMaterialLevel / materialCount
    const avgMaterialQuality = totalMaterialQuality / materialCount

    // 재료 레벨이 높으면 품질 확률이 올라감 (고급 재료는 더 좋은 품질)
    const materialLevelBonus = Math.min(20, avgMaterialLevel * 2)
    
    // 제작 스킬 레벨이 높으면 품질 확률이 올라감
    const skillLevelBonus = skillLevel * 5

    // 기본 품질 점수 계산
    const baseQualityScore = avgMaterialQuality + skillLevelBonus + materialLevelBonus
    
    // 랜덤성 추가 (스킬 레벨이 높을수록 랜덤 범위가 줄어듦)
    const randomRange = Math.max(5, 20 - skillLevel * 0.5) // 스킬 레벨이 높을수록 랜덤 범위 감소
    const randomBonus = (Math.random() - 0.5) * randomRange * 2 // -randomRange ~ +randomRange
    
    // 최종 품질 점수 계산
    const qualityScore = baseQualityScore + randomBonus
    const finalScore = Math.max(0, Math.min(100, qualityScore))

    // 품질 결정 (확률 기반)
    const qualityChances = calculateQualityChances(finalScore, skillLevel)
    return selectQualityByChance(qualityChances)
  }

  // 품질별 확률 계산
  const calculateQualityChances = (score: number, skillLevel: number) => {
    const baseChances = {
      Common: Math.max(0, 100 - score),
      Fine: Math.max(0, score - 20),
      Superior: Math.max(0, score - 40),
      Epic: Math.max(0, score - 60),
      Legendary: Math.max(0, score - 80)
    }

    // 스킬 레벨에 따른 보정
    const skillBonus = skillLevel * 2
    baseChances.Superior += skillBonus
    baseChances.Epic += skillBonus * 0.5
    baseChances.Legendary += skillBonus * 0.1

    // 확률 정규화
    const total = Object.values(baseChances).reduce((sum, chance) => sum + chance, 0)
    if (total === 0) {
      baseChances.Common = 100
    } else {
      Object.keys(baseChances).forEach(key => {
        baseChances[key as keyof typeof baseChances] = (baseChances[key as keyof typeof baseChances] / total) * 100
      })
    }

    return baseChances
  }

  // 확률에 따른 품질 선택
  const selectQualityByChance = (chances: Record<string, number>) => {
    const random = Math.random() * 100
    let cumulative = 0

    const qualityOrder = ['Common', 'Fine', 'Superior', 'Epic', 'Legendary']
    
    for (const quality of qualityOrder) {
      cumulative += chances[quality] || 0
      if (random <= cumulative) {
        return quality as 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary'
      }
    }
    
    return 'Common'
  }

  // 품질 값을 숫자로 변환
  const getQualityValue = (quality: string): number => {
    switch (quality) {
      case 'Common': return 20
      case 'Fine': return 40
      case 'Superior': return 60
      case 'Epic': return 80
      case 'Legendary': return 100
      default: return 20
    }
  }

  // 제작 실행
  const executeCrafting = async () => {
    if (!selectedRecipe || isCrafting) return

    // 모든 재료가 선택되었는지 확인
    const allMaterialsSelected = materialSelections.every(selection => selection.selectedItems.length > 0)
    if (!allMaterialsSelected) {
      console.warn('모든 재료가 선택되지 않았습니다.')
      return
    }

    setIsCrafting(true)

    try {
      const craftedItemsList: CraftedItem[] = []
      
      // 동시 제작 실행
      for (let i = 0; i < craftQuantity; i++) {
        // 선택된 재료 소모 (필요한 개수만큼)
        materialSelections.forEach(selection => {
          const required = selectedRecipe.craftingMaterials[selection.materialId]
          console.log(`재료 소모: ${selection.materialId}, 필요: ${required}, 선택된 개수: ${selection.selectedItems.length}`)
          
          // 선택된 재료의 레벨과 품질이 모두 같으므로, 필요한 개수만큼 소모
          if (selection.selectedItems.length > 0) {
            const selectedItem = selection.selectedItems[0] // 모든 선택된 아이템이 같은 레벨과 품질
            console.log(`재료 제거: ${selection.materialId}, 레벨: ${selectedItem.level}, 개수: ${required}`)
            removeMaterial(selection.materialId, required, selectedItem.level)
          } else {
            console.warn(`선택된 재료가 없음: ${selection.materialId}`)
          }
        })

        // 품질 계산 (각 제작마다 개별적으로)
        const quality = calculateQuality(materialSelections, skillLevel)
        
        // 아이템 레벨 계산 (재료 평균 레벨과 스킬 레벨의 평균 + 랜덤성)
        const totalSelectedItems = materialSelections.reduce((sum, selection) => sum + selection.selectedItems.length, 0)
        const avgMaterialLevel = totalSelectedItems > 0 
          ? Math.floor(materialSelections.reduce((sum, selection) => {
              return sum + selection.selectedItems.reduce((itemSum, item) => itemSum + item.level, 0)
            }, 0) / totalSelectedItems)
          : skillLevel // 선택된 재료가 없으면 스킬 레벨 사용
        
        // 기본 레벨 계산
        const baseLevel = Math.floor((avgMaterialLevel + skillLevel) / 2)
        
        // 랜덤성 추가 (스킬 레벨이 높을수록 랜덤 범위가 줄어듦)
        const randomRange = Math.max(1, 3 - skillLevel * 0.1) // 스킬 레벨이 높을수록 레벨 변동이 줄어듦
        const randomBonus = Math.floor((Math.random() - 0.5) * randomRange * 2) // -randomRange ~ +randomRange
        
        const itemLevel = Math.max(1, baseLevel + randomBonus)

        // 아이템 생성
        const itemData = await loadItem(selectedRecipe.resultItem.itemId)
        if (itemData.type === 'consumable') {
          addMaterial(selectedRecipe.resultItem.itemId, selectedRecipe.resultItem.quantity)
        } else {
          addItem(selectedRecipe.resultItem.itemId, selectedRecipe.resultItem.quantity, itemLevel, quality)
        }

        // 제작된 아이템 목록에 추가
        craftedItemsList.push({
          name: selectedRecipe.name,
          quality: quality,
          level: itemLevel,
          quantity: selectedRecipe.resultItem.quantity
        })
      }

      // 경험치 추가 (제작 수량만큼)
      addLifeSkillXp(skillType!, 25 * craftQuantity)

      // 제작된 아이템 목록 저장
      setCraftedItems(craftedItemsList)

      // 제작 완료 후 게임 저장
      const { saveGame } = useGameStore.getState()
      saveGame()

    } catch (error) {
      console.error('제작 실패:', error)
      const { addCombatLog } = useGameStore.getState()
      addCombatLog('loot', `❌ 제작 실패`)
    }

    setIsCrafting(false)
    setShowMaterialSelection(false)
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

        {/* 카테고리 필터 - 대장기술만 표시 */}
        {skillType === 'smithing' && (
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex flex-wrap gap-2">
              {['all', 'weapon', 'armor', 'accessory'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? '전체' : 
                   category === 'weapon' ? '무기' :
                   category === 'armor' ? '방어구' :
                   category === 'accessory' ? '악세서리' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 레시피 목록 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => {
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
                      <p className="text-xs text-gray-400">{recipe.description}</p>
                    </div>
                    {craftable && (
                      <ArrowRight size={16} className="text-green-400" />
                    )}
                  </div>

                  {/* 재료 목록 */}
                  <div className="space-y-2 mb-3">
                    <div className="text-xs font-medium text-gray-300">필요 재료:</div>
                    {Object.entries(recipe.craftingMaterials).map(([materialId, quantity]) => {
                      const availableMaterials = inventory.materials.filter(m => m.materialId === materialId)
                      
                      // 레벨별 개수 계산
                      const levelCounts = availableMaterials.reduce((acc, material) => {
                        const level = material.level || 1
                        acc[level] = (acc[level] || 0) + material.count
                        return acc
                      }, {} as Record<number, number>)
                      
                      // 가장 많은 개수를 가진 레벨 찾기
                      const maxCount = Math.max(...Object.values(levelCounts), 0)
                      const hasEnough = maxCount >= quantity
                      const materialName = materialNames[materialId] || materialId.replace(/_/g, ' ')

                      return (
                        <div key={materialId} className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            {materialName}
                          </span>
                          <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                            {maxCount}/{quantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* 상태 표시 */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    {craftable ? (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <Star size={12} />
                        제작 가능
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
          {filteredRecipes.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>해당 카테고리의 레시피가 없습니다.</p>
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

          {/* 재료 선택 모달 */}
          {showMaterialSelection && selectedRecipe && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60" onClick={() => setShowMaterialSelection(false)}>
              <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    🔧 재료 선택
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedRecipe.name} 제작에 사용할 재료를 선택하세요
                  </p>
                </div>

                {/* 재료 선택 목록 */}
                <div className="space-y-4 mb-4">
                  {materialSelections.map((selection, index) => {
                    const availableMaterials = inventory.materials.filter(m => m.materialId === selection.materialId)
                    const required = selectedRecipe.craftingMaterials[selection.materialId]
                    
                    // 레벨별로 정렬 (높은 레벨이 앞에 오도록)
                    const sortedMaterials = availableMaterials.sort((a, b) => (b.level || 1) - (a.level || 1))
                    
                    // 레벨별 개수 계산
                    const levelCounts = sortedMaterials.reduce((acc, material) => {
                      const level = material.level || 1
                      acc[level] = (acc[level] || 0) + material.count
                      return acc
                    }, {} as Record<number, number>)
                    
                    return (
                      <div key={index} className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">
                          {materialNames[selection.materialId] || selection.materialId.replace(/_/g, ' ')} (필요: {required}개)
                        </h4>
                        <div className="text-xs text-gray-400 mb-2">
                          보유: {Object.entries(levelCounts).map(([level, count]) => 
                            `Lv${level} ${count}개`
                          ).join(', ')}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {(() => {
                            // 레벨별로 그룹화하여 중복 제거
                            const groupedMaterials = sortedMaterials.reduce((acc, material) => {
                              const key = `${material.level || 1}_${material.quality || 'Common'}`
                              if (!acc[key]) {
                                acc[key] = {
                                  level: material.level || 1,
                                  quality: material.quality || 'Common',
                                  count: 0,
                                  materials: []
                                }
                              }
                              acc[key].count += material.count
                              acc[key].materials.push(material)
                              return acc
                            }, {} as Record<string, { level: number, quality: string, count: number, materials: any[] }>)

                            return Object.values(groupedMaterials).map((group, groupIndex) => {
                              const isSelected = selection.selectedItems.some(item => 
                                item.level === group.level && item.quality === group.quality
                              )
                              const hasEnough = group.count >= required
                              
                              return (
                                <button
                                  key={groupIndex}
                                  onClick={() => {
                                    if (!hasEnough) return // 충분한 개수가 없으면 선택 불가
                                    
                                    const newSelections = [...materialSelections]
                                    const currentSelection = newSelections[index]
                                    
                                    console.log(`재료 선택 클릭: ${selection.materialId}, 레벨: ${group.level}, 현재 선택됨: ${isSelected}`)
                                    
                                    // 기존 선택 모두 해제하고 새로운 선택만 추가
                                    currentSelection.selectedItems = []
                                    
                                    if (!isSelected) {
                                      // 선택된 재료가 없거나 다른 재료가 선택된 경우에만 선택
                                      if (currentSelection.selectedItems.length === 0) {
                                        // 필요한 개수만큼 같은 레벨의 재료 선택
                                        for (let i = 0; i < Math.min(required, group.count); i++) {
                                          currentSelection.selectedItems.push({
                                            uniqueId: group.materials[i]?.uniqueId || '',
                                            level: group.level,
                                            quality: group.quality
                                          })
                                        }
                                        console.log(`재료 선택 완료: ${selection.materialId}, 선택된 개수: ${currentSelection.selectedItems.length}`)
                                      }
                                    } else {
                                      console.log(`재료 선택 해제: ${selection.materialId}`)
                                    }
                                    
                                    setMaterialSelections(newSelections)
                                  }}
                                  className={`p-2 rounded border-2 transition-colors flex-shrink-0 ${
                                    isSelected 
                                      ? 'border-green-500 bg-green-900/30 text-green-400' 
                                      : hasEnough
                                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                        : 'border-red-600 bg-gray-800 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="text-xs whitespace-nowrap">
                                    <div>Lv {group.level}</div>
                                    <div className="text-xs opacity-75">{group.quality}</div>
                                    <div className="text-xs text-blue-400 mt-1">{group.count}개</div>
                                  </div>
                                </button>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 예상 품질 표시 */}
                <div className="text-center mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500">
                  <p className="text-blue-400 font-medium">예상 품질 (확률 포함)</p>
                  <div className="text-white text-lg mb-2">
                    {(() => {
                      const avgMaterialLevel = Math.floor(materialSelections.reduce((sum, selection) => 
                        sum + selection.selectedItems.reduce((itemSum, item) => itemSum + item.level, 0), 0
                      ) / materialSelections.reduce((sum, selection) => sum + selection.selectedItems.length, 0) || 0)
                      
                      const avgMaterialQuality = materialSelections.reduce((sum, selection) => 
                        sum + selection.selectedItems.reduce((itemSum, item) => itemSum + getQualityValue(item.quality), 0), 0
                      ) / materialSelections.reduce((sum, selection) => sum + selection.selectedItems.length, 0) || 0
                      
                      const materialLevelBonus = Math.min(20, avgMaterialLevel * 2)
                      const skillLevelBonus = skillLevel * 5
                      const baseScore = avgMaterialQuality + skillLevelBonus + materialLevelBonus
                      const chances = calculateQualityChances(baseScore, skillLevel)
                      
                      return (
                        <div>
                          <div className="mb-2">기본 점수: {Math.round(baseScore)}</div>
                          <div className="text-sm space-y-1">
                            {Object.entries(chances).map(([quality, chance]) => (
                              <div key={quality} className="flex justify-between">
                                <span>{quality}:</span>
                                <span className={chance > 20 ? 'text-green-400' : chance > 5 ? 'text-yellow-400' : 'text-gray-400'}>
                                  {chance.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                  <p className="text-gray-300 text-xs">
                    재료 레벨: {Math.floor(materialSelections.reduce((sum, selection) => 
                      sum + selection.selectedItems.reduce((itemSum, item) => itemSum + item.level, 0), 0
                    ) / materialSelections.reduce((sum, selection) => sum + selection.selectedItems.length, 0) || 0)} | 
                    스킬 레벨: {skillLevel}
                  </p>
                </div>

                {/* 동시 제작 수량 설정 */}
                <div className="text-center mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <p className="text-gray-300 font-medium mb-2">동시 제작 수량</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCraftQuantity(Math.max(1, craftQuantity - 1))}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold min-w-[3rem] text-center">
                      {craftQuantity}
                    </span>
                    <button
                      onClick={() => setCraftQuantity(Math.min(calculateMaxCraftQuantity(), craftQuantity + 1))}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    최대 {calculateMaxCraftQuantity()}개 제작 가능
                  </p>
                </div>

                {/* 재료 선택 상태 표시 */}
                {!materialSelections.every(selection => selection.selectedItems.length > 0) && (
                  <div className="text-center mb-3">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ 모든 재료를 선택해주세요
                    </p>
                  </div>
                )}

                {/* 버튼들 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowMaterialSelection(false)
                      setSelectedRecipe(null)
                      setIsCrafting(false)
                      setCraftedItems([])
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={executeCrafting}
                    disabled={isCrafting || !materialSelections.every(selection => selection.selectedItems.length > 0)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {isCrafting ? '제작 중...' : `${craftQuantity}개 제작하기`}
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* 제작 완료 결과 모달 */}
      {craftedItems.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-70">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">제작 완료!</h3>
              <p className="text-sm text-gray-400 mb-4">
                {craftedItems.length}개의 아이템을 제작했습니다
              </p>
            </div>
            
            {/* 제작된 아이템 목록 */}
            <div className="bg-gray-700 rounded p-3 mb-4 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {craftedItems.map((item, index) => (
                  <div key={index} className="text-sm text-gray-300 flex justify-between items-center py-1 border-b border-gray-600 last:border-b-0">
                    <span className="flex-1 text-left">{item.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.quality === 'Legendary' ? 'bg-yellow-900 text-yellow-300' :
                      item.quality === 'Epic' ? 'bg-purple-900 text-purple-300' :
                      item.quality === 'Superior' ? 'bg-blue-900 text-blue-300' :
                      item.quality === 'Fine' ? 'bg-green-900 text-green-300' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {item.quality}
                    </span>
                    <span className="text-blue-400 text-xs ml-2">Lv{item.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 경험치 획득 */}
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3 mb-4">
              <div className="text-blue-400 font-medium mb-2">획득 경험치</div>
              <div className="text-lg text-blue-300 font-semibold">
                +{25 * craftedItems.length} {skillType === 'smithing' ? '제작' : skillType === 'alchemy' ? '연금술' : '요리'} XP
              </div>
            </div>

            <button
              onClick={() => {
                setCraftedItems([])
                setShowMaterialSelection(false)
                setSelectedRecipe(null)
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CraftingModal 