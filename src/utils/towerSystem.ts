import { ThemeType, Monster } from '../types'

// 테마 순환 배열 (기획안: 6종 순환)
const THEME_ORDER: ThemeType[] = ['Flame', 'Frost', 'Toxic', 'Shadow', 'Thunder', 'Verdant']

// 층 구조 상수 (기획안: n1-6 일반 → n7-9 정예 → n0 보스)
const FLOOR_STRUCTURE = {
  NORMAL: [1, 2, 3, 4, 5, 6],  // n1-6 - 일반 몬스터
  ELITE: [7, 8, 9],            // n7-9 - 정예 몬스터
  BOSS: 0                       // n0 - 보스 (10, 20, 30...층)
}

/**
 * 층수로부터 테마를 결정합니다
 * 기획안: 테마는 10층마다 순환 (Flame → Frost → Toxic → Shadow → Thunder → Verdant)
 */
export function getThemeForFloor(floor: number): ThemeType {
  // 10층마다 테마 변경 (1-10층: Flame, 11-20층: Frost, ...)
  const themeIndex = Math.floor((floor - 1) / 10) % THEME_ORDER.length
  return THEME_ORDER[themeIndex]
}

/**
 * 층수로부터 몬스터 티어를 결정합니다
 * 기획안: n1-6 일반 → n7-9 정예 → n0 보스
 */
export function getMonsterTierForFloor(floor: number): 'rest' | 'normal' | 'elite' | 'boss' {
  const floorInCycle = floor % 10
  
  if (floorInCycle === FLOOR_STRUCTURE.BOSS) {
    return 'boss'  // 보스 (10, 20, 30...층)
  } else if (FLOOR_STRUCTURE.NORMAL.includes(floorInCycle)) {
    return 'normal'  // 일반 몬스터
  } else if (FLOOR_STRUCTURE.ELITE.includes(floorInCycle)) {
    return 'elite'  // 정예 몬스터
  }
  
  return 'normal'  // 기본값
}

/**
 * 층수로부터 몬스터 수를 결정합니다
 * 기획안: n1-6 일반(8-12) → n7-9 정예(3-5) → n0 보스(1)
 */
export function getMonsterCountForFloor(floor: number): number {
  const tier = getMonsterTierForFloor(floor)
  
  switch (tier) {
    case 'normal':
      return Math.floor(Math.random() * 5) + 8  // 8-12마리
    case 'elite':
      return Math.floor(Math.random() * 3) + 3  // 3-5마리
    case 'boss':
      return 1  // 1마리
    default:
      return 1
  }
}

/**
 * 드롭 레벨을 계산합니다
 * 기획안: 드롭 Lv = ⌊층/2⌋ + (졸개 0·정예 +3·보스 +7) ± 3
 */
export function calculateDropLevel(floor: number): number {
  const baseLevel = Math.floor(floor / 2)
  const tier = getMonsterTierForFloor(floor)
  
  let tierBonus = 0
  switch (tier) {
    case 'normal':
      tierBonus = 0
      break
    case 'elite':
      tierBonus = 3
      break
    case 'boss':
      tierBonus = 7
      break
  }
  
  // ±3 랜덤 변동
  const randomVariation = Math.floor(Math.random() * 7) - 3  // -3 ~ +3
  
  return Math.max(1, baseLevel + tierBonus + randomVariation)
}

/**
 * 상성 보너스를 체크합니다
 * 기획안: player.skillTag === theme.weakTag → 추가 수련치 +20
 */
export function checkElementalAdvantage(
  playerElement: ThemeType | 'neutral',
  enemyTheme: ThemeType
): { hasAdvantage: boolean; bonusXp: number } {
  // 테마별 약점 관계
  const weaknessMap: Record<ThemeType, ThemeType> = {
    'Flame': 'Frost',
    'Frost': 'Thunder', 
    'Thunder': 'Toxic',
    'Toxic': 'Verdant',
    'Verdant': 'Shadow',
    'Shadow': 'Flame'
  }
  
  const hasAdvantage = playerElement === weaknessMap[enemyTheme]
  const bonusXp = hasAdvantage ? 20 : 0
  
  return { hasAdvantage, bonusXp }
}

/**
 * 환경 효과를 적용합니다
 * 기획안: 각 테마별 고유 환경 효과
 */
