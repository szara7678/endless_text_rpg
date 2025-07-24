import { StateCreator } from 'zustand'
import { LifeSkillState, LifeSkillType, LifeSkill, MinigameResult, CraftingSession } from '../types'

export interface LifeSlice {
  life: LifeSkillState
  
  // 생활 스킬 관리
  addLifeSkillXp: (skillType: LifeSkillType, xp: number) => void
  levelUpLifeSkill: (skillType: LifeSkillType) => void
  startCooldown: (skillType: LifeSkillType, duration: number) => void
  
  // 미니게임
  startMinigame: (skillType: LifeSkillType, gameType: 'slot' | 'rhythm' | 'matching' | 'timing') => void
  endMinigame: (result: MinigameResult) => void
  
  // 제작 시스템
  startCrafting: (recipeId: string) => void
  completeCrafting: () => void
}

// 초기 생활 스킬 데이터
const initialLifeSkills: Record<LifeSkillType, LifeSkill> = {
  smithing: {
    id: 'smithing',
    name: '제작',
    description: '금속을 가공하여 무기와 방어구를 제작합니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: true
  },
  alchemy: {
    id: 'alchemy',
    name: '연금술',
    description: '약초와 재료를 조합하여 물약을 제작합니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: true
  },
  cooking: {
    id: 'cooking',
    name: '요리',
    description: '다양한 재료로 버프 효과가 있는 음식을 만듭니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: true
  },
  fishing: {
    id: 'fishing',
    name: '낚시',
    description: '강이나 바다에서 물고기와 특별한 재료를 낚습니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: true
  },
  farming: {
    id: 'farming',
    name: '농사',
    description: '씨앗을 심고 키워서 허브와 농작물을 수확합니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: false // 레벨 5에 해금
  },
  herbalism: {
    id: 'herbalism',
    name: '채집',
    description: '야생에서 자라는 허브와 재료들을 채집합니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: false // 레벨 10에 해금
  },
  mining: {
    id: 'mining',
    name: '광산',
    description: '지하에서 광물과 보석을 채굴합니다',
    level: 1,
    currentXp: 0,
    maxXp: 100,
    unlocked: false // 레벨 15에 해금
  }
}

const initialLifeState: LifeSkillState = {
  skills: initialLifeSkills,
  activeMinigame: null
}

export const lifeSlice: StateCreator<LifeSlice> = (set, get) => ({
  life: initialLifeState,
  
  // 생활 스킬 경험치 추가
  addLifeSkillXp: (skillType: LifeSkillType, xp: number) => {
    set((state) => {
      const skill = state.life.skills[skillType]
      if (!skill.unlocked) return state
      
      const newCurrentXp = skill.currentXp + xp
      let newLevel = skill.level
      let newMaxXp = skill.maxXp
      let remainingXp = newCurrentXp
      
      // 레벨업 체크
      while (remainingXp >= newMaxXp) {
        remainingXp -= newMaxXp
        newLevel += 1
        newMaxXp = Math.floor(100 * Math.pow(1.5, newLevel - 1))
      }
      
      return {
        ...state,
        life: {
          ...state.life,
          skills: {
            ...state.life.skills,
            [skillType]: {
              ...skill,
              level: newLevel,
              currentXp: remainingXp,
              maxXp: newMaxXp
            }
          }
        }
      }
    })
  },
  
  // 생활 스킬 쿨다운 시작
  startCooldown: (skillType: LifeSkillType, duration: number) => {
    set((state) => ({
      ...state,
      life: {
        ...state.life,
        skills: {
          ...state.life.skills,
          [skillType]: {
            ...state.life.skills[skillType],
            cooldownUntil: Date.now() + duration
          }
        }
      }
    }))
  },
  
  // 미니게임 시작
  startMinigame: (skillType: LifeSkillType, gameType: 'slot' | 'rhythm' | 'matching' | 'timing') => {
    set((state) => ({
      ...state,
      life: {
        ...state.life,
        activeMinigame: {
          skillType,
          gameType,
          data: generateMinigameData(gameType)
        }
      }
    }))
  },
  
  // 미니게임 종료
  endMinigame: (result: MinigameResult) => {
    const { life } = get()
    const activeMinigame = life.activeMinigame
    
    if (!activeMinigame) return
    
    // 경험치 지급
    get().addLifeSkillXp(activeMinigame.skillType, result.rewards.xp)
    
    // 보상 아이템 지급 (추후 구현)
    
    // 미니게임 상태 초기화
    set((state) => ({
      ...state,
      life: {
        ...state.life,
        activeMinigame: null
      }
    }))
  },
  
  // 레벨업 처리 (자동)
  levelUpLifeSkill: (skillType: LifeSkillType) => {
    // 이미 addLifeSkillXp에서 처리됨
  },
  
  // 제작 시작 (추후 구현)
  startCrafting: (recipeId: string) => {
    // 추후 구현
  },
  
  // 제작 완료 (추후 구현)
  completeCrafting: () => {
    // 추후 구현
  }
})

// 미니게임 데이터 생성
function generateMinigameData(gameType: 'slot' | 'rhythm' | 'matching' | 'timing') {
  switch (gameType) {
    case 'slot':
      return {
        symbols: ['🔥', '❄️', '🌿', '⚡', '🌙', '☀️'],
        reels: 3,
        targetCombination: null
      }
    case 'rhythm':
      return {
        notes: ['←', '↑', '→'],
        sequence: generateRandomSequence(3),
        timing: []
      }
    case 'matching':
      return {
        grid: generateMatchingGrid(4, 4),
        matches: 0,
        target: 3
      }
    case 'timing':
      return {
        targetZone: { start: 0.3, end: 0.7 },
        currentPosition: 0,
        speed: 0.02
      }
    default:
      return {}
  }
}

function generateRandomSequence(length: number): string[] {
  const notes = ['←', '↑', '→']
  return Array.from({ length }, () => notes[Math.floor(Math.random() * notes.length)])
}

function generateMatchingGrid(rows: number, cols: number): string[][] {
  const symbols = ['🔥', '❄️', '🌿', '⚡', '🌙', '☀️']
  const grid: string[][] = []
  
  for (let i = 0; i < rows; i++) {
    grid[i] = []
    for (let j = 0; j < cols; j++) {
      grid[i][j] = symbols[Math.floor(Math.random() * symbols.length)]
    }
  }
  
  return grid
} 