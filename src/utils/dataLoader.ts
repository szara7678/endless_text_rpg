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
    // 잘못된 형식의 uniqueId에서 실제 itemId 추출
    let actualItemId = itemId
    if (itemId.includes('_') && itemId.includes('.')) {
      // uniqueId 형식인 경우 (예: toxic_ring_0.17890369830190878)
      const parts = itemId.split('_')
      if (parts.length >= 2) {
        // 첫 번째 두 부분을 조합하여 실제 itemId 생성
        actualItemId = `${parts[0]}_${parts[1]}`
        console.warn(`잘못된 아이템 ID 감지: ${itemId} -> ${actualItemId}로 변환`)
      }
    }
    
    // 동적으로 아이템 파일 로드 시도
    try {
      const itemData = (await import(`../data/items/${actualItemId}.json`)).default
      return itemData
    } catch (importError) {
      // 개별 파일이 없으면 materials 폴더에서 시도
      try {
        const materialData = (await import(`../data/materials/${actualItemId}.json`)).default
        return materialData
      } catch (materialError) {
        // materials에도 없으면 스킬 폴더에서 시도
        try {
          const skillData = (await import(`../data/skills/${actualItemId}.json`)).default
          return skillData
        } catch (skillError) {
          console.warn(`알 수 없는 아이템: ${itemId} (변환된 ID: ${actualItemId})`)
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
    const characterData = (await import('../data/initial/character.json')).default
    return characterData
  } catch (error) {
    console.warn('초기 캐릭터 데이터 로드 실패, 기본값 사용:', error)
    return {
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      basePhysicalAttack: 15,
      baseMagicalAttack: 10,
      basePhysicalDefense: 8,
      baseMagicalDefense: 6,
      baseSpeed: 12,
      baseMaxHp: 100,
      baseMaxMp: 50,
      critical: 5,
      gold: 1000,
      gem: 100,
      ascensionPoints: 20,
      currentFloor: 1,
      highestFloor: 1,
      ascensionGauge: 0,
      totalPlayTime: 0
    }
  }
}

// 초기 인벤토리 데이터  
export async function loadInitialInventory(): Promise<any> {
  try {
    const inventoryData = (await import('../data/initial/inventory.json')).default
    return inventoryData
  } catch (error) {
    console.warn('초기 인벤토리 데이터 로드 실패, 기본값 사용:', error)
    return {
      maxSlots: 100,
      usedSlots: 0,
      initialItems: [
      ],
      initialMaterials: [
      ],
      initialConsumables: [
      ]
    }
  }
}

// 초기 스킬 데이터
export async function loadInitialSkills(): Promise<any> {
  try {
    const skillsData = (await import('../data/initial/skills.json')).default
    return skillsData
  } catch (error) {
    console.warn('초기 스킬 데이터 로드 실패, 기본값 사용:', error)
    return {
      activeSkills: [
        {
          skillId: "basic_attack",
          level: 1
        },
        {
          skillId: "fireball",
          level: 1
        }
      ],
      passiveSkills: [],
      pagesOwned: {}
    }
  }
}

// 초기 타워 데이터
export async function loadInitialTower(): Promise<any> {
  try {
    const towerData = (await import('../data/initial/tower.json')).default
    return towerData
  } catch (error) {
    console.warn('초기 타워 데이터 로드 실패, 기본값 사용:', error)
    return {
      currentFloor: 1,
      floorSeed: "floor_1_seed",
      envType: "Flame",
      currentMobs: [],
      currentMobIndex: 0,
      combatLog: [
        {
          id: "1",
          timestamp: 0,
          type: "floor",
          message: "1층에 도착했습니다. 모험을 시작합니다!"
        }
      ],
      autoMode: false,
      autoSpeed: 1,
      isProcessing: false
    }
  }
} 