import packagesData from '../data/shop/packages.json'
import scrollsData from '../data/items/scrolls.json'

// 가중치 기반 랜덤 선택 함수
export const weightedRandom = (items: Array<{ weight: number; [key: string]: any }>) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const item of items) {
    random -= item.weight
    if (random <= 0) {
      return item
    }
  }
  
  return items[items.length - 1] // fallback
}

// 랜덤 수량 생성 함수
export const getRandomCount = (countRange: { min: number; max: number }) => {
  return Math.floor(Math.random() * (countRange.max - countRange.min + 1)) + countRange.min
}

// 패키지 데이터 로드 함수
export const getPackageData = (packageId: string) => {
  return packagesData[packageId as keyof typeof packagesData]
}

// 아이템 이름 가져오기 함수 (간단한 매핑)
export const getItemName = (itemId: string, type: 'item' | 'material' | 'skill') => {
  // 기본 아이템 이름 매핑
  const itemNames: { [key: string]: string } = {
    // 아이템
    'health_potion': '체력 물약',
    'mana_potion': '마나 물약',
    'bread': '빵',
    'meat_stew': '고기 스튜',
    'fish_stew': '생선 스튜',
    'herb_soup': '약초 수프',
    'divine_feast': '신성한 만찬',
    'exp_scroll': '경험치 스크롤',
    'gold_scroll': '골드 스크롤',
    'drop_scroll': '드롭 스크롤',
    'enhancement_scroll': '강화 스크롤',
    'rebirth_scroll': '환생 스크롤',
    
    // 재료
    'iron_ore': '철 광석',
    'wood': '나무',
    'red_herb': '빨간 약초',
    'green_herb': '초록 약초',
    'blue_herb': '파란 약초',
    'healing_herb': '치유 약초',
    'flame_crystal': '화염 결정',
    'frost_ore': '서리 광석',
    'toxic_shard': '독성 파편',
    'shadow_crystal': '그림자 결정',
    'thunder_gem': '번개 보석',
    'nature_essence': '자연의 정수',
    'common_metal': '일반 금속',
    'refined_metal': '정제된 금속',
    'wheat': '밀',

    'leather': '가죽',
    'steel_ore': '강철 광석',
    'mithril_ore': '미스릴 광석',
    'dragon_ore': '드래곤 광석',
    'flame_ore': '화염 광석',
    'toxic_ore': '독성 광석',
    'shadow_ore': '그림자 광석',
    'thunder_ore': '번개 광석',
    'verdant_ore': '푸른 광석',
    'flour': '밀가루',
    'vegetable': '야채',
    'small_fish': '작은 물고기',
    'medium_fish': '중간 물고기',
    'large_fish': '큰 물고기',
    'rare_fish': '희귀한 물고기',
    'mana_flower': '마나 꽃',
    'life_essence': '생명의 정수',
    'raw_meat': '생고기',
    
    // 스킬
    'basic_attack': '기본 공격',
    'fireball': '파이어볼',
    'ice_shard': '얼음 파편',
    'thunder_shock': '번개 충격',
    'toxic_spit': '독성 침',
    'verdant_charge': '푸른 돌진',
    'shadow_bite': '그림자 물기',
    'ember_toss': '잉걸 던지기',
    'frost_bite': '서리 물기',
    'thunder_roar': '번개 포효',
    'venom_burst': '독성 폭발',
    'flame_aura': '화염 오라',
    'dark_howl': '어둠의 울부짖음',
    'nature_blessing': '자연의 축복'
  }
  
  return itemNames[itemId] || itemId
}

