import { StateCreator } from 'zustand'
import { TowerState, MonsterInstance, LogEntry, ThemeType } from '../types'

export interface TowerSlice {
  tower: TowerState
  
  // 액션들
  setCurrentFloor: (floor: number) => void
  setEnvType: (type: ThemeType) => void
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearLog: () => void
  setAutoMode: (auto: boolean) => void
  setAutoSpeed: (speed: number) => void
  spawnMobs: (mobs: MonsterInstance[]) => void
  updateMobHp: (mobIndex: number, hp: number) => void
  nextMob: () => void
}

const initialTowerState: TowerState = {
  currentFloor: 1, // 더미 데이터가 아닌 1층부터 시작
  floorSeed: 'floor_1_seed',
  envType: 'Flame',
  currentMobs: [],
  currentMobIndex: 0,
  combatLog: [
    {
      id: '1',
      timestamp: Date.now(),
      type: 'floor',
      message: '1층에 도착했습니다. 모험을 시작합니다!'
    }
  ],
  autoMode: false,
  autoSpeed: 1,
  isProcessing: false // 기획안에 맞게 추가
}

export const towerSlice: StateCreator<TowerSlice> = (set) => ({
  tower: initialTowerState,
  
  setCurrentFloor: (floor: number) =>
    set((state) => ({
      tower: { 
        ...state.tower, 
        currentFloor: floor,
        floorSeed: `floor_${floor}_seed`
      }
    })),
    
  setEnvType: (type: ThemeType) =>
    set((state) => ({
      tower: { ...state.tower, envType: type }
    })),
    
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }
    
    set((state) => ({
      tower: {
        ...state.tower,
        combatLog: [...state.tower.combatLog.slice(-99), newEntry] // 최근 100개만 유지
      }
    }))
  },
  
  clearLog: () =>
    set((state) => ({
      tower: { ...state.tower, combatLog: [] }
    })),
    
  setAutoMode: (auto: boolean) =>
    set((state) => ({
      tower: { ...state.tower, autoMode: auto }
    })),
    
  setAutoSpeed: (speed: number) =>
    set((state) => ({
      tower: { ...state.tower, autoSpeed: speed }
    })),
    
  spawnMobs: (mobs: MonsterInstance[]) =>
    set((state) => ({
      tower: { 
        ...state.tower, 
        currentMobs: mobs, 
        currentMobIndex: 0 
      }
    })),
    
  updateMobHp: (mobIndex: number, hp: number) =>
    set((state) => {
      const newMobs = [...state.tower.currentMobs]
      if (newMobs[mobIndex]) {
        newMobs[mobIndex] = {
          ...newMobs[mobIndex],
          hp: Math.max(0, hp)
        }
      }
      return {
        tower: { ...state.tower, currentMobs: newMobs }
      }
    }),
    
  nextMob: () =>
    set((state) => ({
      tower: { 
        ...state.tower, 
        currentMobIndex: state.tower.currentMobIndex + 1 
      }
    }))
}) 