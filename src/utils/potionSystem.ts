import { Item } from '../types'

export interface PotionSettings {
  autoUseEnabled: boolean
  hpThreshold: number // HP 자동 사용 임계값 (0-100)
  mpThreshold: number // MP 자동 사용 임계값 (0-100)
  useHighestFirst: boolean // 높은 레벨 물약 우선 사용 여부
}

export interface PotionUsage {
  floor: number
  hpUsed: boolean
  mpUsed: boolean
}

/**
 * 아이템 레벨과 품질에 따른 회복량을 계산합니다
 */
export async function calculatePotionHeal(item: Item): Promise<number> {
  try {
    // 아이템 데이터 로드
    const itemData = await import(`../data/items/${item.itemId}.json`)
    const baseHeal = itemData.default?.baseHeal || 0
    const level = item.level || 1
    const quality = item.quality || 'Common'
    
    // 품질에 따른 배율
    const qualityMultiplier = {
      'Common': 1.0,
      'Fine': 1.2,
      'Superior': 1.5,
      'Epic': 2.0,
      'Legendary': 3.0
    }[quality] || 1.0
    
    // 레벨에 따른 회복량 증가 (레벨당 20% 증가)
    const levelMultiplier = 1 + (level - 1) * 0.2
    
    return Math.floor(baseHeal * qualityMultiplier * levelMultiplier)
  } catch (error) {
    console.error('물약 회복량 계산 실패:', error)
    return 0
  }
}

/**
 * 물약을 사용할 수 있는지 확인합니다
 */
export function canUsePotion(
  item: Item, 
  currentFloor: number, 
  usageHistory: PotionUsage[]
): boolean {
  const floorUsage = usageHistory.find(u => u.floor === currentFloor)
  if (!floorUsage) return true
  
  if (item.itemId === 'health_potion' && floorUsage.hpUsed) return false
  if (item.itemId === 'mana_potion' && floorUsage.mpUsed) return false
  
  return true
}

/**
 * 자동 물약 사용을 결정합니다
 */
export function shouldAutoUsePotion(
  playerHp: number,
  playerMaxHp: number,
  playerMp: number,
  playerMaxMp: number,
  settings: PotionSettings,
  inventory: Item[],
  currentFloor: number,
  usageHistory: PotionUsage[]
): { shouldUse: boolean; itemId: string | null; potionItem?: Item } {
  if (!settings.autoUseEnabled) {
    return { shouldUse: false, itemId: null }
  }
  
  const hpPercentage = (playerHp / playerMaxHp) * 100
  const mpPercentage = (playerMp / playerMaxMp) * 100
  
  // HP 자동 사용 체크
  if (hpPercentage < settings.hpThreshold) {
    const hpPotions = inventory.filter(item => 
      item.itemId === 'health_potion' && 
      canUsePotion(item, currentFloor, usageHistory)
    )
    
    if (hpPotions.length > 0) {
      // 레벨과 품질을 고려한 정렬
      const sortedPotions = hpPotions.sort((a, b) => {
        const aLevel = a.level || 1
        const bLevel = b.level || 1
        const aQuality = a.quality || 'Common'
        const bQuality = b.quality || 'Common'
        
        // 품질 우선순위
        const qualityOrder = { 'Common': 1, 'Fine': 2, 'Superior': 3, 'Epic': 4, 'Legendary': 5 }
        const aQualityScore = qualityOrder[aQuality as keyof typeof qualityOrder] || 1
        const bQualityScore = qualityOrder[bQuality as keyof typeof qualityOrder] || 1
        
        if (settings.useHighestFirst) {
          // 높은 레벨/품질 우선
          if (aLevel !== bLevel) return bLevel - aLevel
          return bQualityScore - aQualityScore
        } else {
          // 낮은 레벨/품질 우선
          if (aLevel !== bLevel) return aLevel - bLevel
          return aQualityScore - bQualityScore
        }
      })
      
      const bestPotion = sortedPotions[0]
      return { shouldUse: true, itemId: bestPotion.itemId, potionItem: bestPotion }
    }
  }
  
  // MP 자동 사용 체크
  if (mpPercentage < settings.mpThreshold) {
    const mpPotions = inventory.filter(item => 
      item.itemId === 'mana_potion' && 
      canUsePotion(item, currentFloor, usageHistory)
    )
    
    if (mpPotions.length > 0) {
      // 레벨과 품질을 고려한 정렬
      const sortedPotions = mpPotions.sort((a, b) => {
        const aLevel = a.level || 1
        const bLevel = b.level || 1
        const aQuality = a.quality || 'Common'
        const bQuality = b.quality || 'Common'
        
        // 품질 우선순위
        const qualityOrder = { 'Common': 1, 'Fine': 2, 'Superior': 3, 'Epic': 4, 'Legendary': 5 }
        const aQualityScore = qualityOrder[aQuality as keyof typeof qualityOrder] || 1
        const bQualityScore = qualityOrder[bQuality as keyof typeof qualityOrder] || 1
        
        if (settings.useHighestFirst) {
          // 높은 레벨/품질 우선
          if (aLevel !== bLevel) return bLevel - aLevel
          return bQualityScore - aQualityScore
        } else {
          // 낮은 레벨/품질 우선
          if (aLevel !== bLevel) return aLevel - bLevel
          return aQualityScore - bQualityScore
        }
      })
      
      const bestPotion = sortedPotions[0]
      return { shouldUse: true, itemId: bestPotion.itemId, potionItem: bestPotion }
    }
  }
  
  return { shouldUse: false, itemId: null }
}

/**
 * 물약 사용 기록을 업데이트합니다
 */
export function updatePotionUsage(
  itemId: string,
  currentFloor: number,
  usageHistory: PotionUsage[]
): PotionUsage[] {
  const floorUsage = usageHistory.find(u => u.floor === currentFloor)
  
  if (floorUsage) {
    if (itemId === 'health_potion') {
      floorUsage.hpUsed = true
    } else if (itemId === 'mana_potion') {
      floorUsage.mpUsed = true
    }
    return usageHistory
  } else {
    return [
      ...usageHistory,
      {
        floor: currentFloor,
        hpUsed: itemId === 'health_potion',
        mpUsed: itemId === 'mana_potion'
      }
    ]
  }
} 