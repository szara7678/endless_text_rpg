import { PlayerState, Monster, ThemeType } from '../types'
import { getThemeForFloor } from './towerSystem'

// 상성 관계 정의 (기획안의 약점 관계)
const ELEMENTAL_WEAKNESS: Record<ThemeType, ThemeType> = {
  'Flame': 'Frost',    // 화염은 빙결에 약함
  'Frost': 'Thunder',  // 빙결은 번개에 약함
  'Thunder': 'Toxic',  // 번개는 독성에 약함
  'Toxic': 'Verdant',  // 독성은 자연에 약함
  'Verdant': 'Shadow', // 자연은 암흑에 약함
  'Shadow': 'Flame'    // 암흑은 화염에 약함
}

// 상성 효과 배수
const ELEMENTAL_ADVANTAGE_MULTIPLIER = 1.5  // 상성 우위시 1.5배 대미지
const ELEMENTAL_RESISTANCE_MULTIPLIER = 0.7 // 상성 저항시 0.7배 대미지

/**
 * 상성 배수를 계산합니다
 * @param attackElement 공격 속성
 * @param targetTheme 대상의 테마 (몬스터의 경우 필드 테마)
 * @param targetResistance 대상의 해당 속성 저항력
 */
export function calculateElementalMultiplier(
  attackElement: ThemeType | 'physical' | 'magical' | 'neutral',
  targetTheme: ThemeType,
  targetResistance: number = 0
): number {
  // 물리/마법/무속성 공격은 상성 영향 없음
  if (attackElement === 'physical' || attackElement === 'magical' || attackElement === 'neutral') {
    return 1.0
  }

  const attackTheme = attackElement as ThemeType
  
  // 상성 우위 체크 (공격 속성이 대상의 약점인가?)
  const targetWeakness = ELEMENTAL_WEAKNESS[targetTheme]
  let multiplier = 1.0
  
  if (attackTheme === targetWeakness) {
    // 상성 우위: 1.5배 대미지
    multiplier = ELEMENTAL_ADVANTAGE_MULTIPLIER
  } else if (targetTheme === ELEMENTAL_WEAKNESS[attackTheme]) {
    // 상성 불리: 0.7배 대미지  
    multiplier = ELEMENTAL_RESISTANCE_MULTIPLIER
  }
  
  // 저항력 적용 (저항력 10당 5% 감소, 최대 50% 감소)
  const resistanceReduction = Math.min(0.5, targetResistance * 0.005)
  multiplier *= (1 - resistanceReduction)
  
  return Math.max(0.1, multiplier) // 최소 10% 대미지는 보장
}

/**
 * 플레이어의 속성 공격력을 계산합니다
 * @param player 플레이어 상태
 * @param element 속성
 */
export function getPlayerElementalAttack(player: PlayerState, element: ThemeType): number {
  // elementalStats가 없으면 기본값 0 반환
  if (!player.elementalStats) {
    return 0
  }
  const elementKey = element.toLowerCase() as keyof typeof player.elementalStats
  return player.elementalStats[elementKey]?.attack || 0
}

/**
 * 플레이어의 속성 저항력을 계산합니다
 * @param player 플레이어 상태
 * @param element 속성
 */
export function getPlayerElementalResistance(player: PlayerState, element: ThemeType): number {
  // elementalStats가 없으면 기본값 0 반환
  if (!player.elementalStats) {
    return 0
  }
  const elementKey = element.toLowerCase() as keyof typeof player.elementalStats
  return player.elementalStats[elementKey]?.resistance || 0
}

/**
 * 몬스터의 공격에 필드 속성을 적용합니다
 * @param floor 현재 층수
 * @param baseDamage 기본 대미지
 */
export function applyMonsterElementalDamage(floor: number, baseDamage: number): {
  damage: number
  element: ThemeType
  multiplier: number
} {
  const fieldTheme = getThemeForFloor(floor)
  
  // 몬스터는 해당 필드의 속성으로 공격
  // 필드별 속성 공격력 보너스 적용 (기본 20% 보너스)
  const elementalBonus = baseDamage * 0.2
  const totalDamage = baseDamage + elementalBonus
  
  return {
    damage: totalDamage,
    element: fieldTheme,
    multiplier: 1.2
  }
}

