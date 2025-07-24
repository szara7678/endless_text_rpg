import { Monster, Skill } from '../types'

// 몬스터 데이터 로딩
export async function loadMonster(monsterId: string): Promise<Monster | null> {
  try {
    const response = await fetch(`/src/data/monsters/${monsterId}.json`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.warn(`몬스터 ${monsterId} 로드 실패:`, error)
    return null
  }
}

// 스킬 데이터 로딩
export async function loadSkill(skillId: string): Promise<Skill | null> {
  try {
    const response = await fetch(`/src/data/skills/${skillId}.json`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.warn(`스킬 ${skillId} 로드 실패:`, error)
    return null
  }
}

// 드롭 테이블 로딩
export async function loadDropTable(dropTableId: string): Promise<any | null> {
  try {
    const response = await fetch(`/src/data/drops/${dropTableId}.json`)
    if (!response.ok) return null
    return await response.json()
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
  return null // startNewGame에서 초기값 사용
}

// 초기 인벤토리 데이터  
export async function loadInitialInventory(): Promise<any> {
  return null // startNewGame에서 초기값 사용
}

// 초기 스킬 데이터
export async function loadInitialSkills(): Promise<any> {
  return null // startNewGame에서 초기값 사용
} 