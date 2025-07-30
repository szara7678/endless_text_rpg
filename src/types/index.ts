// === 기본 게임 타입 ===
export type ThemeType = 'Flame' | 'Frost' | 'Toxic' | 'Shadow' | 'Thunder' | 'Verdant'

export type ItemQuality = 'Normal' | 'Fine' | 'Masterwork' | 'Legendary'

export type SkillType = 'Active' | 'Passive'

export type LifeSkillType = 'smithing' | 'alchemy' | 'cooking' | 'fishing' | 'farming' | 'herbalism' | 'mining'

// === 장비 및 아이템 ===
export interface EquipmentInstance {
  itemId: string
  uniqueId?: string // 장비 고유 ID
  level: number
  quality: 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary'
  enhancement: number
  traits: string[]
  
  // 장비 스탯
  physicalAttack?: number
  magicalAttack?: number
  physicalDefense?: number
  magicalDefense?: number
  speed?: number
  hp?: number
  mp?: number
}

// === 상성 스탯 ===
export interface ElementalStats {
  flame: {
    attack: number
    resistance: number
  }
  frost: {
    attack: number
    resistance: number
  }
  toxic: {
    attack: number
    resistance: number
  }
  shadow: {
    attack: number
    resistance: number
  }
  thunder: {
    attack: number
    resistance: number
  }
  verdant: {
    attack: number
    resistance: number
  }
}

// === 플레이어 상태 ===
export interface PlayerState {
  // 생명 정보
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  
  // 기본 스탯
  highestFloor: number
  
  // 재화
  gold: number
  gem: number
  ascensionPoints: number
  
  // 기본 전투 스탯 (장비 적용 전)
  basePhysicalAttack: number
  baseMagicalAttack: number
  basePhysicalDefense: number
  baseMagicalDefense: number
  baseSpeed: number
  baseMaxHp: number // 추가
  baseMaxMp: number // 추가
  
  // 계산된 전투 스탯 (장비 효과 적용 후)
  physicalAttack: number
  magicalAttack: number
  physicalDefense: number
  magicalDefense: number
  speed: number
  
  // 상성 스탯 (기본값 + 장비/스킬 보정)
  baseElementalStats: ElementalStats
  elementalStats: ElementalStats
  
  // 장비
  equipment: {
    weapon: EquipmentInstance | null
    armor: EquipmentInstance | null
    accessory: EquipmentInstance | null
  }
  
  // 환생 시스템
  rebirthLevel: number
  ascensionGauge: number
  
  // 기타
  lastDeathAt?: number
  totalPlayTime: number
}

// === 몬스터 ===
export interface Monster {
  id: string
  name: string
  description: string
  theme: ThemeType
  tier: 'normal' | 'elite' | 'boss'
  
  // 스탯 (빌드 에러 해결을 위해 추가)
  hp: number
  maxHp: number // 빌드 에러 해결
  level: number // 빌드 에러 해결
  attack: number
  defense: number
  speed: number // 추가
  
  // 보상 (기획안에 맞게 추가)
  goldReward: number // 골드 드롭량
  xpReward: number // 경험치 (기획안상 0)
  
  // 드롭
  dropTable: string
  skills: string[] // 스킬 ID 목록
  
  // 특성
  traits: string[]
  resistances: ThemeType[]
  weaknesses: ThemeType[]
}

// === 스킬 ===
export interface Skill {
  id: string
  name: string
  description: string
  type: SkillType
  element: ThemeType | 'neutral'
  
  // 발동 조건 (기획안: 매 턴 독립 확률)
  triggerChance: number // 발동 확률 (0-100)
  mpCost: number
  
  // 효과
  effects: SkillEffect[]
  
  // 습득 조건 (기획안: Page 3장으로 해금)
  requiredPages: number
  trainingRules: TrainingRule[]
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff'
  target: 'self' | 'enemy' | 'all'
  element?: ThemeType | 'physical' | 'magical' | 'neutral'
  value: number // 데미지량, 회복량, 버프량 등
  stat?: string // 버프/디버프 대상 스탯
  duration?: number // 지속 시간 (ms)
}