/**
 * 플레이어가 받는 속성 대미지를 계산합니다
 * @param player 플레이어 상태
 * @param incomingDamage 들어오는 대미지
 * @param attackElement 공격 속성
 * @param floor 현재 층수 (필드 테마 확인용)
 */
export function calculatePlayerDamageReceived(
  player: PlayerState,
  incomingDamage: number,
  attackElement: ThemeType,
  floor: number
): {
  finalDamage: number
  resistance: number
  multiplier: number
  isResisted: boolean
} {
  const fieldTheme = getThemeForFloor(floor)
  const playerResistance = getPlayerElementalResistance(player, attackElement)
  
  // 상성 배수 계산 (플레이어가 방어하는 상황)
  const elementalMultiplier = calculateElementalMultiplier(
    attackElement,
    fieldTheme, // 플레이어는 현재 필드에 있으므로 필드 테마 사용
    playerResistance
  )
  
  const finalDamage = Math.floor(incomingDamage * elementalMultiplier)
  const isResisted = elementalMultiplier < 1.0
  
  return {
    finalDamage,
    resistance: playerResistance,
    multiplier: elementalMultiplier,
    isResisted
  }
}

/**
 * 플레이어의 속성 공격 대미지를 계산합니다
 * @param player 플레이어 상태
 * @param skill 사용한 스킬 (속성 정보 포함)
 * @param monster 대상 몬스터
 * @param floor 현재 층수
 */
export function calculatePlayerElementalDamage(
  player: PlayerState,
  skillElement: ThemeType | 'physical' | 'magical' | 'neutral',
  baseDamage: number,
  monster: Monster,
  floor: number
): {
  finalDamage: number
  elementalBonus: number
  multiplier: number
  isAdvantage: boolean
} {
  // 물리/마법 공격은 기존 시스템 사용
  if (skillElement === 'physical' || skillElement === 'magical' || skillElement === 'neutral') {
    return {
      finalDamage: baseDamage,
      elementalBonus: 0,
      multiplier: 1.0,
      isAdvantage: false
    }
  }
  
  const attackElement = skillElement as ThemeType
  const monsterTheme = monster.theme
  
  // 플레이어의 해당 속성 공격력 보너스
  const elementalAttack = getPlayerElementalAttack(player, attackElement)
  
  // 몬스터의 해당 속성 저항력 (기본 0, 추후 몬스터 데이터에 추가 가능)
  const monsterResistance = 0 // 추후 monster.resistances에서 가져올 수 있음
  
  // 상성 배수 계산
  const elementalMultiplier = calculateElementalMultiplier(
    attackElement,
    monsterTheme,
    monsterResistance
  )
  
  // 최종 대미지 계산
  const elementalBonus = elementalAttack
  const totalDamage = baseDamage + elementalBonus
  const finalDamage = Math.floor(totalDamage * elementalMultiplier)
  
  const isAdvantage = elementalMultiplier > 1.0
  
  return {
    finalDamage,
    elementalBonus,
    multiplier: elementalMultiplier,
    isAdvantage
  }
}

/**
 * 전투 로그용 상성 정보를 생성합니다
 */
export function getElementalCombatLog(
  attackElement: ThemeType | 'physical' | 'magical' | 'neutral',
  targetTheme: ThemeType,
  multiplier: number,
  isPlayer: boolean = true
): string {
  if (attackElement === 'physical' || attackElement === 'magical' || attackElement === 'neutral') {
    return ''
  }
  
  const elementNames: Record<ThemeType, string> = {
    'Flame': '🔥화염',
    'Frost': '❄️빙결',
    'Toxic': '☠️독성',
    'Shadow': '🌑암흑',
    'Thunder': '⚡번개',
    'Verdant': '🌿자연'
  }
  
  const attackName = elementNames[attackElement as ThemeType]
  const targetName = elementNames[targetTheme]
  
  if (multiplier > 1.0) {
    return `${attackName} 공격이 ${targetName} 속성에 효과적입니다! (${(multiplier * 100).toFixed(0)}%)`
  } else if (multiplier < 1.0) {
    return `${attackName} 공격이 ${targetName} 속성에 저항당했습니다... (${(multiplier * 100).toFixed(0)}%)`
  }
  
  return ''
} 