export function applyEnvironmentalEffect(
  theme: ThemeType,
  isPlayer: boolean = true
): Record<string, number> {
  // themes/index.json에서 정의된 환경 효과
  const effects: Record<ThemeType, Record<string, number>> = {
    'Flame': isPlayer ? { attack: 10 } : { attack: 5 },
    'Frost': isPlayer ? { defense: 10, speed: -5 } : { defense: 5, speed: -3 },
    'Toxic': isPlayer ? { critical: 15 } : { critical: 8 },
    'Shadow': isPlayer ? { speed: 20 } : { speed: 10 },
    'Thunder': isPlayer ? { critical: 10 } : { critical: 5 },
    'Verdant': isPlayer ? { hp: 20, mp: 20 } : { hp: 15 }
  }
  
  return effects[theme] || {}
}

/**
 * 휴식층 효과를 처리합니다
 * 기획안: n0 휴식 → 환경/테마 전환
 */
export function processRestFloor(floor: number): {
  nextTheme: ThemeType
  healAmount: number
  manaAmount: number
  message: string
} {
  const nextTheme = getThemeForFloor(floor + 1)
  const healAmount = Math.floor(Math.random() * 20) + 30  // 30-50 HP 회복
  const manaAmount = Math.floor(Math.random() * 15) + 20  // 20-35 MP 회복
  
  const themeNames: Record<ThemeType, string> = {
    'Flame': '화염',
    'Frost': '빙결', 
    'Toxic': '독성',
    'Shadow': '암흑',
    'Thunder': '번개',
    'Verdant': '자연'
  }
  
  const message = `🛌 휴식층에서 체력과 마나를 회복했습니다! 다음 구역은 ${themeNames[nextTheme]} 테마입니다.`
  
  return { nextTheme, healAmount, manaAmount, message }
}

/**
 * 층별 몬스터 풀을 가져옵니다
 * themes/index.json의 데이터를 활용
 */
export function getMonsterPoolForFloor(floor: number): string[] {
  const theme = getThemeForFloor(floor)
  const tier = getMonsterTierForFloor(floor)
  
  // 실제 구현에서는 themes/index.json을 동적 로드해야 함
  // 현재는 하드코딩으로 임시 구현
  const monsterPools: Record<ThemeType, Record<string, string[]>> = {
    'Flame': {
      'normal': ['flame_imp', 'fire_sprite', 'magma_slime', 'ember_wolf', 'flame_lizard'],
      'elite': ['flame_elite'],
      'boss': ['flame_boss', 'inferno_dragon']
    },
    'Frost': {
      'normal': ['frost_sprite', 'frost_wolf'],
      'elite': ['frost_elite'],
      'boss': ['frost_boss']
    },
    'Toxic': {
      'normal': ['toxic_slime', 'toxic_snake', 'toxic_bug'],
      'elite': ['toxic_elite'],
      'boss': ['toxic_boss']
    },
    'Shadow': {
      'normal': ['shadow_bat', 'shadow_rat', 'shadow_spirit'],
      'elite': ['shadow_elite'],
      'boss': ['shadow_boss']
    },
    'Thunder': {
      'normal': ['thunder_bird', 'thunder_snake', 'thunder_golem'],
      'elite': ['thunder_elite'],
      'boss': ['thunder_boss']
    },
    'Verdant': {
      'normal': ['verdant_sprite', 'verdant_boar', 'verdant_golem'],
      'elite': ['verdant_elite'],
      'boss': ['verdant_boss']
    }
  }
  
  return monsterPools[theme]?.[tier] || []
}

/**
 * 특정 층의 정보를 종합적으로 반환합니다
 */
export function getFloorInfo(floor: number) {
  const theme = getThemeForFloor(floor)
  const tier = getMonsterTierForFloor(floor)
  const monsterCount = getMonsterCountForFloor(floor)
  const dropLevel = calculateDropLevel(floor)
  const monsterPool = getMonsterPoolForFloor(floor)
  const envEffect = applyEnvironmentalEffect(theme, true)
  
  return {
    floor,
    theme,
    tier,
    monsterCount,
    dropLevel,
    monsterPool,
    envEffect,
    isRestFloor: tier === 'rest'
  }
} 