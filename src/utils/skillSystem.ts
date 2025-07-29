import { PlayerState, SkillInstance, ThemeType } from '../types'
import { loadSkill } from './dataLoader'

// 기획안: Page 3장으로 스킬 해금
export const SKILL_UNLOCK_PAGES_REQUIRED = 3

// 기획안: 필요 XP는 레벨업 시마다 1.8배 증가
export const XP_MULTIPLIER = 1.8

// 기획안: AP + 골드 비용으로 레벨업
export const LEVEL_UP_COSTS = {
  AP_PER_LEVEL: 1,      // 레벨당 AP 1개
  GOLD_BASE: 100,       // 기본 골드 비용
  GOLD_MULTIPLIER: 1.5  // 레벨당 골드 비용 증가율
}

// 발동률 증가 레벨 (특정 레벨에서만 상승)
export const TRIGGER_CHANCE_LEVELS = [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100]
export const MAX_TRIGGER_CHANCE = 95 // 최대 발동률 95%

// 수련치 이벤트 타입 (기획안의 trainingRules)
export type TrainingEvent = 'cast' | 'killWeak' | 'perfect' | 'kill'

// 기본 수련치 양
export const TRAINING_XP = {
  cast: 1,        // 스킬 사용시
  killWeak: 20,   // 상성 유리한 적 처치시
  perfect: 15,    // 미니게임 Perfect 달성시
  kill: 5         // 일반 적 처치시
}

/**
 * 스킬 해금 가능 여부를 확인합니다
 * 기획안: Page 3장으로 Lv 1 해금
 */
export function canUnlockSkill(skillId: string, ownedPages: Record<string, number>): boolean {
  const pageCount = ownedPages[skillId] || 0
  return pageCount >= SKILL_UNLOCK_PAGES_REQUIRED
}

/**
 * 스킬을 해금합니다
 * 기획안: Page 3장 소모 → Lv 1 스킬 획득
 */
export function unlockSkill(
  skillId: string, 
  ownedPages: Record<string, number>,
  activeSkills: SkillInstance[],
  passiveSkills: SkillInstance[]
): {
  success: boolean
  newActiveSkills: SkillInstance[]
  newPassiveSkills: SkillInstance[]
  newPagesOwned: Record<string, number>
  message: string
} {
  if (!canUnlockSkill(skillId, ownedPages)) {
    return {
      success: false,
      newActiveSkills: activeSkills,
      newPassiveSkills: passiveSkills,
      newPagesOwned: ownedPages,
      message: `${skillId} 해금에 필요한 페이지가 부족합니다. (${ownedPages[skillId] || 0}/3)`
    }
  }

  // 이미 보유한 스킬인지 확인
  const hasActive = activeSkills.some(skill => skill.skillId === skillId)
  const hasPassive = passiveSkills.some(skill => skill.skillId === skillId)
  
  if (hasActive || hasPassive) {
    return {
      success: false,
      newActiveSkills: activeSkills,
      newPassiveSkills: passiveSkills,
      newPagesOwned: ownedPages,
      message: `${skillId}은(는) 이미 보유한 스킬입니다.`
    }
  }

  // 새 스킬 인스턴스 생성 (Lv 1)
  const newSkillInstance: SkillInstance = {
    skillId,
    level: 1,
    triggerChance: getTriggerChanceForLevel(1), // 레벨에 따른 발동률
    currentXp: 0,
    maxXp: calculateRequiredXp(1)
  }

  // 스킬 타입에 따라 분류 (임시로 basic_attack은 액티브, 나머지는 패시브)
  const isActiveSkill = skillId.includes('attack') || skillId.includes('fireball') || skillId.includes('ice_shard')

  // Page 소모
  const newPagesOwned = {
    ...ownedPages,
    [skillId]: (ownedPages[skillId] || 0) - SKILL_UNLOCK_PAGES_REQUIRED
  }

  return {
    success: true,
    newActiveSkills: isActiveSkill ? [...activeSkills, newSkillInstance] : activeSkills,
    newPassiveSkills: !isActiveSkill ? [...passiveSkills, newSkillInstance] : passiveSkills,
    newPagesOwned,
    message: `🎉 ${skillId} 스킬을 해금했습니다! (Lv 1)`
  }
}