// 아이템 아이콘 가져오기 함수
export const getItemIcon = (itemId: string, type: 'item' | 'material' | 'skill') => {
  // 기본 아이콘 매핑
  const itemIcons: { [key: string]: string } = {
    // 아이템
    'health_potion': '🧪',
    'mana_potion': '💙',
    'bread': '🍞',
    'meat_stew': '🍖',
    'fish_stew': '🐟',
    'herb_soup': '🥣',
    'divine_feast': '🍽️',
    'exp_scroll': '📜',
    'gold_scroll': '📜',
    'drop_scroll': '📜',
    'enhancement_scroll': '📜',
    'rebirth_scroll': '📜',
    
    // 재료
    'iron_ore': '⛏️',
    'wood': '🪵',
    'red_herb': '🌿',
    'green_herb': '🌿',
    'blue_herb': '🌿',
    'healing_herb': '🌿',
    'flame_crystal': '💎',
    'frost_ore': '⛏️',
    'toxic_shard': '💎',
    'shadow_crystal': '💎',
    'thunder_gem': '💎',
    'nature_essence': '💎',
    'common_metal': '🔧',
    'refined_metal': '🔧',
    'wheat': '🌾',

    'leather': '👜',
    'steel_ore': '⛏️',
    'mithril_ore': '⛏️',
    'dragon_ore': '⛏️',
    'flame_ore': '⛏️',
    'toxic_ore': '⛏️',
    'shadow_ore': '⛏️',
    'thunder_ore': '⛏️',
    'verdant_ore': '⛏️',
    'flour': '🌾',
    'vegetable': '🥬',
    'small_fish': '🐟',
    'medium_fish': '🐟',
    'large_fish': '🐟',
    'rare_fish': '🐟',
    'mana_flower': '🌸',
    'life_essence': '💎',
    'raw_meat': '🥩',
    
    // 스킬
    'basic_attack': '⚔️',
    'fireball': '🔥',
    'ice_shard': '❄️',
    'thunder_shock': '⚡',
    'toxic_spit': '☠️',
    'verdant_charge': '🌱',
    'shadow_bite': '🌑',
    'ember_toss': '🔥',
    'frost_bite': '❄️',
    'thunder_roar': '⚡',
    'venom_burst': '☠️',
    'flame_aura': '🔥',
    'dark_howl': '🌑',
    'nature_blessing': '🌿'
  }
  
  return itemIcons[itemId] || (type === 'skill' ? '📜' : type === 'material' ? '📦' : '🎁')
}

// 아이템 희귀도 가져오기 함수
export const getItemRarity = (itemId: string, type: 'item' | 'material' | 'skill') => {
  // 기본 희귀도 매핑
  const itemRarities: { [key: string]: string } = {
    // 아이템
    'health_potion': 'Common',
    'mana_potion': 'Common',
    'bread': 'Common',
    'meat_stew': 'Fine',
    'fish_stew': 'Fine',
    'herb_soup': 'Fine',
    'divine_feast': 'Epic',
    'exp_scroll': 'Fine',
    'gold_scroll': 'Fine',
    'drop_scroll': 'Superior',
    'enhancement_scroll': 'Epic',
    'rebirth_scroll': 'Legendary',
    
    // 재료
    'iron_ore': 'Common',
    'wood': 'Common',
    'red_herb': 'Common',
    'green_herb': 'Common',
    'blue_herb': 'Fine',
    'healing_herb': 'Fine',
    'flame_crystal': 'Superior',
    'frost_ore': 'Fine',
    'toxic_shard': 'Superior',
    'shadow_crystal': 'Superior',
    'thunder_gem': 'Superior',
    'nature_essence': 'Superior',
    'common_metal': 'Common',
    'refined_metal': 'Fine',
    'wheat': 'Common',

    'leather': 'Common',
    'steel_ore': 'Fine',
    'mithril_ore': 'Superior',
    'dragon_ore': 'Epic',
    'flame_ore': 'Fine',
    'toxic_ore': 'Fine',
    'shadow_ore': 'Fine',
    'thunder_ore': 'Fine',
    'verdant_ore': 'Fine',
    'flour': 'Common',
    'vegetable': 'Common',
    'small_fish': 'Common',
    'medium_fish': 'Fine',
    'large_fish': 'Superior',
    'rare_fish': 'Epic',
    'mana_flower': 'Fine',
    'life_essence': 'Superior',
    'raw_meat': 'Common',
    
    // 스킬
    'basic_attack': 'Common',
    'fireball': 'Fine',
    'ice_shard': 'Fine',
    'thunder_shock': 'Fine',
    'toxic_spit': 'Fine',
    'verdant_charge': 'Fine',
    'shadow_bite': 'Fine',
    'ember_toss': 'Fine',
    'frost_bite': 'Fine',
    'thunder_roar': 'Superior',
    'venom_burst': 'Superior',
    'flame_aura': 'Superior',
    'dark_howl': 'Superior',
    'nature_blessing': 'Epic'
  }
  
  return itemRarities[itemId] || 'Common'
}

