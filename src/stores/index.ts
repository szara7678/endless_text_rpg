import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  PlayerState, TowerState, InventoryState, SkillState, UIState,
  Monster, CombatLogEntry 
} from '../types'
import { playerSlice, initialPlayerState } from './playerSlice'
import { inventorySlice } from './inventorySlice'
import { skillSlice } from './skillSlice'
import { uiSlice } from './uiSlice'
import { processAutoCombatTurn, generateNextMonster } from '../utils/combatEngine'
import { processItemDrops } from '../utils/dropSystem'

interface GameStore {
  // 상태
  player: PlayerState
  tower: TowerState  
  inventory: InventoryState
  skills: SkillState
  ui: UIState
  gameState: 'menu' | 'playing' | 'loading'

  // 게임 플로우
  startNewGame: () => Promise<void>
  continueGame: () => Promise<void>
  saveGame: () => Promise<void>
  resetGame: () => Promise<void>
  setGameState: (state: 'menu' | 'playing' | 'loading') => void

  // 자동 전투 시스템
  startAutoCombat: () => void
  stopAutoCombat: () => void
  processCombatTurn: () => Promise<void>
  handleMonsterDeath: (monster: Monster) => Promise<void>
  handlePlayerDeath: () => void
  proceedToNextFloor: () => Promise<void>

  // 로그 시스템
  addCombatLog: (type: CombatLogEntry['type'], message: string) => void
  clearCombatLog: () => void

  // 디버깅 및 긴급 기능
  forceResetToMenu: () => void
  setAutoMode: (autoMode: boolean) => void
  setAutoSpeed: (autoSpeed: number) => void
}