/**
 * 레벨별 필요 경험치를 계산합니다
 * 기획안: 필요 XP ×1.8
 */
export function calculateRequiredXp(level: number): number {
  const baseXp = 100
  return Math.floor(baseXp * Math.pow(XP_MULTIPLIER, level - 1))
}

/**
 * 레벨에 따른 발동률을 계산합니다
 * 특정 레벨에서만 발동률이 상승
 */
export function getTriggerChanceForLevel(level: number): number {
  // 기본 발동률 계산
  let triggerChance = 10 // 기본 10%
  
  // 발동률 증가 레벨에 도달했는지 확인
  for (const triggerLevel of TRIGGER_CHANCE_LEVELS) {
    if (level >= triggerLevel) {
      triggerChance += 5 // 5%씩 증가
    } else {
      break
    }
  }
  
  return Math.min(triggerChance, MAX_TRIGGER_CHANCE)
}

/**
 * 스킬 대미지 계산
 */
export function calculateSkillDamage(skillData: any, playerLevel: number, playerStats: any, skillLevel: number = 1): {
  magicDamage: number
  physicalDamage: number
  totalDamage: number
  elementalBonus: number
} {
  const { damageCalculation } = skillData
  
  if (!damageCalculation) {
    return {
      magicDamage: 0,
      physicalDamage: 0,
      totalDamage: 0,
      elementalBonus: 1.0
    }
  }

  const { baseMagicAtk, basePhysicalAtk, levelScaling, elementalBonus } = damageCalculation

  // 마법 대미지 계산
  const magicDamage = Math.floor(
    (baseMagicAtk + (skillLevel - 1) * levelScaling) * 
    (playerStats.magicalAttack / 100)
  )

  // 물리 대미지 계산
  const physicalDamage = Math.floor(
    (basePhysicalAtk + (skillLevel - 1) * levelScaling) * 
    (playerStats.physicalAttack / 100)
  )

  const totalDamage = magicDamage + physicalDamage

  return {
    magicDamage,
    physicalDamage,
    totalDamage,
    elementalBonus: elementalBonus || 1.0
  }
}

/**
 * 스킬 레벨업 비용 계산
 */
export function calculateLevelUpCost(skillData: any, currentLevel: number): number {
  const { levelUpCost } = skillData
  
  if (!levelUpCost) {
    return 1 // 기본값
  }

  const { baseAp, apScaling } = levelUpCost
  return Math.floor(baseAp * Math.pow(apScaling, currentLevel - 1))
}

/**
 * 스킬 레벨업 가능 여부를 확인합니다
 */
export function canLevelUpSkill(
  skill: SkillInstance, 
  playerAP: number, 
  playerGold: number
): { 
  canLevel: boolean
  reason: string 
} {
  // 경험치 체크
  if ((skill.currentXp || 0) < (skill.maxXp || 0)) {
    return { canLevel: false, reason: '경험치가 부족합니다.' }
  }

  const costs = calculateLevelUpCost(skill.level)

  // AP 체크
  if (playerAP < costs.apCost) {
    return { canLevel: false, reason: 'AP가 부족합니다.' }
  }

  // 골드 체크
  if (playerGold < costs.goldCost) {
    return { canLevel: false, reason: '골드가 부족합니다.' }
  }

  return { canLevel: true, reason: '' }
}

/**
 * 스킬을 레벨업합니다
 * 무제한 레벨업 가능하지만 발동률은 특정 레벨에서만 상승
 */
export function levelUpSkill(skill: SkillInstance): {
  newSkill: SkillInstance
  apCost: number
  goldCost: number
} {
  const costs = calculateLevelUpCost(skill.level)
  const newLevel = skill.level + 1
  
  // 새 레벨에 따른 발동률 계산
  const newTriggerChance = getTriggerChanceForLevel(newLevel)

  const newSkill: SkillInstance = {
    ...skill,
    level: newLevel,
    triggerChance: newTriggerChance,
    currentXp: 0,
    maxXp: calculateRequiredXp(newLevel)
  }

  return {
    newSkill,
    apCost: costs.apCost,
    goldCost: costs.goldCost
  }
}

