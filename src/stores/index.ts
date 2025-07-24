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
  startAutoSave: () => void

  // UI 관리
  setActivePanel: (panel: 'character' | 'inventory' | 'shop' | null) => void

  // 인벤토리 관리
  addItem: (itemId: string, quantity: number) => void
  addMaterial: (materialId: string, count: number) => void
  addSkillPage: (skillId: string) => void

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
      inventory: {
        maxSlots: 100,
        usedSlots: 0,
        items: [],
        materials: [],
        consumables: [],
        skillPages: []
      },
      skills: {
        activeSkills: [],
        passiveSkills: [],
        pagesOwned: {},
        skillPages: [],
        learnedSkills: []
      },
      ui: {
        activePanel: null,
        notifications: []
      },
      gameState: 'menu',

      // 자동 저장 (5초마다)
      startAutoSave: () => {
        setInterval(() => {
          const state = get()
          if (state.gameState === 'playing') {
            const saveData = {
              player: state.player,
              tower: state.tower,
              inventory: state.inventory,
              skills: state.skills,
              timestamp: Date.now()
            }
            localStorage.setItem('endless_rpg_save', JSON.stringify(saveData))
            console.log('💾 자동 저장 완료')
          }
        }, 5000)
      },

      // 게임 플로우 관리
      startNewGame: async () => {
        try {
          console.log('🎮 새 게임 초기화 시작...')
          
          // 1단계: 초기 데이터 로딩
          console.log('📦 1단계: 초기 데이터 로딩 중...')
          const { loadInitialCharacter, loadInitialInventory, loadInitialSkills, loadInitialTower, loadMonster } = await import('../utils/dataLoader')
          
          const [initialCharacter, initialInventory, initialSkills, initialTower] = await Promise.all([
            loadInitialCharacter(),
            loadInitialInventory(), 
            loadInitialSkills(),
            loadInitialTower()
          ])
          console.log('✅ 1단계 완료: 초기 데이터 로드됨')
          
          // 2단계: 게임 상태 설정
          console.log('📝 2단계: 게임 상태 초기화 중...')
          set((state: any) => ({
            ...state,
            player: {
              // initial 데이터 사용하되 없으면 기본값 사용
              hp: initialCharacter?.hp || initialPlayerState.hp,
              maxHp: initialCharacter?.maxHp || initialPlayerState.maxHp,
              mp: initialCharacter?.mp || initialPlayerState.mp,
              maxMp: initialCharacter?.maxMp || initialPlayerState.maxMp,
              
              // 기본 스탯
              highestFloor: initialCharacter?.highestFloor || 1,
              gold: initialCharacter?.gold || 100,
              gem: initialCharacter?.gem || 0,
              
              // 기본 전투 스탯
              basePhysicalAttack: initialCharacter?.physicalAttack || initialPlayerState.basePhysicalAttack,
              baseMagicalAttack: initialCharacter?.magicalAttack || initialPlayerState.baseMagicalAttack,
              basePhysicalDefense: initialCharacter?.physicalDefense || initialPlayerState.basePhysicalDefense,
              baseMagicalDefense: initialCharacter?.magicalDefense || initialPlayerState.baseMagicalDefense,
              baseSpeed: initialCharacter?.speed || initialPlayerState.baseSpeed,
              
              // 계산된 전투 스탯 (초기값은 base와 동일)
              physicalAttack: initialCharacter?.physicalAttack || initialPlayerState.physicalAttack,
              magicalAttack: initialCharacter?.magicalAttack || initialPlayerState.magicalAttack,
              physicalDefense: initialCharacter?.physicalDefense || initialPlayerState.physicalDefense,
              magicalDefense: initialCharacter?.magicalDefense || initialPlayerState.magicalDefense,
              speed: initialCharacter?.speed || initialPlayerState.speed,
              
              // 장비 (초기 장비 사용)
              equipment: {
                weapon: initialInventory?.equipment?.weapon || null,
                armor: initialInventory?.equipment?.chest || null,
                accessory: initialInventory?.equipment?.amulet || null
              },
              
              // 환생 시스템
              rebirthLevel: initialCharacter?.ascensionPoints || 0,
              actionPoints: 50,
              maxActionPoints: 50,
              ascensionGauge: initialCharacter?.ascensionGauge || 0,
              
              // 기타
              lastDeathAt: undefined,
              totalPlayTime: initialCharacter?.totalPlayTime || 0
            },
            inventory: {
              maxSlots: initialInventory?.maxSlots || 100,
              usedSlots: initialInventory?.usedSlots || 0,
              items: [], // 소모품은 별도 처리
              materials: initialInventory?.materials || [],
              consumables: [], // 소모품 변환 필요
              skillPages: []
            },
            skills: {
              activeSkills: initialSkills?.activeSkills || [],
              passiveSkills: initialSkills?.passiveSkills || [],
              pagesOwned: initialSkills?.pagesOwned || {},
              skillPages: [],
              learnedSkills: []
            },
            tower: {
              currentFloor: initialTower?.currentFloor || 1,
              currentMonster: null,
              combatLog: [],
              autoMode: initialTower?.autoMode || false,
              autoSpeed: initialTower?.autoSpeed || 1,
              isInCombat: false
            },
            gameState: 'loading'
          }))
          console.log('✅ 2단계 완료: 초기 상태 설정됨')
          
          // 3단계: 소모품 변환 (consumables 객체를 배열로 변환)
          if (initialInventory?.consumables) {
            const consumablesArray = Object.entries(initialInventory.consumables).map(([itemId, quantity]: [string, any]) => ({
              itemId,
              quantity: Number(quantity),
              level: 1
            }))
            
            set((state: any) => ({
              ...state,
              inventory: {
                ...state.inventory,
                items: consumablesArray
              }
            }))
            console.log('✅ 3단계 완료: 소모품 변환됨')
          }
          
          // 4단계: 첫 번째 몬스터 생성
          console.log('👹 4단계: flame_imp 몬스터 로딩 중...')
          const monster = await loadMonster('flame_imp')
          console.log('몬스터 데이터:', monster)
          
          if (monster) {
            console.log('✅ 4단계 완료: 몬스터 로드 성공')
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
              },
              gameState: 'playing'
            }))
            console.log('✅ 게임 상태를 playing으로 변경')
          } else {
            console.error('❌ 몬스터 로드 실패 - null 반환')
            // 몬스터 로드 실패시에도 게임은 시작
            set((state: any) => ({
              ...state,
              tower: {
                ...state.tower,
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
                    message: '⚠️ 몬스터를 불러오는데 실패했습니다.'
                  }
                ]
              },
              gameState: 'playing'
            }))
          }
          
          // 5단계: 자동 저장 시작
          console.log('💾 5단계: 자동 저장 시작...')
          get().startAutoSave()
          console.log('✅ 5단계 완료: 자동 저장 시작됨')
          
          console.log('🎉 새 게임 시작 완료!')
        } catch (error) {
          console.error('❌ 새 게임 시작 실패:', error)
          console.error('에러 상세:', error.message, error.stack)
          
          // 에러 발생시 강제로 게임 상태를 playing으로 변경
          set((state: any) => ({
            ...state,
            tower: {
              ...state.tower,
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
                  message: '⚠️ 초기화 중 오류가 발생했지만 게임을 시작합니다.'
                }
              ]
            },
            gameState: 'playing'
          }))
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
              get().addSkillPage(skillPageId)
            }
          }
        }

        // 아이템 드롭 처리 (간단한 재료 드롭)
        if (monster.dropTableId) {
          // 60% 확률로 화염 광석 드롭
          if (Math.random() < 0.6) {
            const quantity = Math.floor(Math.random() * 3) + 1
            get().addCombatLog('loot', `🔥 화염 광석 ${quantity}개를 획득했습니다!`)
            get().addMaterial('flame_ore', quantity)
          }
          
          // 15% 확률로 체력 물약 드롭
          if (Math.random() < 0.15) {
            get().addCombatLog('loot', `🧪 체력 물약을 획득했습니다!`)
            get().addItem('health_potion', 1)
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
        try {
          console.log('📂 저장된 게임 불러오는 중...')
          
          const saveData = localStorage.getItem('endless_rpg_save')
          if (!saveData) {
            alert('저장된 게임이 없습니다.')
            return
          }
          
          const data = JSON.parse(saveData)
          
          // 저장된 데이터로 상태 복원
          set((state: any) => ({
            ...state,
            player: data.player,
            tower: data.tower,
            inventory: data.inventory,
            skills: data.skills,
            gameState: 'playing'
          }))
          
          // 자동 저장 시작
          get().startAutoSave()
          
          console.log('✅ 게임 불러오기 완료!')
          
          // 전투 중이었다면 자동 전투 재시작
          if (data.tower.autoMode && data.tower.isInCombat) {
            get().startAutoCombat()
          }
          
        } catch (error) {
          console.error('❌ 게임 불러오기 실패:', error)
          alert('저장된 게임을 불러오는데 실패했습니다.')
        }
      },

      saveGame: async () => {
        try {
          const state = get()
          const saveData = {
            player: state.player,
            tower: state.tower,
            inventory: state.inventory,
            skills: state.skills,
            timestamp: Date.now()
          }
          localStorage.setItem('endless_rpg_save', JSON.stringify(saveData))
          console.log('💾 수동 저장 완료!')
          
          // 저장 완료 알림 (UI에 표시)
          get().addCombatLog('combat', '💾 게임이 저장되었습니다.')
        } catch (error) {
          console.error('❌ 게임 저장 실패:', error)
        }
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
      },

      // UI 관리
      setActivePanel: (panel: 'character' | 'inventory' | 'shop' | null) => {
        set((state: any) => ({
          ...state,
          ui: {
            ...state.ui,
            activePanel: panel
          }
        }))
      },

      // 인벤토리 관리
      addItem: (itemId: string, quantity: number) => {
        set((state: any) => ({
          ...state,
          inventory: {
            ...state.inventory,
            items: [
              ...state.inventory.items,
              { itemId, quantity, level: 1 }
            ]
          }
        }))
      },

      addMaterial: (materialId: string, count: number) => {
        set((state: any) => {
          const materials = [...state.inventory.materials]
          const existingIndex = materials.findIndex(m => m.materialId === materialId)
          
          if (existingIndex >= 0) {
            materials[existingIndex].count += count
          } else {
            materials.push({
              materialId,
              name: materialId.replace('_', ' '),
              level: 1,
              count
            })
          }
          
          return {
            ...state,
            inventory: {
              ...state.inventory,
              materials
            }
          }
        })
      },

      addSkillPage: (skillId: string) => {
        set((state: any) => {
          const skillPages = [...state.inventory.skillPages]
          const existingIndex = skillPages.findIndex(sp => sp.skillId === skillId)
          
          if (existingIndex >= 0) {
            skillPages[existingIndex].count += 1
          } else {
            skillPages.push({
              skillId,
              count: 1
            })
          }
          
          return {
            ...state,
            inventory: {
              ...state.inventory,
              skillPages
            }
          }
        })
      },
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