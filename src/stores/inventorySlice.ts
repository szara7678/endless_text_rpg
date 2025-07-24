import { StateCreator } from 'zustand'
import { InventoryState, MaterialInstance, ItemInstance, SkillPageInstance } from '../types'

// InventorySlice 인터페이스
export interface InventorySlice {
  inventory: InventoryState
  
  // 재료 관리
  addMaterial: (material: MaterialInstance) => void
  removeMaterial: (materialId: string, level: number, quantity: number) => boolean
  getMaterialCount: (materialId: string, level: number) => number
  
  // 아이템 관리  
  addItem: (item: ItemInstance) => void
  removeItem: (itemId: string, quantity: number) => boolean
  
  // 소모품 관리
  addConsumable: (itemId: string, quantity: number) => void
  useConsumable: (itemId: string, quantity: number) => boolean
}

// 초기 인벤토리 상태 (비어있음 - 게임 시작시 loadInitialInventory로 로드)
const initialInventoryState: InventoryState = {
  materials: [],
  items: [],
  consumables: [],
  skillPages: [],
  maxSlots: 100,
  usedSlots: 0
}

export const inventorySlice: StateCreator<InventorySlice> = (set, get) => ({
  inventory: initialInventoryState,
  
  // 재료 추가
  addMaterial: (material: MaterialInstance) => {
    set((state) => {
      const newMaterials = [...state.inventory.materials]
      const existingIndex = newMaterials.findIndex(
        (m: MaterialInstance) => m.materialId === material.materialId && m.level === material.level
      )
      
      if (existingIndex >= 0) {
        newMaterials[existingIndex] = {
          ...newMaterials[existingIndex],
          count: newMaterials[existingIndex].count + material.count
        }
      } else {
        newMaterials.push(material)
      }
      
      return {
        inventory: {
          ...state.inventory,
          materials: newMaterials,
          usedSlots: state.inventory.usedSlots + (existingIndex >= 0 ? 0 : 1)
        }
      }
    })
  },
    
  // 재료 제거
  removeMaterial: (materialId: string, level: number, quantity: number) => {
    const { inventory } = get()
    const existingIndex = inventory.materials.findIndex(
      (m: MaterialInstance) => m.materialId === materialId && m.level === level
    )
    
    if (existingIndex >= 0 && inventory.materials[existingIndex].count >= quantity) {
      set((state) => {
        const newMaterials = [...state.inventory.materials]
        newMaterials[existingIndex] = {
          ...newMaterials[existingIndex],
          count: newMaterials[existingIndex].count - quantity
        }
        
        if (newMaterials[existingIndex].count === 0) {
          newMaterials.splice(existingIndex, 1)
        }
        
        return {
          inventory: {
            ...state.inventory,
            materials: newMaterials,
            usedSlots: state.inventory.usedSlots - (newMaterials[existingIndex]?.count === 0 ? 1 : 0)
          }
        }
      })
      return true
    }
    return false
  },
  
  // 재료 수량 확인
  getMaterialCount: (materialId: string, level: number) => {
    const { inventory } = get()
    const material = inventory.materials.find(
      (m: MaterialInstance) => m.materialId === materialId && m.level === level
    )
    return material ? material.count : 0
  },
  
  // 아이템 추가 (기본 구현)
  addItem: (item: ItemInstance) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        items: [...state.inventory.items, item]
      }
    }))
  },
  
  // 아이템 제거 (기본 구현)
  removeItem: (itemId: string, quantity: number) => {
    // TODO: 구현
    return true
  },
  
  // 소모품 추가
  addConsumable: (itemId: string, quantity: number) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        consumables: {
          ...state.inventory.consumables,
          [itemId]: (state.inventory.consumables[itemId] || 0) + quantity
        }
      }
    }))
  },
    
  // 소모품 사용
  useConsumable: (itemId: string, quantity: number) => {
    const { inventory } = get()
    const currentQuantity = inventory.consumables[itemId] || 0
    
    if (currentQuantity >= quantity) {
      set((state) => ({
        inventory: {
          ...state.inventory,
          consumables: {
            ...state.inventory.consumables,
            [itemId]: currentQuantity - quantity
          }
        }
      }))
      return true
    }
    return false
  }
}) 