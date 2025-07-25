import { PlayerState, EquipmentInstance, ItemInstance } from '../types'

// 기획안: 강화 시스템 (+1당 4% 스탯 상승)
export const ENHANCEMENT_MULTIPLIER = 0.04

// 품질별 강화 상한 (기획안)
export const ENHANCEMENT_LIMITS = {
  'Normal': 5,
  'Fine': 10,
  'Masterwork': 15,
  'Legendary': 20
}

// 강화 비용 (기본 골드 + 레벨에 따른 증가)
export const ENHANCEMENT_COSTS = {
  baseCost: 100,
  levelMultiplier: 1.5,
  enhancementMultiplier: 2.0
}

/**
 * 장비를 착용합니다
 */
export function equipItem(
  player: PlayerState, 
  item: ItemInstance
): {
  success: boolean
  newPlayer: PlayerState
  message: string
} {
  const equipmentSlot = getEquipmentSlot(item.itemId)
  
  if (!equipmentSlot) {
    return {
      success: false,
      newPlayer: player,
      message: '착용할 수 없는 아이템입니다.'
    }
  }

  // 기존 장비 해제
  const newPlayer = { ...player }
  const previousEquipment = newPlayer.equipment[equipmentSlot]
  
  // 새 장비 착용
  const newEquipment: EquipmentInstance = {
    itemId: item.itemId,
    uniqueId: item.uniqueId, // uniqueId 추가
    level: item.level || 1,
    quality: getItemQuality(item.itemId) as 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary',
    enhancement: 0,
    traits: []
  }
  
  newPlayer.equipment[equipmentSlot] = newEquipment
  
  // 스탯 재계산
  const updatedPlayer = recalculatePlayerStats(newPlayer)
  
  return {
    success: true,
    newPlayer: updatedPlayer,
    message: `${item.itemId.replace('_', ' ')}을(를) 착용했습니다.`
  }
}

/**
 * 장비를 해제합니다
 */
export function unequipItem(
  player: PlayerState, 
  slot: 'weapon' | 'armor' | 'accessory'
): {
  success: boolean
  newPlayer: PlayerState
  unequippedItem: EquipmentInstance | null
  message: string
} {
  const equipment = player.equipment[slot]
  
  if (!equipment) {
    return {
      success: false,
      newPlayer: player,
      unequippedItem: null,
      message: '착용한 장비가 없습니다.'
    }
  }

  const newPlayer = { ...player }
  newPlayer.equipment[slot] = null
  
  // 스탯 재계산
  const updatedPlayer = recalculatePlayerStats(newPlayer)
  
  return {
    success: true,
    newPlayer: updatedPlayer,
    unequippedItem: equipment,
    message: `${equipment.itemId.replace('_', ' ')}을(를) 해제했습니다.`
  }
}

/**
 * 장비를 강화합니다
 */
export function enhanceEquipment(
  equipment: EquipmentInstance,
  playerGold: number
): {
  success: boolean
  newEquipment: EquipmentInstance
  goldCost: number
  message: string
} {
  const maxEnhancement = ENHANCEMENT_LIMITS[equipment.quality as keyof typeof ENHANCEMENT_LIMITS] || 5
  
  if (equipment.enhancement >= maxEnhancement) {
    return {
      success: false,
      newEquipment: equipment,
      goldCost: 0,
      message: `${equipment.quality} 품질의 최대 강화 수치입니다.`
    }
  }

  const goldCost = calculateEnhancementCost(equipment)
  
  if (playerGold < goldCost) {
    return {
      success: false,
      newEquipment: equipment,
      goldCost,
      message: '골드가 부족합니다.'
    }
  }

  // 강화 성공률 계산 (기본 80%, 강화 수치가 높을수록 감소)
  const successRate = Math.max(50, 80 - (equipment.enhancement * 5))
  const isSuccess = Math.random() * 100 < successRate

  if (isSuccess) {
    const newEquipment = {
      ...equipment,
      enhancement: equipment.enhancement + 1
    }
    
    return {
      success: true,
      newEquipment,
      goldCost,
      message: `강화에 성공했습니다! +${newEquipment.enhancement}`
    }
  } else {
    return {
      success: false,
      newEquipment: equipment,
      goldCost,
      message: '강화에 실패했습니다.'
    }
  }
}

/**
 * 강화 비용을 계산합니다
 */
export function calculateEnhancementCost(equipment: EquipmentInstance): number {
  const baseCost = ENHANCEMENT_COSTS.baseCost
  const levelCost = equipment.level * ENHANCEMENT_COSTS.levelMultiplier
  const enhancementCost = Math.pow(ENHANCEMENT_COSTS.enhancementMultiplier, equipment.enhancement)
  
  return Math.floor(baseCost * levelCost * enhancementCost)
}

/**
 * 플레이어 스탯을 재계산합니다
 */