/**
 * 수련치를 추가합니다
 * 기획안: cast, killWeak, perfect 등의 이벤트
 */
export function addTrainingXp(
  skill: SkillInstance, 
  event: TrainingEvent, 
  customAmount?: number
): SkillInstance {
  const xpGain = customAmount || TRAINING_XP[event] || 0
  
  return {
    ...skill,
    currentXp: Math.min(
      (skill.currentXp || 0) + xpGain, 
      skill.maxXp || 0
    )
  }
}

/**
 * 스킬별 속성을 반환합니다
 * 기획안: 스킬별 속성 설정
 */
export function getSkillElement(skillId: string): ThemeType | 'physical' | 'magical' | 'neutral' {
  // 스킬 ID 기반 속성 매핑
  const elementMap: Record<string, ThemeType | 'physical' | 'magical' | 'neutral'> = {
    // 화염 스킬
    'fireball': 'Flame',
    'flame_aura': 'Flame',
    'ember_toss': 'Flame',
    
    // 빙결 스킬  
    'ice_shard': 'Frost',
    'frost_bite': 'Frost',
    
    // 기본 공격
    'basic_attack': 'physical',
    
    // 기타
    'healing': 'neutral',
    'meditation': 'neutral'
  }

  return elementMap[skillId] || 'neutral'
}

/**
 * 스킬 사용시 수련치를 적용합니다
 */
export function processSkillTraining(
  activeSkills: SkillInstance[],
  passiveSkills: SkillInstance[],
  usedSkillId: string,
  event: TrainingEvent,
  customXp?: number
): {
  newActiveSkills: SkillInstance[]
  newPassiveSkills: SkillInstance[]
  xpGained: number
} {
  const xpGained = customXp || TRAINING_XP[event] || 0
  
  // 액티브 스킬에서 찾기
  const newActiveSkills = activeSkills.map(skill => 
    skill.skillId === usedSkillId 
      ? addTrainingXp(skill, event, customXp)
      : skill
  )
  
  // 패시브 스킬에서 찾기
  const newPassiveSkills = passiveSkills.map(skill => 
    skill.skillId === usedSkillId 
      ? addTrainingXp(skill, event, customXp)
      : skill
  )

  return {
    newActiveSkills,
    newPassiveSkills,
    xpGained
  }
}

/**
 * 스킬 정보를 포맷팅합니다
 */
export function formatSkillInfo(skill: SkillInstance): {
  name: string
  level: string
  progress: string
  triggerRate: string
  canLevelUp: boolean
  element: ThemeType | 'physical' | 'magical' | 'neutral'
  description: string
} {
  const progressPercent = skill.maxXp ? Math.floor(((skill.currentXp || 0) / skill.maxXp) * 100) : 0
  
  return {
    name: skill.skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    level: `Lv ${skill.level}`,
    progress: `${skill.currentXp || 0}/${skill.maxXp || 0} (${progressPercent}%)`,
    triggerRate: `${skill.triggerChance}%`,
    canLevelUp: (skill.currentXp || 0) >= (skill.maxXp || 0),
    element: getSkillElement(skill.skillId),
    description: getSkillDescription(skill.skillId, skill.level)
  }
}

/**
 * 스킬 설명을 가져옵니다
 */
export function getSkillDescription(skillId: string, level: number): string {
  const descriptions: Record<string, string> = {
    'basic_attack': `물리 공격으로 적에게 피해를 입힙니다. (Lv ${level})`,
    'fireball': `화염 속성 공격으로 강력한 피해를 입힙니다. (Lv ${level})`,
    'ice_shard': `빙결 속성 공격으로 적을 얼려 피해를 입힙니다. (Lv ${level})`,
    'flame_aura': `화염 속성 패시브로 지속적인 피해를 가합니다. (Lv ${level})`,
    'frost_bite': `빙결 속성 패시브로 적의 속도를 감소시킵니다. (Lv ${level})`,
    'ember_toss': `작은 화염탄을 던져 여러 적에게 피해를 입힙니다. (Lv ${level})`
  }
  
  return descriptions[skillId] || `${skillId} 스킬입니다. (Lv ${level})`
} 