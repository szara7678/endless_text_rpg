// 초기 캐릭터 데이터
export const initialCharacterData = {
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
  physicalAttack: 15,
  magicalAttack: 10,
  physicalDefense: 8,
  magicalDefense: 6,
  critical: 5,
  speed: 12,
  gold: 1000,
  gem: 0,
  ascensionPoints: 0,
  currentFloor: 1,
  highestFloor: 1,
  ascensionGauge: 0,
  totalPlayTime: 0
}

// 초기 인벤토리 데이터
export const initialInventoryData = {
  maxSlots: 100,
  usedSlots: 0,
  equipment: {
    weapon: { itemId: "wooden_sword", level: 1, quality: "Common", enhancement: 0 },
    chest: { itemId: "leather_armor", level: 1, quality: "Common", enhancement: 0 },
    amulet: null
  },
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
    { itemId: "greater_health_potion", level: 2, quantity: 5 },
    { itemId: "greater_mana_potion", level: 2, quantity: 3 },

    { itemId: "energy_drink", level: 2, quantity: 2 },
    { itemId: "bread", level: 1, quantity: 15 },
    { itemId: "meat_stew", level: 2, quantity: 8 }
  ]
}

// 초기 스킬 데이터
export const initialSkillsData = {
  activeSkills: [
    {
      skillId: "basic_attack",
      level: 1,
      experience: 0,
      experienceNeeded: 100
    },
    {
      skillId: "fireball",
      level: 1,
      experience: 0,
      experienceNeeded: 100
    }
  ],
  passiveSkills: [],
  pagesOwned: {}
}

// 초기 타워 데이터
export const initialTowerData = {
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