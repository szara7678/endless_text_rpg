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
import { lifeSlice } from './lifeSlice'
import { processAutoCombatTurn, generateNextMonster } from '../utils/combatEngine'
import { processItemDrops } from '../utils/dropSystem'
import * as EquipmentSystem from '../utils/equipmentSystem'
import { generateInitialItems } from '../utils/itemGenerator'

// equipmentSystem 함수들을 destructure
const { 
  equipItem, 
  unequipItem, 
  enhanceEquipment, 
  calculateEnhancementCost, 
  recalculatePlayerStats 
} = EquipmentSystem

interface GameStore {
  // 상태
  player: PlayerState
  tower: TowerState
  inventory: InventoryState
  skills: SkillState
  ui: UIState
  life: any // LifeSkillState
  gameState: 'menu' | 'playing' | 'loading'

  // 게임 플로우
  startNewGame: () => Promise<void>
  continueGame: () => Promise<void>
  saveGame: () => Promise<void>
  resetGame: () => Promise<void>
  setGameState: (state: 'menu' | 'playing' | 'loading') => void
  startAutoSave: () => void
  loadInitialInventory: () => Promise<void>

  // UI 관리
  setActivePanel: (panel: 'character' | 'inventory' | 'shop' | 'life' | null) => void

  // 인벤토리 관리
  addItem: (itemId: string, quantity: number) => void
  addMaterial: (materialId: string, count: number) => void
  addSkillPage: (skillId: string) => void
  removeMaterial: (materialId: string, count: number) => void

  // 스킬 시스템
  unlockSkill: (skillId: string) => void
  levelUpSkill: (skillId: string) => void
  addSkillTrainingXp: (skillId: string, event: 'cast' | 'killWeak' | 'perfect' | 'kill', customXp?: number) => void

  // 장비 시스템
  equipItem: (itemId: string) => void
  unequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void
  enhanceEquipment: (slot: 'weapon' | 'armor' | 'accessory') => void

  // 생활 스킬 시스템
  addLifeSkillXp: (skillType: any, xp: number) => void
  levelUpLifeSkill: (skillType: any) => void
  startCooldown: (skillType: any, duration: number) => void
  startMinigame: (skillType: any, gameType: 'slot' | 'rhythm' | 'matching' | 'timing') => void
  endMinigame: (result: any) => void
  startCrafting: (recipeId: string) => void
  completeCrafting: () => void

  // 환생 시스템
  canRebirth: () => { canRebirth: boolean, currentFloor: number, apGain: number }
  executeRebirth: (benefits: { ap: number, skillLevelBonus: number, materialBonus: number }) => void

  // 상점 시스템
  purchaseItem: (item: any) => void