// 패키지 열기 함수
export const openPackage = (packageId: string) => {
  const packageData = getPackageData(packageId)
  if (!packageData) {
    throw new Error(`Package ${packageId} not found`)
  }

  const result: Array<{
    id: string
    name: string
    count: number
    type: 'item' | 'material' | 'skill'
    rarity: string
    icon: string
  }> = []

  // 보장 아이템 추가
  if (packageData.contents?.guaranteed) {
    for (const item of packageData.contents.guaranteed) {
      const itemId = item.itemId || item.materialId || item.skillId
      const type = item.itemId ? 'item' : item.materialId ? 'material' : 'skill'
      
      result.push({
        id: itemId,
        name: getItemName(itemId, type),
        count: item.count,
        type,
        rarity: getItemRarity(itemId, type),
        icon: getItemIcon(itemId, type)
      })
    }
  }

  // 랜덤 아이템 선택
  if (packageData.contents?.random) {
    const randomCount = getRandomCount(packageData.contents.randomCount)
    
    for (let i = 0; i < randomCount; i++) {
      const selectedItem = weightedRandom(packageData.contents.random)
      const itemId = selectedItem.itemId || selectedItem.materialId || selectedItem.skillId
      const type = selectedItem.itemId ? 'item' : selectedItem.materialId ? 'material' : 'skill'
      const count = selectedItem.count?.min && selectedItem.count?.max 
        ? getRandomCount(selectedItem.count)
        : selectedItem.count || 1

      result.push({
        id: itemId,
        name: getItemName(itemId, type),
        count,
        type,
        rarity: getItemRarity(itemId, type),
        icon: getItemIcon(itemId, type)
      })
    }
  }

  return {
    packageName: packageData.name,
    items: result
  }
}

// 스크롤 효과 적용 함수
export const applyScrollEffect = (scrollId: string, player: any) => {
  const scrollData = scrollsData[scrollId as keyof typeof scrollsData]
  if (!scrollData) return

  const effects = scrollData.effects
  const currentTime = Date.now()

  // 기존 효과 제거
  if (effects && 'expBoost' in effects) {
    player.activeEffects = player.activeEffects?.filter((effect: any) => effect.type !== 'expBoost') || []
  }
  if (effects && 'goldBoost' in effects) {
    player.activeEffects = player.activeEffects?.filter((effect: any) => effect.type !== 'goldBoost') || []
  }
  if (effects && 'dropBoost' in effects) {
    player.activeEffects = player.activeEffects?.filter((effect: any) => effect.type !== 'dropBoost') || []
  }
  if (effects && 'enhancementGuarantee' in effects) {
    player.activeEffects = player.activeEffects?.filter((effect: any) => effect.type !== 'enhancementGuarantee') || []
  }

  // 새로운 효과 추가
  if (!player.activeEffects) player.activeEffects = []

  if (effects && 'expBoost' in effects) {
    player.activeEffects.push({
      type: 'expBoost',
      multiplier: effects.expBoost.multiplier,
      expiresAt: currentTime + effects.expBoost.duration
    })
  }

  if (effects && 'goldBoost' in effects) {
    player.activeEffects.push({
      type: 'goldBoost',
      multiplier: effects.goldBoost.multiplier,
      expiresAt: currentTime + effects.goldBoost.duration
    })
  }

  if (effects && 'dropBoost' in effects) {
    player.activeEffects.push({
      type: 'dropBoost',
      multiplier: effects.dropBoost.multiplier,
      expiresAt: currentTime + effects.dropBoost.duration
    })
  }

  if (effects && 'enhancementGuarantee' in effects) {
    player.activeEffects.push({
      type: 'enhancementGuarantee',
      guaranteed: effects.enhancementGuarantee.guaranteed,
      expiresAt: currentTime + effects.enhancementGuarantee.duration
    })
  }

  if (effects && 'rebirthBonus' in effects) {
    player.rebirthPoints += effects.rebirthBonus.apBonus
  }
}

// 만료된 효과 제거 함수
export const cleanupExpiredEffects = (player: any) => {
  if (!player.activeEffects) return

  const currentTime = Date.now()
  player.activeEffects = player.activeEffects.filter((effect: any) => effect.expiresAt > currentTime)
} 