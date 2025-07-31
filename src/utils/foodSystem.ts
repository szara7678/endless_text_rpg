import { Item } from '../types'

export interface FoodEffect {
  type: 'permanent' | 'temporary'
  stat: 'physicalAttack' | 'magicalAttack' | 'physicalDefense' | 'magicalDefense' | 'speed' | 'maxHp' | 'maxMp'
  value: number
  duration?: number // temporary 효과만 사용
}

export interface FoodData {
  itemId: string
  name: string
  description: string
  baseEffects: FoodEffect[]
  craftingMaterials: Record<string, number>
  requiredSkill: string
  requiredSkillLevel: number
}

/**
 * 음식 아이템의 효과를 계산합니다
 */
export async function calculateFoodEffects(item: Item): Promise<FoodEffect[]> {
  try {
    const itemData = await import(`../data/items/${item.itemId}.json`)
    const baseEffects = itemData.default?.baseEffects || []
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
    
    // 레벨에 따른 효과 증가 (레벨당 15% 증가)
    const levelMultiplier = 1 + (level - 1) * 0.15
    
    return baseEffects.map(effect => ({
      ...effect,
      value: Math.floor(effect.value * qualityMultiplier * levelMultiplier)
    }))
  } catch (error) {
    console.error('음식 효과 계산 실패:', error)
    return []
  }
}

/**
 * 음식 효과를 적용합니다
 */
export function applyFoodEffects(player: any, effects: FoodEffect[]): any {
  const updatedPlayer = { ...player }
  
  // 음식 스탯 초기화 (없으면 생성)
  if (!updatedPlayer.foodStats) {
    updatedPlayer.foodStats = {
      physicalAttack: 0,
      magicalAttack: 0,
      physicalDefense: 0,
      magicalDefense: 0,
      speed: 0,
      maxHp: 0,
      maxMp: 0
    }
  }
  
  effects.forEach(effect => {
    if (effect.type === 'permanent') {
      // 음식 스탯에 추가
      if (effect.stat === 'maxHp') {
        updatedPlayer.foodStats.maxHp += effect.value
        updatedPlayer.maxHp = updatedPlayer.baseMaxHp + updatedPlayer.foodStats.maxHp
        updatedPlayer.hp = Math.min(updatedPlayer.hp, updatedPlayer.maxHp)
      } else if (effect.stat === 'maxMp') {
        updatedPlayer.foodStats.maxMp += effect.value
        updatedPlayer.maxMp = updatedPlayer.baseMaxMp + updatedPlayer.foodStats.maxMp
        updatedPlayer.mp = Math.min(updatedPlayer.mp, updatedPlayer.maxMp)
      } else {
        // 다른 스탯은 음식 스탯에 추가
        updatedPlayer.foodStats[effect.stat] += effect.value
      }
    }
  })
  
  // 총 스탯 재계산 (기본 + 음식 + 장비)
  updatedPlayer.physicalAttack = updatedPlayer.basePhysicalAttack + updatedPlayer.foodStats.physicalAttack
  updatedPlayer.magicalAttack = updatedPlayer.baseMagicalAttack + updatedPlayer.foodStats.magicalAttack
  updatedPlayer.physicalDefense = updatedPlayer.basePhysicalDefense + updatedPlayer.foodStats.physicalDefense
  updatedPlayer.magicalDefense = updatedPlayer.baseMagicalDefense + updatedPlayer.foodStats.magicalDefense
  updatedPlayer.speed = updatedPlayer.baseSpeed + updatedPlayer.foodStats.speed
  
  return updatedPlayer
}

/**
 * 음식을 사용합니다
 */
export async function useFood(item: Item, player: any): Promise<{ success: boolean; message: string; updatedPlayer?: any }> {
  try {
    // 음식 효과 계산
    const effects = await calculateFoodEffects(item)
    
    if (effects.length === 0) {
      return { success: false, message: '이 음식은 효과가 없습니다.' }
    }
    
    // 효과 적용
    const updatedPlayer = applyFoodEffects(player, effects)
    
    // 효과 메시지 생성
    const effectMessages = effects.map(effect => {
      const statNames: Record<string, string> = {
        'physicalAttack': '물리 공격력',
        'magicalAttack': '마법 공격력',
        'physicalDefense': '물리 방어력',
        'magicalDefense': '마법 방어력',
        'speed': '속도',
        'maxHp': '최대 HP',
        'maxMp': '최대 MP'
      }
      return `${statNames[effect.stat]} +${effect.value}`
    })
    
    const message = `음식을 먹었습니다! (${effectMessages.join(', ')})`
    
    return {
      success: true,
      message,
      updatedPlayer
    }
  } catch (error) {
    console.error('음식 사용 실패:', error)
    return { success: false, message: '음식 사용 중 오류가 발생했습니다.' }
  }
} 