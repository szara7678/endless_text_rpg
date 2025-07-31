import { PlayerState, Monster, SkillInstance, CombatResult, CombatPhase } from '../types'
import { calculateDamage, checkSkillTrigger, checkCriticalHit, calculatePlayerStats, calculateMonsterStats } from './effectCalculator'
import { loadMonster, loadSkill } from './dataLoader'
import { 
  applyMonsterElementalDamage, 
  calculatePlayerDamageReceived, 
  calculatePlayerElementalDamage,
  getElementalCombatLog 
} from './elementalCombat'
import { shouldAutoUsePotion, updatePotionUsage, calculatePotionHeal } from './potionSystem'

// 선공 결정 함수
export function determineFirstAttacker(player: PlayerState, monster: Monster, floor: number): 'player' | 'monster' {
  const calculatedPlayer = calculatePlayerStats(player)
  const scaledMonster = calculateMonsterStats(monster, floor)
  return calculatedPlayer.speed >= scaledMonster.speed ? 'player' : 'monster'
}

// 플레이어 턴만 처리
export async function processPlayerTurn(
  player: PlayerState,
  monster: Monster,
  floor: number,
  skills?: any,
  inventory?: any[],
  potionSettings?: any,
  potionUsageHistory?: any[]
): Promise<CombatResult> {
  const result: CombatResult = {
    playerDamageDealt: 0,
    monsterDamageDealt: 0,
    playerHpAfter: player.hp,
    playerMpAfter: player.mp,
    monsterHpAfter: monster.hp,
    isPlayerTurn: true,
    isCritical: false,
    logs: [],
    skillsTriggered: [],
    isMonsterDefeated: false,
    isPlayerDefeated: false
  }

  // 물약 자동 사용 체크
  if (inventory && potionSettings && potionUsageHistory) {
    const autoUseResult = shouldAutoUsePotion(
      player.hp,
      player.maxHp,
      player.mp,
      player.maxMp,
      potionSettings,
      inventory,
      floor,
      potionUsageHistory
    )
    
    if (autoUseResult.shouldUse && autoUseResult.potionItem) {
      const potionItem = autoUseResult.potionItem
      const healAmount = await calculatePotionHeal(potionItem)
      
      if (potionItem.itemId === 'health_potion') {
        result.playerHpAfter = Math.min(player.maxHp, player.hp + healAmount)
        result.logs.push({
          type: 'combat',
          message: `🧪 LV ${potionItem.level || 1} 체력 물약 사용! (HP +${healAmount})`
        })
      } else if (potionItem.itemId === 'mana_potion') {
        result.playerMpAfter = Math.min(player.maxMp, player.mp + healAmount)
        result.logs.push({
          type: 'combat',
          message: `🧪 LV ${potionItem.level || 1} 마나 물약 사용! (MP +${healAmount})`
        })
      }
      
      // 물약 사용 기록 업데이트
      updatePotionUsage(potionItem.itemId, floor, potionUsageHistory)
      
      // 사용된 물약 정보를 결과에 추가
      result.usedPotion = {
        itemId: potionItem.itemId,
        healAmount: healAmount,
        uniqueId: potionItem.uniqueId,
        level: potionItem.level,
        quality: potionItem.quality
      }
    }
  }

  // 플레이어 공격만 처리
  await processPlayerAttack(player, monster, result, floor, skills)
  
  return result
}

// 몬스터 턴만 처리
export async function processMonsterTurn(
  monster: Monster,
  player: PlayerState,
  floor: number
): Promise<CombatResult> {
  const result: CombatResult = {
    playerDamageDealt: 0,
    monsterDamageDealt: 0,
    playerHpAfter: player.hp,
    playerMpAfter: player.mp,
    monsterHpAfter: monster.hp,
    isPlayerTurn: false,
    isCritical: false,
    logs: [],
    skillsTriggered: [],
    isMonsterDefeated: false,
    isPlayerDefeated: false
  }

  // 몬스터 공격만 처리
  await processMonsterAttack(monster, player, result, floor)
  
  return result
}

// 플레이어 공격 처리 (상성 시스템 적용)
async function processPlayerAttack(
  player: PlayerState,
  monster: Monster,
  result: CombatResult,
  floor: number,
  skills?: any
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
  
  // 액티브 스킬 체크
  const skillResult = await processPlayerSkills(player, monster, skills)
  totalDamage += skillResult.damage
  
  // 스킬 로그 추가
  result.logs.push(...skillResult.logs.map(log => ({
    type: 'skill',
    message: log
  })))
  
  // 스킬 수련치 추가 (스토어에서 처리하도록 전달)
  result.skillsUsed = skillResult.skillUsed
  result.lastUsedSkill = skillResult.skillUsed.length > 0 ? skillResult.skillUsed[skillResult.skillUsed.length - 1] : null
  
  result.playerDamageDealt = totalDamage
  result.monsterHpAfter = Math.max(0, monster.hp - totalDamage)
  
  // 로그 추가
  let attackMessage = `플레이어 기본 공격! 대미지 ${totalDamage}`
  
  if (isCritical) {
    attackMessage = `플레이어 크리티컬 공격! 대미지 ${totalDamage}`
  }
  
  result.logs.push({
    type: 'player_attack',
    message: attackMessage
  })
  


  // 스킬 수련치 추가 (basic_attack 사용)
  // TODO: 실제 사용한 스킬 ID를 여기서 가져와야 함
  // 현재는 임시로 주석 처리
  
  if (result.monsterHpAfter <= 0) {
    result.logs.push({
      type: 'loot',
      message: `${monster.name} 처치!`
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
      message: `${monster.name} 크리티컬 공격! 대미지 ${finalDamage}`
    })
  }
  
  result.monsterDamageDealt = finalDamage
  result.playerHpAfter = Math.max(0, player.hp - finalDamage)
  
  // 로그 추가
  result.logs.push({
    type: 'monster_attack',
    message: `${monster.name} 공격! 대미지 ${finalDamage}`
  })
  

  
  if (result.playerHpAfter <= 0) {
    result.logs.push({
      type: 'death',
      message: `플레이어 사망!`
    })
  }
}

