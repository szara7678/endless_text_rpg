import { StateCreator } from 'zustand'
import { LifeSkillState, LifeSkillType, MinigameState } from '../types'

export interface LifeSlice {
  life: LifeSkillState
  
  // 액션들
  addLifeSkillXP: (skill: LifeSkillType, xp: number) => void
  levelUpLifeSkill: (skill: LifeSkillType) => boolean
  setLifeSkillCooldown: (activity: string, cooldown: number) => void
  updateLifeCooldowns: (deltaTime: number) => void
  updateMinigameState: (state: Partial<MinigameState>) => void
  resetCombo: () => void
  addPerfect: () => void
  getLifeSkillLevel: (skill: LifeSkillType) => number
  canPerformActivity: (activity: string) => boolean
}

const initialLifeState: LifeSkillState = {
  levels: {
    Smithing: 5,
    Alchemy: 3,
    Cooking: 2,
    Fishing: 7,
    Farming: 4,
    Mining: 8,
    Herbalism: 6
  },
  experience: {
    Smithing: 245,
    Alchemy: 89,
    Cooking: 34,
    Fishing: 156,
    Farming: 301,
    Mining: 124,
    Herbalism: 445
  },
  minigameState: {
    currentCombo: 0,
    maxCombo: 15,
    perfectStreak: 0,
    totalPerfects: 1247
  },
  cooldowns: {}
}

const calculateXPRequired = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export const lifeSlice: StateCreator<LifeSlice> = (set, get) => ({
  life: initialLifeState,
  
  addLifeSkillXP: (skill: LifeSkillType, xp: number) =>
    set((state) => ({
      life: {
        ...state.life,
        experience: {
          ...state.life.experience,
          [skill]: state.life.experience[skill] + xp
        }
      }
    })),
    
  levelUpLifeSkill: (skill: LifeSkillType) => {
    const { life } = get()
    const currentLevel = life.levels[skill]
    const currentXP = life.experience[skill]
    const requiredXP = calculateXPRequired(currentLevel)
    
    if (currentXP >= requiredXP) {
      set((state) => ({
        life: {
          ...state.life,
          levels: {
            ...state.life.levels,
            [skill]: currentLevel + 1
          },
          experience: {
            ...state.life.experience,
            [skill]: currentXP - requiredXP
          }
        }
      }))
      return true
    }
    return false
  },
  
  setLifeSkillCooldown: (activity: string, cooldown: number) =>
    set((state) => ({
      life: {
        ...state.life,
        cooldowns: {
          ...state.life.cooldowns,
          [activity]: cooldown
        }
      }
    })),
    
  updateLifeCooldowns: (deltaTime: number) =>
    set((state) => {
      const newCooldowns: Record<string, number> = {}
      Object.entries(state.life.cooldowns).forEach(([activity, cooldown]) => {
        const newCooldown = Math.max(0, cooldown - deltaTime)
        if (newCooldown > 0) {
          newCooldowns[activity] = newCooldown
        }
      })
      
      return {
        life: { ...state.life, cooldowns: newCooldowns }
      }
    }),
    
  updateMinigameState: (newState: Partial<MinigameState>) =>
    set((state) => ({
      life: {
        ...state.life,
        minigameState: {
          ...state.life.minigameState,
          ...newState
        }
      }
    })),
    
  resetCombo: () =>
    set((state) => ({
      life: {
        ...state.life,
        minigameState: {
          ...state.life.minigameState,
          currentCombo: 0,
          perfectStreak: 0
        }
      }
    })),
    
  addPerfect: () =>
    set((state) => {
      const newCombo = state.life.minigameState.currentCombo + 1
      const newStreak = state.life.minigameState.perfectStreak + 1
      
      return {
        life: {
          ...state.life,
          minigameState: {
            ...state.life.minigameState,
            currentCombo: newCombo,
            maxCombo: Math.max(state.life.minigameState.maxCombo, newCombo),
            perfectStreak: newStreak,
            totalPerfects: state.life.minigameState.totalPerfects + 1
          }
        }
      }
    }),
    
  getLifeSkillLevel: (skill: LifeSkillType) => {
    const { life } = get()
    return life.levels[skill]
  },
  
  canPerformActivity: (activity: string) => {
    const { life } = get()
    const cooldown = life.cooldowns[activity] || 0
    return cooldown <= 0
  }
}) 