import { StateCreator } from 'zustand'
import { UIState, Notification, GameSettings } from '../types'

export interface UISlice {
  ui: UIState
  
  // 액션들
  setActivePanel: (panel: 'life' | 'character' | 'shop' | 'inventory' | 'settings' | null) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  updateSettings: (settings: Partial<GameSettings>) => void
}

const initialUIState: UIState = {
  activePanel: null,
  notifications: [],
  settings: {
    sfxVolume: 0.7,
    musicVolume: 0.5,
    fabPosition: 'center',
    textSpeed: 1,
    autoSave: true,
    offlineRewards: true,
    hapticFeedback: true
  }
}

export const uiSlice: StateCreator<UISlice> = (set, get) => ({
  ui: initialUIState,
  
  setActivePanel: (panel: 'life' | 'character' | 'shop' | 'inventory' | 'settings' | null) =>
    set((state) => ({
      ui: { ...state.ui, activePanel: panel }
    })),
    
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }
    
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [...state.ui.notifications, newNotification]
      }
    }))
    
    // 자동으로 알림 제거 (duration이 설정된 경우)
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(newNotification.id)
      }, notification.duration)
    }
  },
  
  removeNotification: (id: string) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter(n => n.id !== id)
      }
    })),
    
  updateSettings: (newSettings: Partial<GameSettings>) =>
    set((state) => ({
      ui: {
        ...state.ui,
        settings: { ...state.ui.settings, ...newSettings }
      }
    }))
}) 