// 플레이어 스킬 처리
async function processPlayerSkills(player: PlayerState, monster: Monster, skills?: any): Promise<{ damage: number, logs: string[], skillUsed: string[] }> {
  let totalSkillDamage = 0
  const skillLogs: string[] = []
  const skillUsed: string[] = []
  
  // 액티브 스킬 체크
  if (skills && skills.activeSkills) {
    for (const skill of skills.activeSkills) {
      // 기본 공격은 항상 발동
      if (skill.skillId === 'basic_attack') {
        continue
      }
      
      // 스킬 데이터 로드 및 발동률 계산
      try {
        const skillData = await import(`../data/skills/${skill.skillId}.json`)
        if (skillData.default && skillData.default.effects) {
          // 실제 스킬 발동률 계산
          let actualTriggerChance = 10 // 기본값
          
          if (skill.skillId === 'basic_attack') {
            actualTriggerChance = 100
          } else if (skillData.default.triggerChance) {
            const { base, perLevel, max } = skillData.default.triggerChance
            const calculatedChance = base + (skill.level - 1) * perLevel
            actualTriggerChance = Math.min(calculatedChance, max)
          }
          
          // 스킬 발동 체크 (소수점 지원)
          if (Math.random() * 100 < actualTriggerChance) {
            for (const effect of skillData.default.effects) {
              if (effect.type === 'damage') {
                // 스킬 데미지 계산
                const baseDamage = effect.baseValue + (skill.level - 1) * (effect.levelScaling || 0)
                const skillDamage = Math.floor(baseDamage / 100 * player.magicalAttack)
                totalSkillDamage += skillDamage
                
                skillLogs.push(`플레이어 ${skillData.default.name} 공격! 대미지 ${skillDamage}`)
                skillUsed.push(skill.skillId)
              }
            }
          }
        }
      } catch (error) {
        console.error(`스킬 데이터 로드 실패: ${skill.skillId}`, error)
      }
    }
  }
  
  return { damage: totalSkillDamage, logs: skillLogs, skillUsed }
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

// 기존 함수 (하위 호환성을 위해 유지)
export async function processAutoCombatTurn(
    player: PlayerState,
    monster: Monster,
    floor: number,
    skills?: any,
    inventory?: any[],
    potionSettings?: any,
    potionUsageHistory?: any[]
  ): Promise<CombatResult> {
  const result: CombatResult = {
    playerDamageDealt: 0,
    monsterDamageDealt: 0,
    playerHpAfter: player.hp,
    playerMpAfter: player.mp,
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
    await processPlayerAttack(calculatedPlayer, scaledMonster, result, floor, skills)
    
    // 몬스터가 살아있으면 반격
    if (result.monsterHpAfter > 0) {
      await processMonsterAttack(scaledMonster, calculatedPlayer, result, floor)
    }
  } else {
    // 몬스터 선공
    await processMonsterAttack(scaledMonster, calculatedPlayer, result, floor)
    
    // 플레이어가 살아있으면 공격
    if (result.playerHpAfter > 0) {
      await processPlayerAttack(calculatedPlayer, scaledMonster, result, floor, skills)
    }
  }
  
  // 물약 자동 사용 체크 (전투 후)
  if (inventory && potionSettings && potionUsageHistory) {
    const autoUseResult = shouldAutoUsePotion(
      result.playerHpAfter,
      player.maxHp,
      result.playerMpAfter || player.mp,
      player.maxMp,
      potionSettings,
      inventory,
      floor,
      potionUsageHistory
    )
    
    if (autoUseResult.shouldUse && autoUseResult.potionItem) {
      const potionItem = autoUseResult.potionItem
      const healAmount = await calculatePotionHeal(potionItem)
      
      if (potionItem.itemId === 'health_potion') {
        result.playerHpAfter = Math.min(player.maxHp, result.playerHpAfter + healAmount)
        result.logs.push({
          type: 'combat',
          message: `🧪 LV ${potionItem.level || 1} 체력 물약 사용! (HP +${healAmount})`
        })
      } else if (potionItem.itemId === 'mana_potion') {
        result.playerMpAfter = Math.min(player.maxMp, (result.playerMpAfter || player.mp) + healAmount)
        result.logs.push({
          type: 'combat',
          message: `🧪 LV ${potionItem.level || 1} 마나 물약 사용! (MP +${healAmount})`
        })
      }
      
      // 물약 사용 기록 업데이트
      updatePotionUsage(potionItem.itemId, floor, potionUsageHistory)
      
      // 사용된 물약 정보를 결과에 추가
      result.usedPotion = {
        itemId: potionItem.itemId,
        healAmount: healAmount,
        uniqueId: potionItem.uniqueId,
        level: potionItem.level,
        quality: potionItem.quality
      }
    }
  }
  
  // 승부 판정
  result.isMonsterDefeated = result.monsterHpAfter <= 0
  result.isPlayerDefeated = result.playerHpAfter <= 0
  
  return result
} 