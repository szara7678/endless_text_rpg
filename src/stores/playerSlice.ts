import { StateCreator } from 'zustand'
import { PlayerState } from '../types'

export interface PlayerSlice {
  player: PlayerState
  
  // 액션들
  updatePlayerHp: (hp: number) => void
  updatePlayerMp: (mp: number) => void
  addGold: (amount: number) => void
  addGem: (amount: number) => void
  setCurrentFloor: (floor: number) => void
  updateAscensionGauge: (amount: number) => void
  takeDamage: (damage: number) => void
  heal: (amount: number) => void
  spendMp: (amount: number) => boolean
  restoreMp: (amount: number) => void
  ascend: () => void
  spendGold: (amount: number) => void
  gainGold: (amount: number) => void
}

// 초기 플레이어 상태 (기획안: 레벨 없음, currentFloor → highestFloor)
export const initialPlayerState: PlayerState = {
  // 생명 정보
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  
  // 기본 스탯
  highestFloor: 1,
  
  // 재화
  gold: 1000, // 초기 골드 지급
  gem: 0,
  
  // 기본 전투 스탯 (base~ 값들)
  basePhysicalAttack: 15,
  baseMagicalAttack: 10,
  basePhysicalDefense: 8,
  baseMagicalDefense: 6,
  baseSpeed: 12,
  
  // 계산된 전투 스탯 (초기값은 base와 동일)
  physicalAttack: 15,
  magicalAttack: 10,
  physicalDefense: 8,
  magicalDefense: 6,
  speed: 12,
  
  // 기본 상성 스탯
  baseElementalStats: {
    flame: { attack: 0, resistance: 0 },
    frost: { attack: 0, resistance: 0 },
    toxic: { attack: 0, resistance: 0 },
    shadow: { attack: 0, resistance: 0 },
    thunder: { attack: 0, resistance: 0 },
    verdant: { attack: 0, resistance: 0 }
  },
  
  // 계산된 상성 스탯 (초기값은 base와 동일)
  elementalStats: {
    flame: { attack: 0, resistance: 0 },
    frost: { attack: 0, resistance: 0 },
    toxic: { attack: 0, resistance: 0 },
    shadow: { attack: 0, resistance: 0 },
    thunder: { attack: 0, resistance: 0 },
    verdant: { attack: 0, resistance: 0 }
  },
  
  // 장비
  equipment: {
    weapon: null,
    armor: null,
    accessory: null
  },
  
  // 환생 시스템
  rebirthLevel: 0,
  ascensionGauge: 0,
  
  // 기타
  lastDeathAt: undefined,
  totalPlayTime: 0
}

export const playerSlice: StateCreator<PlayerSlice> = (set, get) => ({
  player: initialPlayerState,
  
  updatePlayerHp: (hp: number) => 
    set((state) => ({
      player: { ...state.player, hp: Math.max(0, Math.min(hp, state.player.maxHp)) }
    })),
    
  updatePlayerMp: (mp: number) => 
    set((state) => ({
      player: { ...state.player, mp: Math.max(0, Math.min(mp, state.player.maxMp)) }
    })),
    
  addGold: (amount: number) => 
    set((state) => ({
      player: { ...state.player, gold: state.player.gold + amount }
    })),
    
  addGem: (amount: number) => 
    set((state) => ({
      player: { ...state.player, gem: state.player.gem + amount }
    })),
    
  spendGold: (amount: number) => 
    set((state) => ({
      player: { ...state.player, gold: Math.max(0, state.player.gold - amount) }
    })),
    
  gainGold: (amount: number) => 
    set((state) => ({
      player: { ...state.player, gold: state.player.gold + amount }
    })),
    
  setCurrentFloor: (floor: number) => 
    set((state) => ({
      player: { 
        ...state.player, 
        highestFloor: Math.max(state.player.highestFloor, floor) // 최고 층수만 업데이트
      }
    })),
    
  updateAscensionGauge: (amount: number) => 
    set((state) => ({
      player: { 
        ...state.player, 
        ascensionGauge: Math.min(100, Math.max(0, state.player.ascensionGauge + amount))
      }
    })),
    
  takeDamage: (damage: number) => {
    const { player } = get()
    const newHp = Math.max(0, player.hp - damage)
    set((state) => ({
      player: { 
        ...state.player, 
        hp: newHp,
        lastDeathAt: newHp === 0 ? Date.now() : state.player.lastDeathAt
      }
    }))
  },
  
  heal: (amount: number) => {
    const { player } = get()
    set((state) => ({
      player: { 
        ...state.player, 
        hp: Math.min(player.maxHp, player.hp + amount)
      }
    }))
  },
  
  spendMp: (amount: number) => {
    const { player } = get()
    if (player.mp >= amount) {
      set((state) => ({
        player: { ...state.player, mp: player.mp - amount }
      }))
      return true
    }
    return false
  },
  
  restoreMp: (amount: number) => {
    const { player } = get()
    set((state) => ({
      player: { 
        ...state.player, 
        mp: Math.min(player.maxMp, player.mp + amount)
      }
    }))
  },
  
  ascend: () => {
    const { player } = get()
    // 기획안: 100층 이상에서만 환생 가능 (층수 체크는 UI에서 처리)
    if (player.ascensionGauge >= 100) {
      // 환생 처리 (기획안 4-D)
      set((state) => ({
        player: {
          ...initialPlayerState,
          rebirthLevel: state.player.rebirthLevel + 1,
          totalPlayTime: state.player.totalPlayTime
        }
      }))
    }
  }
}) 