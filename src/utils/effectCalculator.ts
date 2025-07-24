import { PlayerState, Monster, SkillInstance } from '../types'

// 플레이어 최종 스탯 계산
export function calculatePlayerStats(player: PlayerState): PlayerState {
  const calculatedStats = { ...player }
  
  // 기본 스탯 (NaN 방지)
  calculatedStats.physicalAttack = player.basePhysicalAttack || 15
  calculatedStats.magicalAttack = player.baseMagicalAttack || 10
  calculatedStats.physicalDefense = player.basePhysicalDefense || 8
  calculatedStats.magicalDefense = player.baseMagicalDefense || 6
  calculatedStats.speed = player.baseSpeed || 12
  
  // 장비 효과 적용
  if (player.equipment?.weapon) {
    const weapon = player.equipment.weapon
    calculatedStats.physicalAttack += weapon.physicalAttack || 0
    calculatedStats.magicalAttack += weapon.magicalAttack || 0
  }
  
  if (player.equipment?.armor) {
    const armor = player.equipment.armor
    calculatedStats.physicalDefense += armor.physicalDefense || 0
    calculatedStats.magicalDefense += armor.magicalDefense || 0
  }
  
  if (player.equipment?.accessory) {
    const accessory = player.equipment.accessory
    calculatedStats.speed += accessory.speed || 0
  }
  
  // 환생 레벨 보너스 (환생당 모든 스탯 +5%)
  const rebirthBonus = 1 + ((player.rebirthLevel || 0) * 0.05)
  calculatedStats.physicalAttack = Math.floor(calculatedStats.physicalAttack * rebirthBonus)
  calculatedStats.magicalAttack = Math.floor(calculatedStats.magicalAttack * rebirthBonus)
  calculatedStats.physicalDefense = Math.floor(calculatedStats.physicalDefense * rebirthBonus)
  calculatedStats.magicalDefense = Math.floor(calculatedStats.magicalDefense * rebirthBonus)
  calculatedStats.speed = Math.floor(calculatedStats.speed * rebirthBonus)
  
  return calculatedStats
}

// 몬스터 최종 스탯 계산 (층수 기반 스케일링)
export function calculateMonsterStats(monster: Monster, floor: number): Monster {
  const scaledMonster = { ...monster }
  
  // 층수에 따른 스탯 스케일링 (10층마다 20% 증가)
  const floorMultiplier = 1 + Math.floor((floor - 1) / 10) * 0.2
  
  scaledMonster.hp = Math.floor(monster.hp * floorMultiplier)
  scaledMonster.maxHp = Math.floor(monster.maxHp * floorMultiplier)
  scaledMonster.attack = Math.floor(monster.attack * floorMultiplier)
  scaledMonster.defense = Math.floor(monster.defense * floorMultiplier)
  scaledMonster.speed = Math.floor(monster.speed * floorMultiplier)
  
  // 골드 보상도 층수에 따라 증가
  scaledMonster.goldReward = Math.floor(monster.goldReward * floorMultiplier)
  
  return scaledMonster
}

// 속성 상성 계산
export function calculateTypeEffectiveness(attackerElement: string, defenderResistances: string[], defenderWeaknesses: string[]): number {
  // 약점 공격 (150% 데미지)
  if (defenderWeaknesses.includes(attackerElement)) {
    return 1.5
  }
  
  // 저항 공격 (50% 데미지)
  if (defenderResistances.includes(attackerElement)) {
    return 0.5
  }
  
  // 일반 공격 (100% 데미지)
  return 1.0
}

// 데미지 계산
export function calculateDamage(
  attacker: PlayerState | Monster, 
  defender: PlayerState | Monster,
  element: string,
  baseDamage: number,
  isPhysical: boolean = false
): number {
  // 공격력 계산 (NaN 방지)
  let attackPower = 0
  if ('physicalAttack' in attacker) {
    // 플레이어
    attackPower = isPhysical 
      ? (attacker.physicalAttack || 15)
      : (attacker.magicalAttack || 10)
  } else {
    // 몬스터
    attackPower = attacker.attack || 10
  }
  
  // 방어력 계산 (NaN 방지)
  let defense = 0
  if ('physicalDefense' in defender) {
    // 플레이어
    defense = isPhysical
      ? (defender.physicalDefense || 8)
      : (defender.magicalDefense || 6)
  } else {
    // 몬스터
    defense = defender.defense || 5
  }
  
  // 기본 데미지 계산 (NaN 방지)
  const safeBaseDamage = baseDamage || 10
  let damage = safeBaseDamage + attackPower - Math.floor(defense * 0.5)
  
  // 속성 상성 적용 (몬스터에만)
  if ('resistances' in defender) {
    const effectiveness = calculateTypeEffectiveness(element, defender.resistances, defender.weaknesses)
    damage = Math.floor(damage * effectiveness)
  }
  
  // 최소 데미지 보장
  return Math.max(1, damage)
}

// 스킬 트리거 체크
export function checkSkillTrigger(skill: SkillInstance): boolean {
  return Math.random() * 100 < skill.triggerChance
}

// 크리티컬 히트 체크
export function checkCriticalHit(attacker: PlayerState | Monster): boolean {
  const critChance = 'speed' in attacker ? attacker.speed * 0.1 : 5 // 속도의 10%가 크리티컬 확률
  return Math.random() * 100 < Math.min(critChance, 50) // 최대 50%
} 