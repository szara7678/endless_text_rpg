import { PlayerState, EquipmentInstance, ItemInstance } from '../types'
import { loadItem } from './dataLoader'

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
export async function equipItem(
  player: PlayerState, 
  item: ItemInstance
): Promise<{
  success: boolean
  newPlayer: PlayerState
  message: string
}> {
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
    quality: item.quality || getItemQuality(item.itemId) as 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary',
    enhancement: item.enhancement || 0,
    traits: []
  }
  
  newPlayer.equipment[equipmentSlot] = newEquipment
  
  // 스탯 재계산
  const updatedPlayer = await recalculatePlayerStats(newPlayer)
  
  return {
    success: true,
    newPlayer: updatedPlayer,
    message: `${item.itemId.replace('_', ' ')}을(를) 착용했습니다.`
  }
}

/**
 * 장비를 해제합니다
 */
export async function unequipItem(
  player: PlayerState, 
  slot: 'weapon' | 'armor' | 'accessory'
): Promise<{
  success: boolean
  newPlayer: PlayerState
  unequippedItem: EquipmentInstance | null
  message: string
}> {
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
  const updatedPlayer = await recalculatePlayerStats(newPlayer)
  
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
export async function recalculatePlayerStats(player: PlayerState): Promise<PlayerState> {
  const newPlayer = { ...player }
  
  // 음식 스탯 초기화 (없으면 생성)
  if (!newPlayer.foodStats) {
    newPlayer.foodStats = {
      physicalAttack: 0,
      magicalAttack: 0,
      physicalDefense: 0,
      magicalDefense: 0,
      speed: 0,
      maxHp: 0,
      maxMp: 0
    }
  }
  
  // 기본 스탯 + 음식 스탯으로 초기화
  newPlayer.physicalAttack = newPlayer.basePhysicalAttack + newPlayer.foodStats.physicalAttack
  newPlayer.magicalAttack = newPlayer.baseMagicalAttack + newPlayer.foodStats.magicalAttack
  newPlayer.physicalDefense = newPlayer.basePhysicalDefense + newPlayer.foodStats.physicalDefense
  newPlayer.magicalDefense = newPlayer.baseMagicalDefense + newPlayer.foodStats.magicalDefense
  newPlayer.speed = newPlayer.baseSpeed + newPlayer.foodStats.speed
  newPlayer.maxHp = newPlayer.baseMaxHp + newPlayer.foodStats.maxHp
  newPlayer.maxMp = newPlayer.baseMaxMp + newPlayer.foodStats.maxMp
  
  // 각 장비의 스탯 적용 (비동기 처리)
  for (const equipment of Object.values(newPlayer.equipment)) {
    if (equipment) {
      const itemStats = await getEquipmentStats(equipment)
      
      newPlayer.physicalAttack += itemStats.physicalAttack || 0
      newPlayer.magicalAttack += itemStats.magicalAttack || 0
      newPlayer.physicalDefense += itemStats.physicalDefense || 0
      newPlayer.magicalDefense += itemStats.magicalDefense || 0
      newPlayer.speed += itemStats.speed || 0
      newPlayer.maxHp += itemStats.hp || 0
      newPlayer.maxMp += itemStats.mp || 0
    }
  }
  
  // HP/MP가 최대치를 초과하지 않도록 조정
  newPlayer.hp = Math.min(newPlayer.hp, newPlayer.maxHp)
  newPlayer.mp = Math.min(newPlayer.mp, newPlayer.maxMp)
  
  return newPlayer
}

/**
 * 장비의 스탯을 계산합니다 (레벨, 품질, 강화 보너스 포함)
 */
export async function getEquipmentStats(equipment: EquipmentInstance): Promise<any> {
  const baseStats = await getBaseEquipmentStats(equipment.itemId)
  
  // 품질별 배수
  const qualityMultipliers: Record<string, number> = {
    'Common': 1.0,
    'Fine': 1.2,
    'Superior': 1.5,
    'Epic': 2.0,
    'Legendary': 3.0
  }
  
  const qualityMultiplier = qualityMultipliers[equipment.quality] || 1.0
  const levelMultiplier = 1 + (equipment.level - 1) * 0.05  // 레벨당 5% 증가 (줄임)
  const enhancementMultiplier = 1 + (equipment.enhancement * 0.08)  // 강화당 8% 증가 (높임)
  
  const enhancedStats: any = {}
  Object.keys(baseStats).forEach(stat => {
    const baseStat = baseStats[stat]
    const finalStat = Math.floor(baseStat * qualityMultiplier * levelMultiplier * enhancementMultiplier)
    enhancedStats[stat] = Math.max(1, finalStat)
  })
  
  return enhancedStats
}

/**
 * 아이템의 기본 스탯을 가져옵니다
 */
export async function getBaseEquipmentStats(itemId: string): Promise<any> {
  try {
    const itemData = await loadItem(itemId)
    if (!itemData) {
      console.warn(`아이템 데이터를 찾을 수 없습니다: ${itemId}`)
      return {}
    }

    // JSON 파일의 구조에 따라 스탯 추출
    let stats: any = {}
    
    // baseStats가 있는 경우 (새로운 형식)
    if (itemData.baseStats) {
      stats = { ...itemData.baseStats }
      
      // elementalAttack을 magicalAttack으로 변환
      if (itemData.baseStats.elementalAttack) {
        const elementalAttack = itemData.baseStats.elementalAttack
        if (typeof elementalAttack === 'object') {
          // 모든 elementalAttack 값을 합산
          const totalElementalAttack = Object.values(elementalAttack).reduce((sum: number, value: any) => sum + (value || 0), 0)
          stats.magicalAttack = (stats.magicalAttack || 0) + totalElementalAttack
        } else {
          stats.magicalAttack = (stats.magicalAttack || 0) + (elementalAttack || 0)
        }
        // elementalAttack 제거
        delete stats.elementalAttack
      }
      
      // 속성 공격력을 magicalAttack으로 변환
      const elementalAttacks = ['flameAttack', 'frostAttack', 'thunderAttack', 'toxicAttack', 'shadowAttack', 'verdantAttack']
      let totalElementalAttack = 0
      
      elementalAttacks.forEach(attackType => {
        if (stats[attackType]) {
          totalElementalAttack += stats[attackType]
          delete stats[attackType]
        }
      })
      
      if (totalElementalAttack > 0) {
        stats.magicalAttack = (stats.magicalAttack || 0) + totalElementalAttack
      }
      
      // 속성 저항력을 magicalDefense로 변환
      const elementalResistances = ['flameResistance', 'frostResistance', 'thunderResistance', 'toxicResistance', 'shadowResistance', 'verdantResistance']
      let totalElementalResistance = 0
      
      elementalResistances.forEach(resistanceType => {
        if (stats[resistanceType]) {
          totalElementalResistance += stats[resistanceType]
          delete stats[resistanceType]
        }
      })
      
      if (totalElementalResistance > 0) {
        stats.magicalDefense = (stats.magicalDefense || 0) + totalElementalResistance
      }
    }
    // stats가 있는 경우 (기존 형식)
    else if (itemData.stats) {
      stats = { ...itemData.stats }
    }
    
    return stats
  } catch (error) {
    console.error(`아이템 스탯 로드 실패: ${itemId}`, error)
    return {}
  }
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