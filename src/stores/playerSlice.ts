import { StateCreator } from 'zustand'
import { PlayerState } from '../types'

export interface PlayerSlice {
  player: PlayerState
  
  // 액션들
  updatePlayerHp: (hp: number) => void
  updatePlayerMp: (mp: number) => void
  addGold: (amount: number) => void
  addGem: (amount: number) => void
  addAscensionPoints: (amount: number) => void
  setCurrentFloor: (floor: number) => void
  updateAscensionGauge: (amount: number) => void
  takeDamage: (damage: number) => void
  heal: (amount: number) => void
  spendMp: (amount: number) => void
  restoreMp: (amount: number) => void
  ascend: () => void
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
  gold: 0,
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
  
  // 장비
  equipment: {
    weapon: null,
    armor: null,
    accessory: null
  },
  
  // 환생 시스템
  rebirthLevel: 0,
  actionPoints: 50,
  maxActionPoints: 50,
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
    
  addAscensionPoints: (amount: number) => 
    set((state) => ({
      player: { ...state.player, actionPoints: state.player.actionPoints + amount }
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
      // AP는 최고 층수 기준으로 계산
      const apGained = Math.floor(player.highestFloor / 10)
      // 환생 처리 (기획안 4-D)
      set((state) => ({
        player: {
          ...initialPlayerState,
          rebirthLevel: state.player.rebirthLevel + 1,
          actionPoints: state.player.actionPoints + apGained, // ascensionPoints → actionPoints
          totalPlayTime: state.player.totalPlayTime
        }
      }))
    }
  },
  
  // AP 획득 (기획안: 환생 시스템)
  gainActionPoints: (amount: number) => set((state) => ({
    player: { ...state.player, actionPoints: state.player.actionPoints + amount }
  }))
}) 