export function recalculatePlayerStats(player: PlayerState): PlayerState {
  const newPlayer = { ...player }
  
  // 기본 스탯으로 초기화
  newPlayer.physicalAttack = newPlayer.basePhysicalAttack
  newPlayer.magicalAttack = newPlayer.baseMagicalAttack
  newPlayer.physicalDefense = newPlayer.basePhysicalDefense
  newPlayer.magicalDefense = newPlayer.baseMagicalDefense
  newPlayer.speed = newPlayer.baseSpeed
  newPlayer.maxHp = newPlayer.baseMaxHp
  newPlayer.maxMp = newPlayer.baseMaxMp
  
  // 각 장비의 스탯 적용
  Object.values(newPlayer.equipment).forEach(equipment => {
    if (equipment) {
      const itemStats = getEquipmentStats(equipment)
      
      newPlayer.physicalAttack += itemStats.physicalAttack || 0
      newPlayer.magicalAttack += itemStats.magicalAttack || 0
      newPlayer.physicalDefense += itemStats.physicalDefense || 0
      newPlayer.magicalDefense += itemStats.magicalDefense || 0
      newPlayer.speed += itemStats.speed || 0
      newPlayer.maxHp += itemStats.hp || 0
      newPlayer.maxMp += itemStats.mp || 0
    }
  })
  
  // HP/MP가 최대치를 초과하지 않도록 조정
  newPlayer.hp = Math.min(newPlayer.hp, newPlayer.maxHp)
  newPlayer.mp = Math.min(newPlayer.mp, newPlayer.maxMp)
  
  return newPlayer
}

/**
 * 장비의 스탯을 계산합니다 (강화 보너스 포함)
 */
export function getEquipmentStats(equipment: EquipmentInstance): any {
  const baseStats = getBaseEquipmentStats(equipment.itemId)
  const enhancementMultiplier = 1 + (equipment.enhancement * ENHANCEMENT_MULTIPLIER)
  
  const enhancedStats: any = {}
  Object.keys(baseStats).forEach(stat => {
    enhancedStats[stat] = Math.floor(baseStats[stat] * enhancementMultiplier)
  })
  
  return enhancedStats
}

/**
 * 아이템의 기본 스탯을 가져옵니다
 */
export function getBaseEquipmentStats(itemId: string): any {
  const equipmentStats: Record<string, any> = {
    // 무기
    'wooden_sword': {
      physicalAttack: 8,
      speed: 2
    },
    'iron_sword': {
      physicalAttack: 15,
      speed: 1
    },
    'flame_sword': {
      physicalAttack: 20,
      magicalAttack: 15, // elementalAttack.flame을 magicalAttack으로 변환
      speed: 2
    },
    'frost_sword': {
      physicalAttack: 18,
      magicalAttack: 17, // elementalAttack.frost를 magicalAttack으로 변환
      speed: 3
    },
    'shadow_sword': {
      physicalAttack: 30,
      speed: 5
    },
    'flame_staff': {
      magicalAttack: 25,
      mp: 30
    },
    'toxic_staff': {
      magicalAttack: 23,
      mp: 25
    },
    'thunder_staff': {
      magicalAttack: 40,
      mp: 40,
      speed: 5
    },
    
    // 방어구
    'leather_armor': {
      physicalDefense: 5,
      magicalDefense: 3,
      hp: 10
    },
    'flame_armor': {
      physicalDefense: 15,
      magicalDefense: 10,
      hp: 50
    },
    'toxic_armor': {
      physicalDefense: 12,
      magicalDefense: 18,
      speed: 5
    },
    'verdant_armor': {
      physicalDefense: 25,
      magicalDefense: 30,
      hp: 80
    },
    
    // 액세서리
    'basic_ring': {
      physicalAttack: 2,
      magicalAttack: 2,
      mp: 5
    }
  }
  
  return equipmentStats[itemId] || {}
}

/**
 * 아이템의 장비 슬롯을 결정합니다
 */
export function getEquipmentSlot(itemId: string): 'weapon' | 'armor' | 'accessory' | null {
  if (itemId.includes('sword') || itemId.includes('bow') || itemId.includes('staff')) {
    return 'weapon'
  }
  if (itemId.includes('armor') || itemId.includes('helmet') || itemId.includes('boots')) {
    return 'armor'
  }
  if (itemId.includes('ring') || itemId.includes('necklace') || itemId.includes('amulet')) {
    return 'accessory'
  }
  return null
}

/**
 * 아이템의 품질을 가져옵니다
 */
export function getItemQuality(itemId: string): string {
  const qualityMap: Record<string, string> = {
    'wooden_sword': 'Normal',
    'iron_sword': 'Fine',
    'leather_armor': 'Normal',
    'iron_armor': 'Fine',
    'basic_ring': 'Normal'
  }
  
  return qualityMap[itemId] || 'Normal'
} 