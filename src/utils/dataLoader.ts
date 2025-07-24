import { Monster, Skill } from '../types'

// 몬스터 데이터 로딩
export async function loadMonster(monsterId: string): Promise<Monster | null> {
  try {
    let monsterData: any
    
    switch (monsterId) {
      case 'flame_imp':
        monsterData = (await import('../data/monsters/flame_imp.json')).default
        break
      case 'frost_wolf':
        monsterData = (await import('../data/monsters/frost_wolf.json')).default
        break
      case 'fire_sprite':
        monsterData = (await import('../data/monsters/fire_sprite.json')).default
        break
      case 'ember_wolf':
        monsterData = (await import('../data/monsters/ember_wolf.json')).default
        break
      case 'magma_slime':
        monsterData = (await import('../data/monsters/magma_slime.json')).default
        break
      case 'inferno_dragon':
        monsterData = (await import('../data/monsters/inferno_dragon.json')).default
        break
      default:
        console.warn(`알 수 없는 몬스터: ${monsterId}`)
        return null
    }
    
    return monsterData as Monster
  } catch (error) {
    console.warn(`몬스터 ${monsterId} 로드 실패:`, error)
    return null
  }
}

// 스킬 데이터 로딩
export async function loadSkill(skillId: string): Promise<Skill | null> {
  try {
    let skillData: any
    
    switch (skillId) {
      case 'fireball':
        skillData = (await import('../data/skills/fireball.json')).default
        break
      case 'ember_toss':
        skillData = (await import('../data/skills/ember_toss.json')).default
        break
      case 'ice_shard':
        skillData = (await import('../data/skills/ice_shard.json')).default
        break
      case 'frost_bite':
        skillData = (await import('../data/skills/frost_bite.json')).default
        break
      default:
        console.warn(`알 수 없는 스킬: ${skillId}`)
        return null
    }
    
    return skillData as Skill
  } catch (error) {
    console.warn(`스킬 ${skillId} 로드 실패:`, error)
    return null
  }
}

// 드롭 테이블 로딩
export async function loadDropTable(dropTableId: string): Promise<any | null> {
  try {
    let dropData: any
    
    switch (dropTableId) {
      case 'flame_normal':
        dropData = (await import('../data/drops/flame_normal.json')).default
        break
      default:
        console.warn(`알 수 없는 드롭 테이블: ${dropTableId}`)
        return null
    }
    
    return dropData
  } catch (error) {
    console.warn(`드롭 테이블 ${dropTableId} 로드 실패:`, error)
    return null
  }
}

// 테마 정보 로딩 (기본 구현)
export async function loadThemes(): Promise<any[]> {
  return [
    { id: 'Flame', name: '화염', weakTag: 'Frost' },
    { id: 'Frost', name: '빙결', weakTag: 'Thunder' },
    { id: 'Thunder', name: '뇌전', weakTag: 'Verdant' },
    { id: 'Verdant', name: '자연', weakTag: 'Toxic' },
    { id: 'Toxic', name: '독성', weakTag: 'Shadow' },
    { id: 'Shadow', name: '암흑', weakTag: 'Flame' }
  ]
}

// 아이템 정보 로딩 (기본 구현)
export async function loadItems(): Promise<Record<string, any>> {
  return {
    flame_ore: { name: '화염 광석', type: 'material', level: 1 },
    ember_crystal: { name: '잔불 수정', type: 'material', level: 1 },
    health_potion: { name: '체력 물약', type: 'consumable', effect: 'heal_hp' }
  }
}

// 초기 캐릭터 데이터
export async function loadInitialCharacter(): Promise<any> {
  try {
    const data = (await import('../data/initial/character.json')).default
    return data
  } catch (error) {
    console.warn('초기 캐릭터 데이터 로드 실패:', error)
    return null
  }
}

// 초기 인벤토리 데이터  
export async function loadInitialInventory(): Promise<any> {
  try {
    const data = (await import('../data/initial/inventory.json')).default
    return data
  } catch (error) {
    console.warn('초기 인벤토리 데이터 로드 실패:', error)
    return null
  }
}

// 초기 스킬 데이터
export async function loadInitialSkills(): Promise<any> {
  try {
    const data = (await import('../data/initial/skills.json')).default
    return data
  } catch (error) {
    console.warn('초기 스킬 데이터 로드 실패:', error)
    return null
  }
}

// 초기 타워 데이터
export async function loadInitialTower(): Promise<any> {
  try {
    const data = (await import('../data/initial/tower.json')).default
    return data
  } catch (error) {
    console.warn('초기 타워 데이터 로드 실패:', error)
    return null
  }
} 