  // 자동 전투 시스템
  startAutoCombat: (speed: number) => void
  stopAutoCombat: () => void
  setAutoMode: (autoMode: boolean) => void
  setAutoSpeed: (speed: number) => void
  performCombatAction: (action: 'attack' | 'skill' | 'defend') => Promise<void>
  handleMonsterDeath: (monster: Monster) => Promise<void>
  handlePlayerDeath: () => Promise<void>
  proceedToNextFloor: () => Promise<void>
  addCombatLog: (type: CombatLogEntry['type'], message: string) => void
  clearCombatLog: () => void
  forceResetToMenu: () => void
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
      life: {
        skills: {
          smithing: { id: 'smithing', name: '제작', level: 1, currentXp: 0, maxXp: 100, unlocked: true },
          alchemy: { id: 'alchemy', name: '연금술', level: 1, currentXp: 0, maxXp: 100, unlocked: true },
          cooking: { id: 'cooking', name: '요리', level: 1, currentXp: 0, maxXp: 100, unlocked: true },
          fishing: { id: 'fishing', name: '낚시', level: 1, currentXp: 0, maxXp: 100, unlocked: false },
          farming: { id: 'farming', name: '농사', level: 1, currentXp: 0, maxXp: 100, unlocked: false },
          herbalism: { id: 'herbalism', name: '채집', level: 1, currentXp: 0, maxXp: 100, unlocked: false },
          mining: { id: 'mining', name: '광산', level: 1, currentXp: 0, maxXp: 100, unlocked: false }
        },
        activeMinigame: null
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

      // 초기 인벤토리 로드
      loadInitialInventory: async () => {
        try {
          console.log('📦 초기 인벤토리 로드 중...')
          
          // initial/inventory.json 로드
          const initialInventoryResponse = await fetch('/src/data/initial/inventory.json')
          const initialInventoryData = await initialInventoryResponse.json()
          
          // 초기 아이템들 생성
          const generatedItems = await generateInitialItems(initialInventoryData.initialItems)
          
          // 인벤토리 상태 업데이트
          set((state: any) => ({
            ...state,
            inventory: {
              ...state.inventory,
              items: generatedItems,
              materials: initialInventoryData.initialMaterials.map((m: any) => ({
                materialId: m.materialId,
                name: m.materialId.replace(/_/g, ' '),
                level: m.level,
                count: m.count
              })),
              consumables: initialInventoryData.initialConsumables,
              usedSlots: generatedItems.length + initialInventoryData.initialMaterials.length + initialInventoryData.initialConsumables.length
            }
          }))
          
          console.log(`✅ 초기 인벤토리 로드 완료: 아이템 ${generatedItems.length}개, 재료 ${initialInventoryData.initialMaterials.length}개, 소모품 ${initialInventoryData.initialConsumables.length}개`)
          
        } catch (error) {
          console.error('❌ 초기 인벤토리 로드 실패:', error)
          
          // 기본 아이템만 지급
          set((state: any) => ({
            ...state,
            inventory: {
              ...state.inventory,
              items: [
                { itemId: 'wooden_sword', level: 1, quantity: 1, uniqueId: 'default_sword', quality: 'Common', enhancement: 0 }
              ],
              consumables: [
                { itemId: 'health_potion', level: 1, quantity: 3 }
              ],
              usedSlots: 2
            }
          }))
        }
      },

      startNewGame: async () => {
        try {
          console.log('🎮 새 게임 시작!')
          set({ gameState: 'loading' } as any)
          
          // 1단계: 초기 데이터 로드
          console.log('⏳ 1단계: 초기 데이터 로드 중...')
          const [initialCharacterResponse, initialInventoryResponse, initialSkillsResponse, initialTowerResponse] = await Promise.all([
            fetch('/src/data/initial/character.json'),
            fetch('/src/data/initial/inventory.json'),
            fetch('/src/data/initial/skills.json'),
            fetch('/src/data/initial/tower.json')
          ])
          
          const [initialCharacter, initialInventory, initialSkills, initialTower] = await Promise.all([
            initialCharacterResponse.json(),
            initialInventoryResponse.json(),
            initialSkillsResponse.json(),
            initialTowerResponse.json()
          ])
          
          console.log('✅ 1단계 완료: 초기 데이터 로드됨')
          
          // 2단계: 상태 초기화
          console.log('⏳ 2단계: 게임 상태 초기화 중...')
          
          set((state: any) => ({
            ...state,
            player: {
              // 생명 정보 (기획안)
              hp: initialCharacter?.hp || 100,
              maxHp: initialCharacter?.maxHp || 100,
              mp: initialCharacter?.mp || 50,
              maxMp: initialCharacter?.maxMp || 50,
              
              // 재화
              gold: initialCharacter?.gold || 1000,
              gem: initialCharacter?.gem || 0,
              
              // 기본 스탯 (base~)
              basePhysicalAttack: initialCharacter?.basePhysicalAttack || 15,
              baseMagicalAttack: initialCharacter?.baseMagicalAttack || 10,
              basePhysicalDefense: initialCharacter?.basePhysicalDefense || 8,
              baseMagicalDefense: initialCharacter?.baseMagicalDefense || 6,
              baseSpeed: initialCharacter?.baseSpeed || 12,
              
              // 계산된 스탯 (기본값은 base와 동일)
              physicalAttack: initialCharacter?.basePhysicalAttack || 15,
              magicalAttack: initialCharacter?.baseMagicalAttack || 10,
              physicalDefense: initialCharacter?.basePhysicalDefense || 8,
              magicalDefense: initialCharacter?.baseMagicalDefense || 6,
              speed: initialCharacter?.baseSpeed || 12,
              
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
              
              // 최고 층수
              highestFloor: initialCharacter?.highestFloor || 1,
              
              // 장비 (초기 장비 사용)
              equipment: {
                weapon: initialInventory?.equipment?.weapon || null,
                armor: initialInventory?.equipment?.chest || null,
                accessory: initialInventory?.equipment?.amulet || null
              },
              
              // 환생 시스템
              rebirthLevel: initialCharacter?.ascensionPoints || 0,
              ascensionGauge: initialCharacter?.ascensionGauge || 0,
              
              // 기타
              lastDeathAt: undefined,
              totalPlayTime: initialCharacter?.totalPlayTime || 0
            },
            inventory: {
              maxSlots: initialInventory?.maxSlots || 100,
              usedSlots: 0, // 초기 인벤토리 로드 시 업데이트
              items: [],
              materials: [],
              consumables: [],
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
          
          // 3단계: 초기 인벤토리 로드
          console.log('⏳ 3단계: 초기 인벤토리 생성 중...')
          await get().loadInitialInventory()
          console.log('✅ 3단계 완료: 초기 인벤토리 생성됨')
          
          // 4단계: 첫 몬스터 생성
          console.log('⏳ 4단계: 첫 몬스터 생성 중...')
          try {
            const firstMonster = await generateNextMonster(1)
            if (firstMonster) {
              set((state: any) => ({
                ...state,
                tower: {
                  ...state.tower,
                  currentMonster: firstMonster,
                  isInCombat: true
                }
              }))
              console.log('✅ 4단계 완료: 첫 몬스터 생성됨')
            }
          } catch (error) {
            console.error('첫 몬스터 생성 실패:', error)
          }
          
          // 5단계: 게임 시작
          console.log('⏳ 5단계: 게임 시작...')
          set({ gameState: 'playing' } as any)
          get().startAutoSave()
          console.log('🎉 새 게임 시작 완료!')
          
        } catch (error) {
          console.error('❌ 새 게임 시작 실패:', error)
          set({ gameState: 'menu' } as any)
        }
      },

      // 자동 전투 시스템
      startAutoCombat: (speed: number) => {
        const { tower } = get()
        if (autoCombatInterval) return

        const interval = Math.max(500, 2000 / speed) // 속도에 따른 간격 조절

        autoCombatInterval = setInterval(async () => {
          try {
            const currentState = get()
            // 전투 중이 아니고 몬스터가 없으면 새 몬스터 생성
            if (!currentState.tower.isInCombat && !currentState.tower.currentMonster) {
              const newMonster = await generateNextMonster(currentState.tower.currentFloor)
              if (newMonster) {
                set((state: any) => ({
                  ...state,
                  tower: {
                    ...state.tower,
                    currentMonster: newMonster,
                    isInCombat: true
                  }
                }))
                get().addCombatLog('combat', `👹 ${newMonster.name}이(가) 나타났습니다!`)
              }
            }
            
            // 전투 액션 수행
            if (currentState.tower.isInCombat && currentState.tower.currentMonster) {
              await get().performCombatAction('attack')
            }
          } catch (error) {
            console.error('자동 전투 오류:', error)
            get().stopAutoCombat()
          }
        }, interval)

        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            autoMode: true,
            autoSpeed: speed
          }
        }))

        get().addCombatLog('combat', `⚡ 자동 전투 시작 (속도: ${speed}x)`)
      },

      stopAutoCombat: () => {
        if (autoCombatInterval) {
          clearInterval(autoCombatInterval)
          autoCombatInterval = null
        }

        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            autoMode: false
          }
        }))

        get().addCombatLog('combat', '⏸️ 자동 전투 정지')
      },

      // 자동 전투 속도 설정
      setAutoSpeed: (speed: number) => {
        set((state: any) => ({
          ...state,
          tower: {
            ...state.tower,
            autoSpeed: speed
          }
        }))
      },

      // 전투 액션 수행
      performCombatAction: async (action: 'attack' | 'skill' | 'defend') => {
        const { player, tower } = get()
        if (!tower.currentMonster || !tower.isInCombat) return
        
        try {
          // 전투 한 턴 실행
          const result = await processAutoCombatTurn(player, tower.currentMonster, tower.currentFloor)
          
          // 상태 업데이트
          set((state: any) => ({
            ...state,
            player: { 
              ...state.player, 
              hp: result.playerHpAfter
            },
            tower: {
              ...state.tower,
              currentMonster: result.monsterHpAfter > 0 ? {
                ...state.tower.currentMonster,
                hp: result.monsterHpAfter
              } : null,
              isInCombat: result.monsterHpAfter > 0 && result.playerHpAfter > 0,
              combatLog: [
                ...state.tower.combatLog.slice(-49), // 최근 50개만 유지
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
            await get().handlePlayerDeath()
          }
          
        } catch (error) {
          console.error('전투 액션 실패:', error)
          get().addCombatLog('combat', '⚠️ 전투 처리 중 오류가 발생했습니다.')
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

      // 몬스터 사망 처리
      handleMonsterDeath: async (monster: Monster) => {
        try {
          console.log(`💀 ${monster.name} 처치!`)
          
          // 골드 획득
          const goldGain = Math.floor(Math.random() * 20) + 10
          set((state: any) => ({
            ...state,
            player: {
              ...state.player,
              gold: state.player.gold + goldGain
            }
          }))
          get().addCombatLog('loot', `💰 골드 +${goldGain}`)
          
          // 간단한 아이템 드롭
          if (Math.random() < 0.3) {
            get().addMaterial('iron_ore', 1)
            get().addCombatLog('loot', `⛏️ 철 광석 획득!`)
          }
          
          // 몬스터 제거 및 다음 몬스터 생성
          const { tower } = get()
          const nextMonster = await generateNextMonster(tower.currentFloor)
          
          if (nextMonster) {
            set((state: any) => ({
              ...state,
              tower: {
                ...state.tower,
                currentMonster: nextMonster,
                isInCombat: true
              }
            }))
            get().addCombatLog('combat', `👹 ${nextMonster.name}이(가) 나타났습니다!`)
          } else {
            // 몬스터가 없으면 다음 층으로
            await get().proceedToNextFloor()
          }
          
        } catch (error) {
          console.error('몬스터 사망 처리 실패:', error)
        }
      },

      // 플레이어 사망 처리
      handlePlayerDeath: async () => {
        console.log('💀 플레이어 사망!')
        
        const { player } = get()
        // 3층 전으로 돌아가기 (최소 1층)
        const newFloor = Math.max(1, player.highestFloor - 3)
        
        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            hp: state.player.maxHp,
            mp: state.player.maxMp,
            highestFloor: newFloor // 최고 층도 함께 조정
          },
          tower: {
            ...state.tower,
            currentFloor: newFloor,
            currentMonster: null,
            isInCombat: false
          }
        }))
        
        get().addCombatLog('floor', `💀 사망하여 ${newFloor}층으로 돌아갑니다...`)
        get().stopAutoCombat()
        
        // 해당 층에 맞는 몬스터 생성
        try {
          const newMonster = await generateNextMonster(newFloor)
          if (newMonster) {
            set((state: any) => ({
              ...state,
              tower: {
                ...state.tower,
                currentMonster: newMonster,
                isInCombat: true
              }
            }))
            
            get().addCombatLog('combat', `👹 ${newMonster.name}이(가) 나타났습니다!`)
          }
        } catch (error) {
          console.error('몬스터 생성 실패:', error)
          get().addCombatLog('combat', '⚠️ 몬스터를 불러오는데 실패했습니다.')
        }
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
          get().startAutoCombat(get().tower.autoSpeed) // 현재 속도로 재시작
        } else {
          get().stopAutoCombat()
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
          
          // 기존 데이터에 상성 스탯이 없으면 기본값으로 설정
          const playerData = {
            ...data.player,
            baseElementalStats: data.player.baseElementalStats || initialPlayerState.baseElementalStats,
            elementalStats: data.player.elementalStats || initialPlayerState.elementalStats
          }
          
          // 저장된 데이터로 상태 복원
          set((state: any) => ({
            ...state,
            player: playerData,
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
            get().startAutoCombat(data.tower.autoSpeed)
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
        set((state: any) => {
          const newItems = [...state.inventory.items]
          
          // 장비류는 고유하게 관리 (중복 수량 없음)
          const isEquipment = itemId.includes('sword') || 
                            itemId.includes('armor') || 
                            itemId.includes('staff') ||
                            itemId.includes('weapon') ||
                            itemId.includes('chest') ||
                            itemId.includes('accessory')
          
          if (isEquipment) {
            // 장비는 각각 고유 ID로 개별 관리
            for (let i = 0; i < quantity; i++) {
              newItems.push({
                itemId,
                uniqueId: `${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                level: 1,
                quantity: 1,
                quality: 'Common',
                enhancement: 0
              })
            }
          } else {
            // 소모품은 기존 방식대로 수량 관리
            const existingIndex = newItems.findIndex(item => item.itemId === itemId && !item.uniqueId)
            if (existingIndex >= 0) {
              newItems[existingIndex].quantity += quantity
            } else {
              newItems.push({ itemId, quantity, level: 1 })
            }
          }
          
          return {
            ...state,
            inventory: {
              ...state.inventory,
              items: newItems
            }
          }
        })
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

      removeMaterial: (materialId: string, count: number) => {
        set((state: any) => {
          const materials = [...state.inventory.materials]
          const existingIndex = materials.findIndex(m => m.materialId === materialId)
          
          if (existingIndex >= 0) {
            const currentCount = materials[existingIndex].count
            if (currentCount >= count) {
              materials[existingIndex].count -= count
              // 수량이 0이 되면 제거
              if (materials[existingIndex].count <= 0) {
                materials.splice(existingIndex, 1)
              }
            } else {
              console.warn(`재료 ${materialId}가 부족합니다. (${currentCount}/${count})`)
            }
          } else {
            console.warn(`재료 ${materialId}를 찾을 수 없습니다.`)
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

          // skills.pagesOwned도 동시에 업데이트
          const pagesOwned = { ...state.skills.pagesOwned }
          pagesOwned[skillId] = (pagesOwned[skillId] || 0) + 1
          
          return {
            ...state,
            inventory: {
              ...state.inventory,
              skillPages
            },
            skills: {
              ...state.skills,
              pagesOwned
            }
          }
        })
      },

      // 스킬 해금
      unlockSkill: (skillId: string) => {
        const { skills } = get()
        const pageCount = skills.pagesOwned[skillId] || 0
        
        // 페이지 부족 체크
        if (pageCount < 3) {
          get().addCombatLog('skill', `❌ ${skillId} 해금에 필요한 페이지가 부족합니다. (${pageCount}/3)`)
          return
        }

        // 이미 보유 체크
        const alreadyOwned = skills.activeSkills.some(s => s.skillId === skillId) ||
                           skills.passiveSkills.some(s => s.skillId === skillId)
        
        if (alreadyOwned) {
          get().addCombatLog('skill', `❌ ${skillId}은(는) 이미 보유한 스킬입니다.`)
          return
        }

        // 새 스킬 생성 (Lv 1) - 발동률 상승 레벨은 각 스킬별로 다름
        const newSkill = {
          skillId,
          level: 1,
          triggerChance: skillId === 'basic_attack' ? 100 : 10, // 기본 공격은 100%, 나머지는 10%
          currentXp: 0,
          maxXp: 100 // 기본 필요 경험치
        }

        // 스킬 타입 분류 (임시)
        const isActive = skillId.includes('ball') || skillId.includes('shard') || skillId.includes('toss')

        set((state: any) => ({
          ...state,
          skills: {
            ...state.skills,
            activeSkills: isActive ? [...state.skills.activeSkills, newSkill] : state.skills.activeSkills,
            passiveSkills: !isActive ? [...state.skills.passiveSkills, newSkill] : state.skills.passiveSkills,
            pagesOwned: {
              ...state.skills.pagesOwned,
              [skillId]: pageCount - 3
            }
          }
        }))
        
        get().addCombatLog('skill', `🎉 ${skillId} 스킬을 해금했습니다! (Lv 1)`)
      },

      // 스킬 레벨업
      levelUpSkill: (skillId: string) => {
        const { skills, player } = get()
        
        // 스킬 찾기
        let targetSkill = skills.activeSkills.find(s => s.skillId === skillId)
        let isActive = true
        
        if (!targetSkill) {
          targetSkill = skills.passiveSkills.find(s => s.skillId === skillId)
          isActive = false
        }

        if (!targetSkill) {
          get().addCombatLog('skill', `❌ ${skillId} 스킬을 찾을 수 없습니다.`)
          return
        }

        // 무제한 레벨업 가능하므로 최대 레벨 체크 제거

        // 경험치 체크
        if ((targetSkill.currentXp || 0) < (targetSkill.maxXp || 0)) {
          get().addCombatLog('skill', `❌ 경험치가 부족합니다.`)
          return
        }

        // 비용 계산
        const apCost = 1
        const goldCost = Math.floor(100 * Math.pow(1.5, targetSkill.level - 1))

        // 비용 체크
        if (player.rebirthLevel < apCost) {
          get().addCombatLog('skill', `❌ AP가 부족합니다.`)
          return
        }
        
        if (player.gold < goldCost) {
          get().addCombatLog('skill', `❌ 골드가 부족합니다.`)
          return
        }

        // 레벨업 실행 - 스킬별 발동률 상승 레벨 적용
        const newLevel = targetSkill.level + 1
        
        // 스킬 데이터에서 발동률 계산 (동기적으로 처리)
        const skillTriggerMap: Record<string, number[]> = {
          'basic_attack': [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100],
          'fireball': [1, 3, 7, 12, 18, 25, 35, 45, 60, 80, 100],
          'ice_shard': [1, 4, 8, 15, 22, 30, 40, 55, 70, 90],
          'flame_aura': [1, 6, 12, 20, 30, 45, 60, 80, 100],
          'frost_bite': [1, 5, 12, 20, 30, 45, 65, 85],
          'ember_toss': [1, 2, 5, 10, 16, 24, 35, 50, 70, 95]
        }
        
        const skillTriggerLevels = skillTriggerMap[skillId] || [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100]
        
        // 새 레벨이 발동률 증가 레벨인지 확인 (기본 공격은 항상 100% 유지)
        let newTriggerChance = targetSkill.triggerChance
        if (skillId !== 'basic_attack' && skillTriggerLevels.includes(newLevel)) {
          newTriggerChance = Math.min(95, targetSkill.triggerChance + 5)
        }
        
        const newSkill = {
          ...targetSkill,
          level: newLevel,
          triggerChance: newTriggerChance,
          currentXp: 0,
          maxXp: Math.floor(100 * Math.pow(1.8, newLevel - 1))
        }
        
        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            rebirthLevel: state.player.rebirthLevel - apCost,
            gold: state.player.gold - goldCost
          },
          skills: {
            ...state.skills,
            activeSkills: isActive 
              ? state.skills.activeSkills.map((s: any) => s.skillId === skillId ? newSkill : s)
              : state.skills.activeSkills,
            passiveSkills: !isActive
              ? state.skills.passiveSkills.map((s: any) => s.skillId === skillId ? newSkill : s)
              : state.skills.passiveSkills
          }
        }))

        get().addCombatLog('skill', `⬆️ ${skillId} 스킬이 Lv ${newLevel}로 상승했습니다!`)
        get().addCombatLog('skill', `💰 AP ${apCost}, 골드 ${goldCost} 소모`)
      },

      // 스킬 수련치 추가
      addSkillTrainingXp: (skillId: string, event: 'cast' | 'killWeak' | 'perfect' | 'kill', customXp?: number) => {
        const { skills } = get()
        
        // 수련치 양 결정
        const xpAmounts = {
          cast: 1,
          killWeak: 20,
          perfect: 15,
          kill: 5
        }
        const xpGain = customXp || xpAmounts[event] || 0
        
        if (xpGain <= 0) return

        // 스킬 찾기 및 수련치 추가
        const updatedActiveSkills = skills.activeSkills.map(skill => 
          skill.skillId === skillId 
            ? { ...skill, currentXp: Math.min((skill.currentXp || 0) + xpGain, skill.maxXp || 0) }
            : skill
        )
        
        const updatedPassiveSkills = skills.passiveSkills.map(skill => 
          skill.skillId === skillId 
            ? { ...skill, currentXp: Math.min((skill.currentXp || 0) + xpGain, skill.maxXp || 0) }
            : skill
        )

        // 실제로 수련치가 추가되었는지 확인
        const skillFound = skills.activeSkills.some(s => s.skillId === skillId) ||
                          skills.passiveSkills.some(s => s.skillId === skillId)

        if (skillFound) {
          set((state: any) => ({
            ...state,
            skills: {
              ...state.skills,
              activeSkills: updatedActiveSkills,
              passiveSkills: updatedPassiveSkills
            }
          }))

          // 수련치 획득 로그
          const eventNames = {
            cast: '사용',
            killWeak: '상성 처치',
            perfect: 'Perfect',
            kill: '처치'
          }
          
          get().addCombatLog('skill', `📈 ${skillId} (${eventNames[event]}) +${xpGain} XP`)
        }
      },

      // 장비 착용
      equipItem: (itemIdOrUniqueId: string) => {
        const { player, inventory } = get()
        
        // 인벤토리에서 아이템 찾기 (uniqueId 또는 itemId로 검색)
        const item = inventory.items.find(item => 
          item.uniqueId === itemIdOrUniqueId || item.itemId === itemIdOrUniqueId
        )
        if (!item) {
          get().addCombatLog('loot', `❌ ${itemIdOrUniqueId} 아이템을 찾을 수 없습니다.`)
          return
        }

        const result = equipItem(player, item)
        
        if (result.success) {
          set((state: any) => ({
            ...state,
            player: result.newPlayer
          }))
          get().addCombatLog('loot', `✅ ${result.message}`)
        } else {
          get().addCombatLog('loot', `❌ ${result.message}`)
        }
      },

      // 장비 해제
      unequipItem: (slot: 'weapon' | 'armor' | 'accessory') => {
        const { player } = get()
        
        const result = unequipItem(player, slot)
        
        if (result.success) {
          set((state: any) => ({
            ...state,
            player: result.newPlayer
          }))
          get().addCombatLog('loot', `✅ ${result.message}`)
        } else {
          get().addCombatLog('loot', `❌ ${result.message}`)
        }
      },

      // 장비 강화
      enhanceEquipment: (slot: 'weapon' | 'armor' | 'accessory') => {
        const { player } = get()
        
        const equipment = player.equipment[slot]
        if (!equipment) {
          get().addCombatLog('loot', `❌ 착용한 ${slot === 'weapon' ? '무기' : slot === 'armor' ? '방어구' : '악세서리'}가 없습니다.`)
          return
        }

        const result = enhanceEquipment(equipment, player.gold)
        
        if (result.success) {
          const newPlayer = { ...player }
          newPlayer.equipment[slot] = result.newEquipment
          newPlayer.gold -= result.goldCost
          
          // 스탯 재계산
          const updatedPlayer = recalculatePlayerStats(newPlayer)
          
          set((state: any) => ({
            ...state,
            player: updatedPlayer
          }))
          get().addCombatLog('loot', `✅ ${result.message}`)
         } else {
           if (result.goldCost > 0) {
             // 실패했지만 골드는 소모됨
             set((state: any) => ({
               ...state,
               player: {
                 ...state.player,
                 gold: state.player.gold - result.goldCost
               }
             }))
           }
           get().addCombatLog('loot', `❌ ${result.message}`)
        }
      },

      // 생활 스킬 시스템
      addLifeSkillXp: (skillType: any, xp: number) => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        const skill = life.skills[skillType]
        if (!skill) {
          console.warn(`Skill type ${skillType} not found.`)
          return
        }

        const newXp = (skill.currentXp || 0) + xp
        let newLevel = skill.level
        let newMaxXp = skill.maxXp
        let remainingXp = newXp

        // 레벨업 체크
        while (remainingXp >= newMaxXp) {
          remainingXp -= newMaxXp
          newLevel += 1
          newMaxXp = Math.floor(100 * Math.pow(1.5, newLevel - 1))
        }

        // 스토어 상태 업데이트
        set((state: any) => ({
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
        }))

        if (newLevel > skill.level) {
          get().addCombatLog('skill', `⬆️ ${skillType} 스킬이 Lv ${newLevel}로 상승했습니다!`)
        } else {
          get().addCombatLog('skill', `📈 ${skillType} +${xp} XP (Lv ${newLevel})`)
        }
      },

      levelUpLifeSkill: (skillType: any) => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        const skill = life.skills[skillType]
        if (!skill) {
          console.warn(`Skill type ${skillType} not found.`)
          return
        }

        // 레벨업 비용 (임시)
        const apCost = 1
        const goldCost = Math.floor(100 * Math.pow(1.5, skill.level - 1))

        if (skill.level >= 10) { // 최대 레벨 제한
          get().addCombatLog('skill', `❌ ${skillType} 스킬은 최대 레벨에 도달했습니다.`)
          return
        }

        if (skill.currentXp < skill.maxXp) {
          get().addCombatLog('skill', `❌ 경험치가 부족합니다.`)
          return
        }

        if (skill.cooldown > 0) {
          get().addCombatLog('skill', `❌ 스킬이 쿨다운 중입니다.`)
          return
        }

        if (skill.gold < goldCost) {
          get().addCombatLog('skill', `❌ 골드가 부족합니다.`)
          return
        }

        if (skill.rebirthLevel < apCost) {
          get().addCombatLog('skill', `❌ AP가 부족합니다.`)
          return
        }

        skill.currentXp = 0
        skill.level = skill.level + 1
        skill.gold -= goldCost
        skill.rebirthLevel -= apCost

        get().addCombatLog('skill', `⬆️ ${skillType} 스킬이 Lv ${skill.level}로 상승했습니다!`)
        get().addCombatLog('skill', `💰 AP ${apCost}, 골드 ${goldCost} 소모`)
      },

      startCooldown: (skillType: any, duration: number) => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        const skill = life.skills[skillType]
        if (!skill) {
          console.warn(`Skill type ${skillType} not found.`)
          return
        }

        skill.cooldown = duration
        get().addCombatLog('skill', `${skillType} 스킬이 ${duration}초 동안 쿨다운 상태가 되었습니다.`)
      },

      startMinigame: (skillType: any, gameType: 'slot' | 'rhythm' | 'matching' | 'timing') => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        const skill = life.skills[skillType]
        if (!skill) {
          console.warn(`Skill type ${skillType} not found.`)
          return
        }

        if (skill.cooldown > 0) {
          get().addCombatLog('skill', `${skillType} 스킬이 쿨다운 중이므로 미니게임을 시작할 수 없습니다.`)
          return
        }

        // 미니게임 로직 구현 (예: 슬롯머신, 리듬게임 등)
        // 여기서는 간단히 쿨다운 설정
        skill.cooldown = 10 // 예시: 10초 쿨다운
        get().addCombatLog('skill', `${skillType} 스킬을 미니게임으로 사용했습니다. (쿨다운 ${skill.cooldown}초)`)
      },

      endMinigame: (result: any) => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        // 미니게임 결과에 따른 경험치 및 골드 획득 로직
        // 예: 슬롯머신 결과에 따라 경험치 추가
        if (result.type === 'slot') {
          get().addLifeSkillXp(result.skillType, result.xpGain || 10) // 슬롯머신 결과에 따라 경험치 추가
        }

        // 미니게임 종료 후 쿨다운 해제
        const skill = life.skills.find(s => s.skillType === result.skillType)
        if (skill) {
          skill.cooldown = 0
        }
      },

      startCrafting: (recipeId: string) => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        const skill = life.skills.find(s => s.skillType === 'crafting')
        if (!skill) {
          console.warn('Crafting skill not found.')
          return
        }

        if (skill.cooldown > 0) {
          get().addCombatLog('skill', 'Crafting 스킬이 쿨다운 중이므로 제작을 시작할 수 없습니다.')
          return
        }

        // 제작 로직 구현 (예: 재료 소모, 경험치 획득, 골드 소모 등)
        // 여기서는 간단히 쿨다운 설정
        skill.cooldown = 10 // 예시: 10초 쿨다운
        get().addCombatLog('skill', 'Crafting 스킬을 사용하여 제작을 시작했습니다. (쿨다운 ${skill.cooldown}초)')
      },

      completeCrafting: () => {
        const { life } = get()
        if (!life) {
          console.error('Life skill state not initialized.')
          return
        }

        const skill = life.skills.find(s => s.skillType === 'crafting')
        if (!skill) {
          console.warn('Crafting skill not found.')
          return
        }

        // 제작 완료 시 경험치 및 골드 획득 로직
        get().addLifeSkillXp('crafting', 50) // 예시: 제작 완료 시 경험치 추가
        get().addCombatLog('loot', 'Crafting 제작을 완료했습니다!')

        // 제작 완료 후 쿨다운 해제
        skill.cooldown = 0
      },

      // 환생 가능 여부 확인
      canRebirth: () => {
        const { tower } = get()
        const canRebirth = tower.currentFloor > 100
        const apGain = canRebirth ? (tower.currentFloor - 100) * 2 + Math.floor((tower.currentFloor - 100) / 50) * 10 : 0
        
        return {
          canRebirth,
          currentFloor: tower.currentFloor,
          apGain
        }
      },

      // 환생 실행
      executeRebirth: (benefits) => {
        const { player, tower, inventory, skills } = get()
        
        console.log('🔄 환생 실행!')
        console.log('AP 획득:', benefits.ap)
        console.log('스킬 레벨 보너스:', benefits.skillLevelBonus)
        console.log('재료 보너스:', benefits.materialBonus)
        
        // 상태 초기화 및 보상 적용 (층수만 초기화)
        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            hp: state.player.maxHp,
            mp: state.player.maxMp,
            rebirthLevel: state.player.rebirthLevel + benefits.ap
          },
          tower: {
            ...state.tower,
            currentFloor: 1,
            currentMonster: null,
            combatLog: []
          }
        }))
        
        get().addCombatLog('floor', `🌟 환생 완료! +${benefits.ap} AP 획득`)
        get().addCombatLog('skill', `🔥 스킬 레벨 +${benefits.skillLevelBonus} 보너스 (다음 게임부터 적용)`)
        
        // 환생시 젬 지급
        const gemReward = Math.floor((tower.currentFloor - 100) / 10)
        if (gemReward > 0) {
          set((state: any) => ({
            ...state,
            player: {
              ...state.player,
                             gem: (state.player.gem || 0) + gemReward
            }
          }))
          get().addCombatLog('loot', `💎 젬 +${gemReward}개 획득`)
        }
      },

      // 상점 아이템 구매
      purchaseItem: (item) => {
        const { player } = get()
        
        // 비용 확인
        const canAfford = item.currency === 'gold' 
          ? player.gold >= item.price 
                     : (player.gem || 0) >= item.price

        if (!canAfford) {
          get().addCombatLog('loot', `❌ ${item.currency === 'gold' ? '골드' : '젬'}가 부족합니다`)
          return
        }

        // 요구사항 확인
                 if (item.requirements?.level && player.rebirthLevel < (item.requirements.level * 10)) {
          get().addCombatLog('loot', `❌ 레벨 ${item.requirements.level} 이상 필요`)
          return
        }
        if (item.requirements?.rebirthLevel && player.rebirthLevel < item.requirements.rebirthLevel) {
          get().addCombatLog('loot', `❌ 환생 레벨 ${item.requirements.rebirthLevel} 이상 필요`)
          return
        }

        // 비용 차감
        set((state: any) => ({
          ...state,
          player: {
            ...state.player,
            gold: item.currency === 'gold' ? state.player.gold - item.price : state.player.gold,
                         gem: item.currency === 'gem' ? (state.player.gem || 0) - item.price : (state.player.gem || 0)
          }
        }))

        // 아이템별 특별 처리
        if (item.itemData.itemId === 'skill_page_random') {
          // 랜덤 스킬 페이지 지급
          const skills = ['fireball', 'ice_shard', 'flame_aura', 'frost_bite', 'ember_toss']
          for (let i = 0; i < item.itemData.quantity; i++) {
            const randomSkill = skills[Math.floor(Math.random() * skills.length)]
            get().addSkillPage(randomSkill)
          }
          get().addCombatLog('loot', `✅ ${item.name} 구매! 랜덤 스킬 페이지 ${item.itemData.quantity}개 획득`)
        } else if (item.itemData.itemId === 'premium_material_pack') {
          // 프리미엄 재료 팩
          get().addMaterial('iron_ore', 20)
          get().addMaterial('wood', 30)
          get().addMaterial('red_herb', 15)
          get().addCombatLog('loot', `✅ ${item.name} 구매! 고급 재료 대량 획득`)
        } else if (item.itemData.itemId === 'rebirth_stone') {
          // 환생석 - 즉시 AP 지급
          set((state: any) => ({
            ...state,
            player: {
              ...state.player,
              rebirthLevel: state.player.rebirthLevel + 10
            }
          }))
          get().addCombatLog('loot', `✅ ${item.name} 구매! +10 AP 획득`)
        } else {
          // 일반 아이템
          if (item.category === 'consumable') {
            // 소모품은 consumables에 추가
            get().addItem(item.itemData.itemId, item.itemData.quantity)
          } else if (item.category === 'material') {
            // 재료는 materials에 추가
            get().addMaterial(item.itemData.itemId, item.itemData.quantity)
          } else {
            // 장비는 items에 추가
            get().addItem(item.itemData.itemId, item.itemData.quantity)
          }
          get().addCombatLog('loot', `✅ ${item.name} 구매 완료!`)
        }
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