export interface BuffEffect {
  type: 'physicalAttack' | 'magicalAttack' | 'physicalDefense' | 'magicalDefense' | 'speed' | 'critical'
  value: number
  duration: number
}

export interface DebuffEffect {
  type: 'poison' | 'burn' | 'freeze' | 'stun'
  damage: number
  duration: number
}

export interface TrainingRule {
  on: 'cast' | 'kill' | 'killWeak' | 'perfect' // 수련 조건
  xp: number // 획득 경험치
}

// === 스킬 인스턴스 (플레이어가 보유한 스킬) ===
export interface SkillInstance {
  skillId: string
  level: number
  triggerChance: number
  currentXp?: number
  maxXp?: number
}

// === 전투 결과 ===
export interface CombatResult {
  playerDamageDealt: number
  monsterDamageDealt: number
  playerHpAfter: number
  monsterHpAfter: number
  isPlayerTurn: boolean
  isCritical: boolean
  logs: Array<{type: string, message: string}>
  skillsTriggered: string[]
  skillsUsed?: string[] // 사용된 스킬 목록 (수련치 추가용)
  lastUsedSkill?: string | null // 마지막으로 사용된 스킬 (kill 수련치용)
  isMonsterDefeated: boolean
  isPlayerDefeated: boolean
}

export interface CombatEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff'
  value: number
  target: 'player' | 'monster' | 'self' | 'enemy' // 다양한 대상 지원
  stat?: string
  duration?: number
  source?: {
    type: string
    id: string
    name: string
  }
}

// === 아이템 & 장비 ===
export interface Item {
  id: string
  name: string
  description: string
  type: 'weapon' | 'armor' | 'accessory' | 'material' | 'consumable'
  
  // 재료 (장비용)
  materials?: MaterialRequirement[]
  
  // 스탯 (장비용)
  baseStats?: ItemStats
  
  // 특성 슬롯 (품질에 따라)
  traitSlots?: number
}

export interface MaterialRequirement {
  materialId: string
  level: number
  quantity: number
}

export interface ItemStats {
  physicalAttack?: number
  magicalAttack?: number
  physicalDefense?: number
  magicalDefense?: number
  hp?: number
  mp?: number
  critical?: number
  speed?: number
}

export interface ItemInstance {
  itemId: string
  uniqueId?: string // 장비 고유 ID (장비만 사용)
  level: number
  quantity: number
  quality?: 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary'
  enhancement?: number
}

export interface ItemTrait {
  id: string
  name: string
  description: string
  effect: ItemStats
  rarity: ItemQuality
}

// === 재료 ===
export interface Material {
  id: string
  type: string
  level: number
  quantity: number
}

// === 드롭 테이블 ===
export interface DropTable {
  id: string
  theme: ThemeType
  tier: 'normal' | 'elite' | 'boss'
  
  drops: DropEntry[]
}

export interface DropEntry {
  itemId: string
  weight: number
  levelOffsetMin: number
  levelOffsetMax: number
  qualityWeights: Record<ItemQuality, number>
}

// === 인벤토리 상태 ===
export interface InventoryState {
  // 슬롯 관리
  maxSlots: number
  usedSlots: number
  
  // 아이템들
  items: ItemInstance[]
  materials: MaterialInstance[]
  consumables: ItemInstance[]
  skillPages: SkillPageInstance[]
}

export interface MaterialInstance {
  materialId: string
  name: string
  level: number
  count: number
  uniqueId?: string // 재료 고유 ID
  quality?: 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary' // 재료 품질
}

export interface SkillPageInstance {
  skillId: string
  count: number
}

// === 스킬 상태 ===
export interface SkillState {
  activeSkills: SkillInstance[]
  passiveSkills: SkillInstance[]
  pagesOwned: Record<string, number> // skillId -> count
  
