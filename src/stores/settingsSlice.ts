import { StateCreator } from 'zustand'
import { PotionSettings } from '../utils/potionSystem'

export interface SettingsSlice {
  settings: {
    potionSettings: PotionSettings
  }
  
  // 액션들
  updatePotionSettings: (settings: Partial<PotionSettings>) => void
  resetToMenu: () => void
}

export const initialSettingsState = {
  potionSettings: {
    autoUseEnabled: true,
    hpThreshold: 20, // HP 20% 미만일 때 자동 사용
    mpThreshold: 20, // MP 20% 미만일 때 자동 사용
    useHighestFirst: true // 높은 레벨 물약 우선 사용
  }
}

export const settingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  settings: initialSettingsState,
  
  updatePotionSettings: (newSettings: Partial<PotionSettings>) => 
    set((state) => ({
      settings: {
        ...state.settings,
        potionSettings: {
          ...state.settings.potionSettings,
          ...newSettings
        }
      }
    })),
    
  resetToMenu: () => {
    // 게임 상태를 메인 메뉴로 변경
    const gameStore = (get as any).getState?.() || {}
    if (gameStore.setGameState) {
      gameStore.setGameState('menu')
    }
  }
}) 