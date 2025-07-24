import { loadItem } from './dataLoader'

export interface GeneratedItem {
  itemId: string
  uniqueId: string
  level: number
  quality: string
  enhancement: number
  quantity: number
  generatedStats: any
  element?: string
  craftedAt?: number
  craftedBy?: string
}

export type QualityType = 'Poor' | 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary'

// 고유 ID 생성
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}_${randomStr}`
}

// 품질별 색상
export const getQualityColor = (quality: string): string => {
  const qualityColors: Record<string, string> = {
    'Poor': 'text-gray-500',
    'Common': 'text-white',
    'Fine': 'text-green-400',
    'Superior': 'text-blue-400',
    'Epic': 'text-purple-400',
    'Legendary': 'text-yellow-400'
  }
  return qualityColors[quality] || 'text-white'
}

// 품질별 강화 확률 (초기 강화 레벨 확률)
export const getRandomEnhancement = (quality: string): number => {
  const enhancementChances: Record<string, number[]> = {
    'Poor': [70, 20, 8, 2, 0, 0],      // +0~+4 확률
    'Common': [50, 30, 15, 4, 1, 0],   // +0~+5 확률
    'Fine': [30, 35, 20, 10, 4, 1],    // +0~+5 확률
    'Superior': [20, 25, 25, 15, 10, 5],  // +0~+5 확률
    'Epic': [10, 20, 25, 20, 15, 10],  // +0~+5 확률
    'Legendary': [5, 15, 20, 25, 20, 15]  // +0~+5 확률
  }

  const chances = enhancementChances[quality] || enhancementChances['Common']
  const random = Math.random() * 100
  let accumulated = 0

  for (let i = 0; i < chances.length; i++) {
    accumulated += chances[i]
    if (random <= accumulated) {
      return i
    }
  }
  return 0
}

// 랜덤 스탯 생성 (기본 스탯 + 레벨 보너스 + 품질 보너스 + 강화 보너스)
export const generateRandomStats = (baseStats: any, level: number, quality: string, enhancement: number): any => {
  if (!baseStats) return null

  const qualityMultipliers: Record<string, number> = {
    'Poor': 0.8,
    'Common': 1.0,
    'Fine': 1.2,
    'Superior': 1.5,
    'Epic': 2.0,
    'Legendary': 3.0
  }

  const qualityMultiplier = qualityMultipliers[quality] || 1.0
  const levelMultiplier = 1 + (level - 1) * 0.15  // 레벨당 15% 증가
  const enhancementMultiplier = 1 + enhancement * 0.08  // 강화당 8% 증가
  
  const generatedStats: any = {}

  Object.keys(baseStats).forEach(statKey => {
    const baseStat = baseStats[statKey]
    let finalStat = baseStat * qualityMultiplier * levelMultiplier * enhancementMultiplier
    
    // 약간의 랜덤 변동 (±10%)
    const randomVariation = 0.9 + Math.random() * 0.2
    finalStat *= randomVariation
    
    // 정수로 반올림
    generatedStats[statKey] = Math.max(1, Math.round(finalStat))
  })

  return generatedStats
}

// 아이템 생성
export const generateItem = async (itemId: string, level: number, quality: string, quantity: number = 1): Promise<GeneratedItem> => {
  try {
    const itemData = await loadItem(itemId)
    if (!itemData) {
      throw new Error(`아이템 데이터를 찾을 수 없습니다: ${itemId}`)
    }

    const enhancement = getRandomEnhancement(quality)
    const generatedStats = generateRandomStats(itemData.baseStats, level, quality, enhancement)

    const generatedItem: GeneratedItem = {
      itemId,
      uniqueId: generateUniqueId(),
      level,
      quality,
      enhancement,
      quantity,
      generatedStats,
      element: itemData.element,
      craftedAt: Date.now()
    }

    console.log(`✨ 아이템 생성: ${itemData.name} (${quality}) Lv${level} +${enhancement}`, generatedStats)

    return generatedItem
  } catch (error) {
    console.error('아이템 생성 실패:', error)

    // 기본 아이템 반환
    return {
      itemId,
      uniqueId: generateUniqueId(),
      level,
      quality: 'Common',
      enhancement: 0,
      quantity,
      generatedStats: null,
      craftedAt: Date.now()
    }
  }
}

// 초기 아이템들 생성
export const generateInitialItems = async (initialItems: any[]): Promise<GeneratedItem[]> => {
  const generatedItems: GeneratedItem[] = []

  for (const item of initialItems) {
    try {
      const generatedItem = await generateItem(
        item.itemId,
        item.level || 1,
        item.quality || 'Common',
        item.quantity || 1
      )
      generatedItems.push(generatedItem)
    } catch (error) {
      console.error(`초기 아이템 ${item.itemId} 생성 실패:`, error)
    }
  }

  return generatedItems
} 