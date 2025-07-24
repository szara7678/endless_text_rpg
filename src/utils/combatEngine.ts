import { PlayerState, Monster, SkillInstance, CombatResult } from '../types'
import { calculateDamage, checkSkillTrigger, checkCriticalHit, calculatePlayerStats, calculateMonsterStats } from './effectCalculator'
import { loadMonster, loadSkill } from './dataLoader'

// 자동 전투 한 턴 처리
export async function processAutoCombatTurn(
  player: PlayerState,
  monster: Monster,
  floor: number
): Promise<CombatResult> {
  const result: CombatResult = {
    playerDamageDealt: 0,
    monsterDamageDealt: 0,
    playerHpAfter: player.hp,
    monsterHpAfter: monster.hp,
    isPlayerTurn: true,
    isCritical: false,
    logs: [],
    skillsTriggered: [],
    isMonsterDefeated: false,
    isPlayerDefeated: false
  }
  
  // 스탯 계산
  const calculatedPlayer = calculatePlayerStats(player)
  const scaledMonster = calculateMonsterStats(monster, floor)
  
  // 속도로 선공 결정
  const playerFirst = calculatedPlayer.speed >= scaledMonster.speed
  
  if (playerFirst) {
    // 플레이어 공격
    await processPlayerAttack(calculatedPlayer, scaledMonster, result)
    
    // 몬스터가 살아있으면 반격
    if (result.monsterHpAfter > 0) {
      await processMonsterAttack(scaledMonster, calculatedPlayer, result)
    }
  } else {
    // 몬스터 선공
    await processMonsterAttack(scaledMonster, calculatedPlayer, result)
    
    // 플레이어가 살아있으면 공격
    if (result.playerHpAfter > 0) {
      await processPlayerAttack(calculatedPlayer, scaledMonster, result)
    }
  }
  
  // 승부 판정
  result.isMonsterDefeated = result.monsterHpAfter <= 0
  result.isPlayerDefeated = result.playerHpAfter <= 0
  
  return result
}

// 플레이어 공격 처리
async function processPlayerAttack(
  player: PlayerState,
  monster: Monster,
  result: CombatResult
): Promise<void> {
  result.isPlayerTurn = true
  
  // 기본 공격
  let damage = calculateDamage(player, monster, 'Physical', player.physicalAttack, true)
  
  // 크리티컬 체크
  const isCritical = checkCriticalHit(player)
  if (isCritical) {
    damage = Math.floor(damage * 1.5)
    result.isCritical = true
  }
  
  // 액티브 스킬 체크 (임시로 기본 스킬 하나만)
  // TODO: 실제 플레이어 스킬 목록에서 가져오기
  const skillDamage = await processPlayerSkills(player, monster)
  damage += skillDamage
  
  result.playerDamageDealt = damage
  result.monsterHpAfter = Math.max(0, monster.hp - damage)
  
  // 로그 추가
  if (isCritical) {
    result.logs.push({
      type: 'player_attack',
      message: `💥 크리티컬! 플레이어가 ${monster.name}에게 ${damage} 피해를 입혔습니다!`
    })
  } else {
    result.logs.push({
      type: 'player_attack', 
      message: `⚔️ 플레이어가 ${monster.name}에게 ${damage} 피해를 입혔습니다.`
    })
  }
  
  if (result.monsterHpAfter <= 0) {
    result.logs.push({
      type: 'loot',
      message: `🔥 ${monster.name}을(를) 처치했습니다!`
    })
  }
}

// 몬스터 공격 처리
async function processMonsterAttack(
  monster: Monster,
  player: PlayerState,
  result: CombatResult
): Promise<void> {
  result.isPlayerTurn = false
  
  // 몬스터 스킬 사용
  let damage = 0
  let skillUsed = false
  
  // 몬스터 스킬 체크
  if (monster.skills && monster.skills.length > 0) {
    for (const skillId of monster.skills) {
      const skill = await loadSkill(skillId)
      if (skill && checkSkillTrigger({ 
        skillId, 
        level: 1,
        triggerChance: skill.triggerChance
      })) {
        damage += processMonsterSkill(monster, player, skill)
        skillUsed = true
        result.logs.push({
          type: 'monster_skill',
          message: `✨ ${monster.name}이(가) ${skill.name}을(를) 사용했습니다!`
        })
        break
      }
    }
  }
  
  // 스킬을 사용하지 않았으면 기본 공격
  if (!skillUsed) {
    damage = calculateDamage(monster, player, 'Physical', monster.attack, true)
    
    const isCritical = checkCriticalHit(monster)
    if (isCritical) {
      damage = Math.floor(damage * 1.5)
      result.logs.push({
        type: 'monster_attack',
        message: `💥 ${monster.name}의 크리티컬 공격!`
      })
    }
  }
  
  result.monsterDamageDealt = damage
  result.playerHpAfter = Math.max(0, player.hp - damage)
  
  result.logs.push({
    type: 'monster_attack',
    message: `🩸 ${monster.name}이(가) 플레이어에게 ${damage} 피해를 입혔습니다.`
  })
  
  if (result.playerHpAfter <= 0) {
    result.logs.push({
      type: 'death',
      message: `💀 플레이어가 쓰러졌습니다...`
    })
  }
}

// 플레이어 스킬 처리 (임시)
async function processPlayerSkills(player: PlayerState, monster: Monster): Promise<number> {
  // TODO: 실제 플레이어 스킬 시스템 연결
  return 0
}

// 몬스터 스킬 처리
function processMonsterSkill(monster: Monster, player: PlayerState, skill: any): number {
  if (!skill.effects || skill.effects.length === 0) return 0
  
  let totalDamage = 0
  
  for (const effect of skill.effects) {
    if (effect.type === 'damage') {
      const damage = calculateDamage(
        monster, 
        player, 
        effect.element, 
        effect.value,
        effect.element === 'Physical'
      )
      totalDamage += damage
    }
  }
  
  return totalDamage
}

// 다음 몬스터 생성
export async function generateNextMonster(floor: number): Promise<Monster | null> {
  // 층수에 따른 몬스터 선택
  const monsterPool = []
  
  // 1-5층: 화염 임프
  if (floor <= 5) {
    monsterPool.push('flame_imp')
  }
  
  // 3층부터: 서리 늑대 추가
  if (floor >= 3) {
    monsterPool.push('frost_wolf')
  }
  
  // 기본적으로 화염 임프는 항상 포함
  if (monsterPool.length === 0) {
    monsterPool.push('flame_imp')
  }
  
  const selectedId = monsterPool[Math.floor(Math.random() * monsterPool.length)]
  const monster = await loadMonster(selectedId)
  if (!monster) return null
  
  // 층수에 따른 스케일링 적용
  return calculateMonsterStats(monster, floor)
} 