  // 추가된 속성들 (빌드 에러 해결)
  skillPages: { skillId: string; count: number }[]
  learnedSkills: SkillInstance[]
}

export interface PlayerSkill {
  skillId: string
  level: number
  experience: number
  experienceNeeded: number
}

// === 생활 스킬 ===
export interface LifeSkill {
  id: LifeSkillType
  name: string
  description: string
  level: number
  currentXp: number
  maxXp: number
  unlocked: boolean
  cooldownUntil?: number // timestamp
}

export interface LifeSkillState {
  skills: Record<LifeSkillType, LifeSkill>
  activeMinigame: {
    skillType: LifeSkillType | null
    gameType: 'slot' | 'rhythm' | 'matching' | 'timing' | null
    data: any
  } | null
}

// === 미니게임 ===
export interface MinigameResult {
  success: boolean
  perfect: boolean
  rewards: {
    xp: number
    items?: { itemId: string, quantity: number }[]
    materials?: { materialId: string, quantity: number }[]
  }
}

// === 제작 시스템 ===
export interface CraftingRecipe {
  id: string
  name: string
  description: string
  skillType: LifeSkillType
  requiredLevel: number
  materials: MaterialRequirement[]
  baseQuality: number
  resultItem: string
  craftingTime: number // milliseconds
}

export interface CraftingSession {
  recipeId: string
  startTime: number
  endTime: number
  qualityBonus: number
}

// === 전투 시스템 ===
export enum CombatPhase {
  PLAYER_TURN = 'player_turn',
  MONSTER_TURN = 'monster_turn',
  COMPLETE = 'complete',
  WAITING = 'waiting'
}

export interface CombatState {
  phase: CombatPhase
  currentTurn: number
  playerTurnComplete: boolean
  monsterTurnComplete: boolean
  turnDelay: number // 턴 간 지연 시간 (ms)
}

// === 탑 상태 ===
export interface TowerState {
  currentFloor: number
  currentMonster: Monster | null
  combatLog: CombatLogEntry[]
  autoMode: boolean
  autoSpeed: number // 1x, 2x, 4x 속도
  isInCombat: boolean
  lastUsedSkill?: string | null // 마지막으로 사용된 스킬 (kill 수련치용)
  combatState?: CombatState // 턴제 전투 상태
  preventAutoCombat?: boolean // 사망 후 자동 전투 방지 플래그
  monsterKillCount?: number // 현재 층에서 처치한 몬스터 수
}

export interface CombatLogEntry {
  id: string
  timestamp: number
  type: 'combat' | 'loot' | 'floor' | 'skill' | 'death'
  message: string
}

// === UI 상태 ===
export interface UIState {
  activePanel: 'character' | 'inventory' | 'shop' | 'life' | null
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
    timestamp: number
  }>
}

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  timestamp: number
  duration?: number
}

export interface GameSettings {
  // 소리
  sfxVolume: number
  musicVolume: number
  
  // UI
  fabPosition: 'left' | 'center' | 'right'
  textSpeed: number
  
  // 게임플레이
  autoSave: boolean
  offlineRewards: boolean
  hapticFeedback: boolean
}

// === 게임 상수 ===
export interface GameConstants {
  // 레벨링
  xpCurveBase: number
  xpCurveMultiplier: number
  
  // 강화
  enhancementCostBase: number
  enhancementSuccessBase: number
  
  // 품질 보너스
  qualityMultipliers: Record<ItemQuality, number>
  qualityEnhancementLimits: Record<ItemQuality, number>
  
  // 환생
  ascensionRequiredFloor: number
  ascensionPointBase: number
}

// === 테마 정보 ===
export interface ThemeInfo {
  id: ThemeType
  name: string
  description: string
  color: string
  weakTo: ThemeType
  strongAgainst: ThemeType
  
  // 환경 효과
  envEffect: {
    name: string
    description: string
    playerEffect?: ItemStats
    monsterEffect?: ItemStats
  }
  
  // 몬스터 목록
  monsters: {
    normal: string[]
    elite: string[]
    boss: string[]
  }
} 