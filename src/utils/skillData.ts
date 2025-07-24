import { ThemeType } from '../types'

export interface SkillData {
  skillId: string
  name: string
  description: string
  type: 'Active' | 'Passive'
  element: ThemeType | 'physical' | 'magical' | 'neutral'
  baseTriggerChance: number
  triggerChanceLevels: number[]
  maxLevel: number
  requiredPages: number
  effects: SkillEffect[]
  trainingRules: TrainingRule[]
}

export interface SkillEffect {
  type: string
  element?: string
  baseValue: number
  levelScaling: number
  duration?: number
  targets?: number
  stat?: string
}

export interface TrainingRule {
  condition: string
  xpGain: number
}

// 스킬 데이터 캐시
const skillDataCache: Record<string, SkillData> = {}

/**
 * 스킬 데이터를 로드합니다
 */
export async function loadSkillData(skillId: string): Promise<SkillData | null> {
  // 캐시에서 먼저 확인
  if (skillDataCache[skillId]) {
    return skillDataCache[skillId]
  }

  try {
    const module = await import(`../data/skills/${skillId}.json`)
    const skillData = module.default || module
    
    // 캐시에 저장
    skillDataCache[skillId] = skillData
    return skillData
  } catch (error) {
    console.error(`스킬 데이터 로드 실패: ${skillId}`, error)
    return null
  }
}

/**
 * 스킬별 발동률 상승 레벨을 가져옵니다
 */
export async function getSkillTriggerLevels(skillId: string): Promise<number[]> {
  const skillData = await loadSkillData(skillId)
  return skillData?.triggerChanceLevels || [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100]
}

/**
 * 스킬의 현재 레벨에 따른 발동률을 계산합니다
 */
export async function calculateSkillTriggerChance(skillId: string, level: number): Promise<number> {
  const triggerLevels = await getSkillTriggerLevels(skillId)
  const skillData = await loadSkillData(skillId)
  
  let triggerChance = skillData?.baseTriggerChance || 10
  
  // 발동률 증가 레벨에 도달했는지 확인
  for (const triggerLevel of triggerLevels) {
    if (level >= triggerLevel) {
      triggerChance += 5 // 5%씩 증가
    } else {
      break
    }
  }
  
  return Math.min(triggerChance, 95) // 최대 95%
}

/**
 * 기본 스킬 데이터 (로드 실패시 폴백)
 */
export function getDefaultSkillData(skillId: string): SkillData {
  return {
    skillId,
    name: skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `${skillId} 스킬입니다.`,
    type: skillId.includes('aura') || skillId.includes('bite') ? 'Passive' : 'Active',
    element: skillId.includes('fire') || skillId.includes('flame') || skillId.includes('ember') ? 'Flame' :
             skillId.includes('ice') || skillId.includes('frost') ? 'Frost' :
             skillId.includes('basic') ? 'physical' : 'neutral',
    baseTriggerChance: 10,
    triggerChanceLevels: [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100],
    maxLevel: 0,
    requiredPages: skillId === 'basic_attack' ? 0 : 3,
    effects: [],
    trainingRules: []
  }
} 