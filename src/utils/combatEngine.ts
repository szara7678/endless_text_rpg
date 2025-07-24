import { PlayerState, Monster, SkillInstance, CombatResult } from '../types'
import { calculateDamage, checkSkillTrigger, checkCriticalHit, calculatePlayerStats, calculateMonsterStats } from './effectCalculator'
import { loadMonster, loadSkill } from './dataLoader'
import { 
  applyMonsterElementalDamage, 
  calculatePlayerDamageReceived, 
  calculatePlayerElementalDamage,
  getElementalCombatLog 
} from './elementalCombat'

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
    await processPlayerAttack(calculatedPlayer, scaledMonster, result, floor)
    
    // 몬스터가 살아있으면 반격
    if (result.monsterHpAfter > 0) {
      await processMonsterAttack(scaledMonster, calculatedPlayer, result, floor)
    }
  } else {
    // 몬스터 선공
    await processMonsterAttack(scaledMonster, calculatedPlayer, result, floor)
    
    // 플레이어가 살아있으면 공격
    if (result.playerHpAfter > 0) {
      await processPlayerAttack(calculatedPlayer, scaledMonster, result, floor)
    }
  }
  
  // 승부 판정
  result.isMonsterDefeated = result.monsterHpAfter <= 0
  result.isPlayerDefeated = result.playerHpAfter <= 0
  
  return result
}

// 플레이어 공격 처리 (상성 시스템 적용)
async function processPlayerAttack(
  player: PlayerState,
  monster: Monster,
  result: CombatResult,
  floor: number
): Promise<void> {
  result.isPlayerTurn = true
  
  // 기본 물리 공격 (상성 영향 없음)
  let baseDamage = calculateDamage(player, monster, 'Physical', player.physicalAttack, true)
  
  // 스킬 시스템에서 속성 가져오기
  const skillElement = 'physical' // 기본 공격은 물리 속성 (임시 하드코딩으로 오류 해결)
  
  // 상성 공격 적용
  const elementalResult = calculatePlayerElementalDamage(
    player,
    skillElement,
    baseDamage,
    monster,
    floor
  )
  
  let totalDamage = elementalResult.finalDamage
  
  // 크리티컬 체크
  const isCritical = checkCriticalHit(player)
  if (isCritical) {
    totalDamage = Math.floor(totalDamage * 1.5)
    result.isCritical = true
  }
  
  // 액티브 스킬 체크 (임시로 기본 스킬 하나만)
  const skillDamage = await processPlayerSkills(player, monster)
  totalDamage += skillDamage
  
  result.playerDamageDealt = totalDamage
  result.monsterHpAfter = Math.max(0, monster.hp - totalDamage)
  
  // 로그 추가
  let attackMessage = `⚔️ 플레이어가 ${monster.name}에게 ${totalDamage} 피해를 입혔습니다.`
  
  if (isCritical) {
    attackMessage = `💥 크리티컬! 플레이어가 ${monster.name}에게 ${totalDamage} 피해를 입혔습니다!`
  }
  
  result.logs.push({
    type: 'player_attack',
    message: attackMessage
  })
  
  // 상성 효과 로그
  const elementalLog = getElementalCombatLog(skillElement, monster.theme, elementalResult.multiplier, true)
  if (elementalLog) {
    result.logs.push({
      type: 'combat',
      message: elementalLog
    })
  }

  // 스킬 수련치 추가 (basic_attack 사용)
  // TODO: 실제 사용한 스킬 ID를 여기서 가져와야 함
  // 현재는 임시로 주석 처리
  
  if (result.monsterHpAfter <= 0) {
    result.logs.push({
      type: 'loot',
      message: `🔥 ${monster.name}을(를) 처치했습니다!`
    })
  }
}