// 자동 전투 타이머
let autoCombatInterval: NodeJS.Timeout | null = null

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      player: initialPlayerState,
      tower: {
        currentFloor: 1,
        currentMonster: null,
        combatLog: [],
        autoMode: false,
        autoSpeed: 1,
        isInCombat: false
      },
      inventory: {} as InventoryState,
      skills: {} as SkillState,
      ui: {} as UIState,
      gameState: 'menu',

      // 게임 플로우 관리
      startNewGame: async () => {
        try {
          console.log('🎮 새 게임 초기화 중...')
          
          // 게임 상태 설정
          set((state: any) => ({
            ...state,
            player: {
              ...initialPlayerState,
              equipment: {
                weapon: null,
                armor: null,
                accessory: null
              }
            },
            tower: {
              currentFloor: 1,
              currentMonster: null,
              combatLog: [],
              autoMode: false,
              autoSpeed: 1,
              isInCombat: false
            },
            gameState: 'playing'
          }))
          
          // 첫 번째 몬스터 생성
          const { loadMonster } = await import('../utils/dataLoader')
          const monster = await loadMonster('flame_imp')
          
          if (monster) {
            set((state: any) => ({
              ...state,
              tower: {
                ...state.tower,
                currentMonster: monster,
                isInCombat: true,
                combatLog: [
                  {
                    id: '1',
                    timestamp: Date.now(),
                    type: 'floor',
                    message: '🗼 1층에 도착했습니다!'
                  },
                  {
                    id: '2', 
                    timestamp: Date.now() + 1,
                    type: 'combat',
                    message: `⚔️ ${monster.name}이(가) 나타났습니다!`
                  }
                ]
              }
            }))
          }
          
          console.log('✅ 새 게임 시작 완료!')
        } catch (error) {
          console.error('❌ 새 게임 시작 실패:', error)
        }
      },

      // 자동 전투 시스템
      startAutoCombat: () => {
        const { tower } = get()
        if (autoCombatInterval || !tower.isInCombat) return

        const speed = tower.autoSpeed || 1
        const interval = Math.max(500, 2000 / speed) // 속도에 따른 간격 조절

        autoCombatInterval = setInterval(() => {
          const currentState = get()
          if (currentState.tower.autoMode && currentState.tower.isInCombat) {
            currentState.processCombatTurn()
          } else {
            currentState.stopAutoCombat()
          }
        }, interval)
      },

      stopAutoCombat: () => {
        if (autoCombatInterval) {
          clearInterval(autoCombatInterval)
          autoCombatInterval = null
        }
      },

      processCombatTurn: async () => {
        const { player, tower } = get()
        if (!tower.currentMonster || !tower.isInCombat) return

        try {
          // 전투 한 턴 실행
          const result = await processAutoCombatTurn(
            player,
            tower.currentMonster,
            tower.currentFloor
          )

          // 상태 업데이트
          set((state: any) => ({
            ...state,
            player: {
              ...state.player,
              hp: result.playerHpAfter
            },
            tower: {
              ...state.tower,
              currentMonster: {
                ...state.tower.currentMonster,
                hp: result.monsterHpAfter
              },
              combatLog: [
                ...state.tower.combatLog,
                ...result.logs.map((log: any, index: number) => ({
                  id: `${Date.now()}_${index}`,
                  timestamp: Date.now() + index,
                  type: log.type || 'combat',
                  message: log.message || log
                }))
              ]
            }
          }))

          // 전투 결과 처리
          if (result.isMonsterDefeated) {
            await get().handleMonsterDeath(tower.currentMonster)
          } else if (result.isPlayerDefeated) {
            get().handlePlayerDeath()
          }

        } catch (error) {
          console.error('전투 처리 실패:', error)
          get().addCombatLog('combat', '⚠️ 전투 처리 중 오류가 발생했습니다.')
        }
      },

      handleMonsterDeath: async (monster: Monster) => {
        const { player, tower } = get()
        
        // 골드 획득
        const goldGained = monster.goldReward
        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            gold: state.player.gold + goldGained
          }
        }))

        get().addCombatLog('loot', `💰 ${goldGained} 골드를 획득했습니다!`)

        // 스킬 페이지 드롭 처리
        if (monster.skillPageDrops && monster.skillPageDrops.length > 0) {
          for (const skillPageId of monster.skillPageDrops) {
            // 20% 확률로 스킬 페이지 드롭
            if (Math.random() < 0.2) {
              get().addCombatLog('loot', `📜 ${skillPageId} 스킬 페이지를 획득했습니다!`)
              
              // TODO: 인벤토리에 스킬 페이지 추가
              // get().addSkillPage(skillPageId)
            }
          }
        }

        // 아이템 드롭 처리 (간단한 재료 드롭)
        if (monster.dropTableId) {
          // 60% 확률로 화염 광석 드롭
          if (Math.random() < 0.6) {
            const quantity = Math.floor(Math.random() * 3) + 1
            get().addCombatLog('loot', `🔥 화염 광석 ${quantity}개를 획득했습니다!`)
            // TODO: 인벤토리에 재료 추가
          }
          
          // 15% 확률로 체력 물약 드롭
          if (Math.random() < 0.15) {
            get().addCombatLog('loot', `🧪 체력 물약을 획득했습니다!`)
            // TODO: 인벤토리에 소모품 추가
          }
        }

        // 다음 층으로 진행
        await get().proceedToNextFloor()
      },

      handlePlayerDeath: () => {
        const { player } = get()
        
        get().addCombatLog('death', '💀 플레이어가 사망했습니다...')
        get().addCombatLog('death', '🔄 3층 뒤로 되돌아갑니다.')

        // 사망 패널티 적용
        const newFloor = Math.max(1, player.highestFloor - 3)
        
        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            hp: state.player.maxHp,
            mp: state.player.maxMp,
            highestFloor: newFloor,
            lastDeathAt: Date.now()
          },
          tower: {
            ...state.tower,
            currentFloor: newFloor,
            currentMonster: null,
            isInCombat: false,
            autoMode: false
          }
        }))

        // 잠시 후 새 몬스터 생성
        setTimeout(() => {
          get().proceedToNextFloor()
        }, 2000)
      },

      proceedToNextFloor: async () => {
        const { player } = get()
        const nextFloor = player.highestFloor + 1

        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            highestFloor: nextFloor
          },
          tower: {
            ...state.tower,
            currentFloor: nextFloor,
            isInCombat: false,
            currentMonster: null
          }
        }))

        get().addCombatLog('floor', `🗼 ${nextFloor}층에 도착했습니다!`)

        // 새 몬스터 생성
        try {
          const newMonster = await generateNextMonster(nextFloor)
          if (newMonster) {
            set((state: any) => ({
              ...state,
              tower: {
                ...state.tower,
                currentMonster: newMonster,
                isInCombat: true
              }
            }))
            
            get().addCombatLog('combat', `⚔️ ${newMonster.name}이(가) 나타났습니다!`)
          }
        } catch (error) {
          console.error('몬스터 생성 실패:', error)
          get().addCombatLog('combat', '⚠️ 몬스터를 불러오는데 실패했습니다.')
        }
      },

      // 로그 시스템
      addCombatLog: (type: CombatLogEntry['type'], message: string) => {
        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            combatLog: [
              ...state.tower.combatLog.slice(-49), // 최근 50개만 유지
              {
                id: `${Date.now()}_${Math.random()}`,
                timestamp: Date.now(),
                type,
                message
              }
            ]
          }
        }))
      },

      clearCombatLog: () => {
        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            combatLog: []
          }
        }))
      },

      // 자동 모드 관리
      setAutoMode: (autoMode: boolean) => {
        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            autoMode
          }
        }))

        // 자동 모드 시작/정지
        if (autoMode) {
          get().startAutoCombat()
        } else {
          get().stopAutoCombat()
        }
      },

      setAutoSpeed: (autoSpeed: number) => {
        const wasAuto = get().tower.autoMode
        
        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            autoSpeed
          }
        }))

        // 자동 모드가 켜져있으면 새 속도로 재시작
        if (wasAuto) {
          get().stopAutoCombat()
          get().startAutoCombat()
        }
      },

      // 기타 함수들 (임시 구현)
      continueGame: async () => {
        console.log('📂 이어하기 (준비 중)')
        set({ gameState: 'menu' } as any)
      },

      saveGame: async () => {
        console.log('💾 게임 저장 (준비 중)')
      },

      resetGame: async () => {
        console.log('🔄 게임 리셋 (준비 중)')
        set({ gameState: 'menu' } as any)
      },

      setGameState: (gameState: 'menu' | 'playing' | 'loading') => {
        set({ gameState } as any)
      },

      forceResetToMenu: () => {
        get().stopAutoCombat()
        console.log('🚨 강제 메뉴 복귀')
        set({ gameState: 'menu' } as any)
      }
    }),
    { name: 'game-store' }
  )
)

// 🔧 디버깅용: 전역 접근
if (typeof window !== 'undefined') {
  (window as any).gameStore = useGameStore
  console.log('🔧 디버깅: window.gameStore로 스토어 접근 가능')
  console.log('🔧 메뉴 리셋: window.gameStore.getState().forceResetToMenu()')
} 