import { Monster, Skill } from '../types'

// 몬스터 데이터 로딩
export async function loadMonster(monsterId: string): Promise<Monster | null> {
  try {
    // 동적 import를 사용하여 모든 몬스터 지원
    const monsterData = (await import(`../data/monsters/${monsterId}.json`)).default
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
    // 동적 import를 사용하여 모든 드롭 테이블 지원
    const dropData = (await import(`../data/drops/${dropTableId}.json`)).default
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

// 아이템 데이터 로딩
export async function loadItem(itemId: string): Promise<any | null> {
  try {
    // 동적으로 아이템 파일 로드 시도
    try {
      const itemData = (await import(`../data/items/${itemId}.json`)).default
      return itemData
    } catch (importError) {
      // 개별 파일이 없으면 materials 폴더에서 시도
      try {
        const materialData = (await import(`../data/materials/${itemId}.json`)).default
        return materialData
      } catch (materialError) {
        // materials에도 없으면 스킬 폴더에서 시도
        try {
          const skillData = (await import(`../data/skills/${itemId}.json`)).default
          return skillData
        } catch (skillError) {
          console.warn(`알 수 없는 아이템: ${itemId}`)
          return null
        }
      }
    }
  } catch (error) {
    console.warn(`아이템 ${itemId} 로드 실패:`, error)
    return null
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