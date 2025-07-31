import { Monster, Skill } from '../types'

// 몬스터 데이터 로딩
export async function loadMonster(monsterId: string): Promise<Monster | null> {
  try {
    // 동적 import를 사용하여 모든 몬스터 지원
    const monsterData = (await import(`../data/monsters/${monsterId}.json`)).default
    return monsterData as Monster
  } catch (error) {
    console.warn(`몬스터 ${monsterId} 로드 실패:`, error)
    return null
  }
}

// 스킬 데이터 로딩
export async function loadSkill(skillId: string): Promise<Skill | null> {
  try {
    let skillData: any
    
    switch (skillId) {
      case 'fireball':
        skillData = (await import('../data/skills/fireball.json')).default
        break
      case 'ember_toss':
        skillData = (await import('../data/skills/ember_toss.json')).default
        break
      case 'ice_shard':
        skillData = (await import('../data/skills/ice_shard.json')).default
        break
      case 'frost_bite':
        skillData = (await import('../data/skills/frost_bite.json')).default
        break
      default:
        console.warn(`알 수 없는 스킬: ${skillId}`)
        return null
    }
    
    return skillData as Skill
  } catch (error) {
    console.warn(`스킬 ${skillId} 로드 실패:`, error)
    return null
  }
}

// 드롭 테이블 로딩
export async function loadDropTable(dropTableId: string): Promise<any | null> {
  try {
    // 동적 import를 사용하여 모든 드롭 테이블 지원
    const dropData = (await import(`../data/drops/${dropTableId}.json`)).default
    return dropData
  } catch (error) {
    console.warn(`드롭 테이블 ${dropTableId} 로드 실패:`, error)
    return null
  }
}

// 테마 정보 로딩 (기본 구현)
export async function loadThemes(): Promise<any[]> {
  return [
    { id: 'Flame', name: '화염', weakTag: 'Frost' },
    { id: 'Frost', name: '빙결', weakTag: 'Thunder' },
    { id: 'Thunder', name: '뇌전', weakTag: 'Verdant' },
    { id: 'Verdant', name: '자연', weakTag: 'Toxic' },
    { id: 'Toxic', name: '독성', weakTag: 'Shadow' },
    { id: 'Shadow', name: '암흑', weakTag: 'Flame' }
  ]
}

// 아이템 데이터 로딩
export async function loadItem(itemId: string): Promise<any | null> {
  try {
    // 동적으로 아이템 파일 로드 시도
    try {
      const itemData = (await import(`../data/items/${itemId}.json`)).default
      return itemData
    } catch (importError) {
      // 개별 파일이 없으면 materials 폴더에서 시도
      try {
        const materialData = (await import(`../data/materials/${itemId}.json`)).default
        return materialData
      } catch (materialError) {
        // materials에도 없으면 스킬 폴더에서 시도
        try {
          const skillData = (await import(`../data/skills/${itemId}.json`)).default
          return skillData
        } catch (skillError) {
          console.warn(`알 수 없는 아이템: ${itemId}`)
          return null
        }
      }
    }
  } catch (error) {
    console.warn(`아이템 ${itemId} 로드 실패:`, error)
    return null
  }
}

// 초기 캐릭터 데이터
export async function loadInitialCharacter(): Promise<any> {
  return {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    basePhysicalAttack: 15,
    baseMagicalAttack: 10,
    basePhysicalDefense: 8,
    baseMagicalDefense: 6,
    baseSpeed: 12,
    baseMaxHp: 100,
    baseMaxMp: 50,
    critical: 5,
    gold: 1000,
    gem: 100,
    ascensionPoints: 20,
    currentFloor: 1,
    highestFloor: 1,
    ascensionGauge: 0,
    totalPlayTime: 0
  }
}

// 초기 인벤토리 데이터  
export async function loadInitialInventory(): Promise<any> {
  return {
    maxSlots: 100,
    usedSlots: 0,
    initialItems: [
      { itemId: "wooden_sword", type: "equipment", level: 1, quality: "Common", quantity: 1 },
      { itemId: "leather_armor", type: "equipment", level: 1, quality: "Common", quantity: 1 },
      { itemId: "iron_sword", type: "equipment", level: 2, quality: "Fine", quantity: 1 },
      { itemId: "flame_sword", type: "equipment", level: 3, quality: "Superior", quantity: 1 },
      { itemId: "frost_sword", type: "equipment", level: 2, quality: "Fine", quantity: 1 },
      { itemId: "shadow_sword", type: "equipment", level: 4, quality: "Epic", quantity: 1 },
      { itemId: "flame_staff", type: "equipment", level: 3, quality: "Superior", quantity: 1 },
      { itemId: "toxic_staff", type: "equipment", level: 2, quality: "Fine", quantity: 1 },
      { itemId: "thunder_staff", type: "equipment", level: 4, quality: "Epic", quantity: 1 },
      { itemId: "flame_armor", type: "equipment", level: 2, quality: "Fine", quantity: 1 },
      { itemId: "toxic_armor", type: "equipment", level: 3, quality: "Superior", quantity: 1 },
      { itemId: "verdant_armor", type: "equipment", level: 4, quality: "Epic", quantity: 1 }
    ],
    initialMaterials: [
      { materialId: "iron_ore", level: 1, count: 20 },
      { materialId: "wood", level: 1, count: 25 },
      { materialId: "red_herb", level: 1, count: 15 },
      { materialId: "healing_herb", level: 1, count: 6 },
      { materialId: "flame_crystal", level: 2, count: 10 },
      { materialId: "frost_ore", level: 1, count: 12 },
      { materialId: "toxic_shard", level: 2, count: 8 },
      { materialId: "shadow_crystal", level: 2, count: 6 },
      { materialId: "thunder_gem", level: 2, count: 7 },
      { materialId: "nature_essence", level: 2, count: 9 },
      { materialId: "common_metal", level: 1, count: 30 },
      { materialId: "refined_metal", level: 2, count: 15 },
      { materialId: "green_herb", level: 1, count: 18 },
      { materialId: "blue_herb", level: 1, count: 12 },
      { materialId: "wheat", level: 1, count: 25 },
      { materialId: "milk", level: 1, count: 10 },
      { materialId: "leather", level: 1, count: 12 }
    ],
    initialConsumables: [
      { itemId: "health_potion", level: 1, quantity: 12 },
      { itemId: "mana_potion", level: 1, quantity: 8 },
      { itemId: "bread", level: 1, quantity: 15 },
      { itemId: "meat_stew", level: 2, quantity: 8 }
    ]
  }
}

// 초기 스킬 데이터
export async function loadInitialSkills(): Promise<any> {
  return {
    activeSkills: [
      {
        skillId: "basic_attack",
        level: 1
      },
      {
        skillId: "fireball",
        level: 1
      }
    ],
    passiveSkills: [],
    pagesOwned: {}
  }
}

// 초기 타워 데이터
export async function loadInitialTower(): Promise<any> {
  return {
    currentFloor: 1,
    floorSeed: "floor_1_seed",
    envType: "Flame",
    currentMobs: [],
    currentMobIndex: 0,
    combatLog: [
      {
        id: "1",
        timestamp: 0,
        type: "floor",
        message: "1층에 도착했습니다. 모험을 시작합니다!"
      }
    ],
    autoMode: false,
    autoSpeed: 1,
    isProcessing: false
  }
} 