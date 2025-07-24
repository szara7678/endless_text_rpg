import { PlayerState, Monster, Skill } from '../types'
import { EffectCalculator } from './effectCalculator'

// 데미지 계산 (기획안에 맞게 수정)
export function calculateDamage(
  attacker: PlayerState | Monster,
  target: PlayerState | Monster,
  skill?: Skill,
  isPhysical: boolean = true
): number {
  const attackStat = isPhysical 
    ? (attacker as PlayerState).physicalAttack || (attacker as Monster).attack
    : (attacker as PlayerState).magicalAttack || (attacker as Monster).attack

  const defenseStat = isPhysical
    ? (target as PlayerState).physicalDefense || (target as Monster).defense  
    : (target as PlayerState).magicalDefense || (target as Monster).defense

  // 기본 데미지 계산
  let baseDamage = Math.max(1, attackStat - defenseStat * 0.5)
  
  // 스킬 배수 적용
  if (skill?.effects) {
    const damageEffect = skill.effects.find(e => e.type === 'damage')
    if (damageEffect) {
      baseDamage *= damageEffect.value / 100
    }
  }
  
  // 크리티컬 체크 (플레이어만)
  if ('critical' in attacker) {
    const criticalChance = attacker.critical
    if (Math.random() * 100 < criticalChance) {
      baseDamage *= 1.5
    }
  }
  
  // 랜덤 변수 (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2
  
  return Math.floor(baseDamage * randomFactor)
}

// 스킬 발동 체크
export function checkSkillTrigger(skill: Skill): boolean {
  if (!skill.triggerChance) return false
  return Math.random() * 100 < skill.triggerChance
}

// 스킬 효과 적용
export function applySkillEffects(
  skill: Skill,
  caster: PlayerState,
  target?: Monster
): { logs: string[], effects: any[] } {
  const logs: string[] = []
  const effects: any[] = []
  
  for (const effect of skill.effects || []) {
    switch (effect.type) {
      case 'damage':
        if (target) {
          // 물리/마법 구분 (기획안에 맞게)
          const isPhysical = effect.element === 'physical'
          const damage = calculateDamage(caster, target, skill, isPhysical)
          logs.push(`${skill.name}으로 ${damage} 데미지를 입혔습니다.`)
          effects.push({ type: 'damage', target: 'enemy', value: damage })
        }
        break
        
      case 'heal':
        const healAmount = Math.floor(caster.maxHp * effect.value / 100)
        logs.push(`${skill.name}으로 ${healAmount} HP를 회복했습니다.`)
        effects.push({ type: 'heal', target: 'self', value: healAmount })
        break
        
      case 'buff':
        logs.push(`${skill.name}으로 ${effect.target} ${effect.stat}이(가) ${effect.value}% 증가했습니다.`)
        effects.push({ 
          type: 'buff', 
          target: effect.target, 
          stat: effect.stat, 
          value: effect.value,
          duration: effect.duration || 5000
        })
        break
    }
  }
  
  return { logs, effects }
}

// 환경 효과 적용
export function applyEnvironmentEffect(envType: string, player: PlayerState): PlayerState {
  // 환경별 보너스 계산 (기획안: 상성 보너스)
  const environmentBonus = EffectCalculator.calculateTypeEffectiveness(
    player.physicalAttack > player.magicalAttack ? 'physical' : 'magical',
    envType
  )
  
  // 최종 스탯 계산 (완전한 PlayerState 반환)
  return {
    ...player, // 기존 모든 속성 유지
    physicalAttack: Math.floor(player.physicalAttack * environmentBonus),
    magicalAttack: Math.floor(player.magicalAttack * environmentBonus)
  }
} 