// 몬스터 공격 처리 (상성 시스템 적용)
async function processMonsterAttack(
  monster: Monster,
  player: PlayerState,
  result: CombatResult,
  floor: number
): Promise<void> {
  result.isPlayerTurn = false
  
  // 기본 공격력 계산
  let baseDamage = calculateDamage(monster, player, 'Physical', monster.attack, false)
  
  // 몬스터 공격에 필드 속성 적용
  const monsterElementalAttack = applyMonsterElementalDamage(floor, baseDamage)
  
  // 플레이어가 받는 속성 대미지 계산
  const playerDamageResult = calculatePlayerDamageReceived(
    player,
    monsterElementalAttack.damage,
    monsterElementalAttack.element,
    floor
  )
  
  let finalDamage = playerDamageResult.finalDamage
  
  // 몬스터 스킬 사용 (기존 로직 유지)
  let skillUsed = false
  
  // 몬스터 스킬 체크 (임시로 스킬 사용 안함)
  // if (monster.skills && monster.skills.length > 0) {
  //   for (const skillId of monster.skills) {
  //     const skill = await loadSkill(skillId)
  //     if (skill && checkSkillTrigger({ 
  //       skillId, 
  //       level: 1,
  //       triggerChance: skill.triggerChance
  //     })) {
  //       finalDamage += processMonsterSkill(monster, player, skill)
  //       skillUsed = true
  //       result.logs.push({
  //         type: 'monster_skill',
  //         message: `✨ ${monster.name}이(가) ${skill.name}을(를) 사용했습니다!`
  //       })
  //       break
  //     }
  //   }
  // }
  
  // 기본 공격 (이미 상성 계산 완료)
  const isCritical = checkCriticalHit(monster)
  if (isCritical) {
    finalDamage = Math.floor(finalDamage * 1.5)
    result.logs.push({
      type: 'monster_attack',
      message: `💥 ${monster.name}의 크리티컬 공격!`
    })
  }
  
  result.monsterDamageDealt = finalDamage
  result.playerHpAfter = Math.max(0, player.hp - finalDamage)
  
  // 로그 추가
  result.logs.push({
    type: 'monster_attack',
    message: `🐺 ${monster.name}이(가) 플레이어에게 ${finalDamage} 피해를 입혔습니다.`
  })
  
  // 상성 효과 로그
  const elementalLog = getElementalCombatLog(
    monsterElementalAttack.element, 
    monsterElementalAttack.element, // 플레이어는 현재 필드 테마에 따라 
    playerDamageResult.multiplier, 
    false
  )
  if (elementalLog && playerDamageResult.isResisted) {
    result.logs.push({
      type: 'combat',
      message: elementalLog
    })
  }
  
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

// 다음 몬스터 생성 (towerSystem 활용)
export async function generateNextMonster(floor: number): Promise<Monster | null> {
  try {
    // towerSystem을 사용하여 층별 몬스터 결정
    const { getFloorInfo } = await import('./towerSystem')
    const floorInfo = getFloorInfo(floor)
    
    // 휴식층인 경우 몬스터 없음
    if (floorInfo.isRestFloor) {
      return null
    }
    
    // 몬스터 풀에서 랜덤 선택
    const monsterPool = floorInfo.monsterPool
    if (monsterPool.length === 0) {
      // 풀이 비어있으면 기본 몬스터 사용 (폴백)
      const basicMonsters = ['flame_imp', 'ember_wolf', 'fire_sprite', 'magma_slime']
      const randomMonsterId = basicMonsters[Math.floor(Math.random() * basicMonsters.length)]
      const monster = await loadMonster(randomMonsterId)
      return monster ? calculateMonsterStats(monster, floor) : null
    }
    
    const randomMonsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)]
    const monster = await loadMonster(randomMonsterId)
    if (!monster) return null
    
    // 층수에 따른 스케일링 적용
    return calculateMonsterStats(monster, floor)
  } catch (error) {
    console.error('towerSystem 몬스터 생성 실패, 폴백 사용:', error)
    
    // 폴백: 기존 방식
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
} 