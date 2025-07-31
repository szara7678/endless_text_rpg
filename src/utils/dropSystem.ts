import { Monster, InventoryState } from '../types'
import { loadDropTable } from './dataLoader'
import { calculateDropLevel } from './towerSystem'

// 몬스터 처치 시 아이템 드롭 처리
export async function processItemDrops(
  monster: Monster, 
  inventory: InventoryState,
  currentFloor: number
): Promise<{ items: Array<{itemId: string, level: number, quality: string, quantity?: number}>, materials: Array<{itemId: string, level: number, count?: number}>, gold: number }> {
  const results = { 
    items: [] as Array<{itemId: string, level: number, quality: string, quantity?: number}>, 
    materials: [] as Array<{itemId: string, level: number, count?: number}>, 
    gold: 0 
  }
  
  if (!monster.dropTable) return results
  
  try {
    const dropTable = await loadDropTable(monster.dropTable)
    if (!dropTable || !dropTable.drops) return results
    
    // 드롭 레벨 계산
    const dropLevel = calculateDropLevel(currentFloor)
    
    for (const drop of dropTable.drops) {
      // 확률 체크 (chance는 0~1 사이 값)
      if (Math.random() > drop.chance) continue
      
      // 수량 결정
      const quantity = Math.floor(
        Math.random() * (drop.max - drop.min + 1) + drop.min
      )
      
      // 아이템 레벨 결정 (드롭 레벨 + 랜덤 변동)
      const itemLevel = Math.max(1, dropLevel + Math.floor(Math.random() * 5) - 2) // ±2 레벨 변동
      
      // 품질 결정 (몬스터 티어에 따라)
      let quality = 'Common'
      if (monster.tier === 'boss') {
        quality = Math.random() < 0.3 ? 'Epic' : Math.random() < 0.6 ? 'Superior' : 'Fine'
      } else if (monster.tier === 'elite') {
        quality = Math.random() < 0.2 ? 'Superior' : Math.random() < 0.6 ? 'Fine' : 'Common'
      } else {
        quality = Math.random() < 0.1 ? 'Fine' : 'Common'
      }
      
      // 타입별 처리
      if (drop.type === 'skillPage') {
        // 스킬 페이지는 레벨 없이 처리
        for (let i = 0; i < quantity; i++) {
          results.items.push({ itemId: drop.itemId, level: 1, quality: 'Common' })
        }
      } else if (drop.itemId.includes('_ore') || drop.itemId.includes('_crystal') || 
                 drop.itemId.includes('_essence') || drop.itemId.includes('_gem') ||
                 drop.itemId.includes('_herb') || drop.itemId.includes('_fish') ||
                 drop.itemId.includes('_wood') || drop.itemId.includes('_leather')) {
        // 재료류 - 중복 제거
        const existingMaterial = results.materials.find(m => m.itemId === drop.itemId && m.level === itemLevel)
        if (existingMaterial) {
          existingMaterial.count = (existingMaterial.count || 1) + quantity
        } else {
          results.materials.push({ itemId: drop.itemId, level: itemLevel, count: quantity })
        }
      } else if (drop.itemId.includes('_potion') || drop.itemId.includes('_food')) {
        // 소모품류 - 중복 제거
        const existingItem = results.items.find(item => item.itemId === drop.itemId && item.level === itemLevel && item.quality === 'Common')
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + quantity
        } else {
          results.items.push({ itemId: drop.itemId, level: itemLevel, quality: 'Common', quantity })
        }
      } else {
        // 장비류 - 중복 제거
        const existingItem = results.items.find(item => item.itemId === drop.itemId && item.level === itemLevel && item.quality === quality)
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + quantity
        } else {
          results.items.push({ itemId: drop.itemId, level: itemLevel, quality: quality, quantity })
        }
      }
    }
    
    return results
    
  } catch (error) {
    console.error('드롭 처리 실패:', error)
    return results
  }
}

// 스킬 페이지 드롭 처리
export function processSkillPageDrops(monster: Monster): string[] {
  const drops: string[] = []
  
  if (!monster.skills) return drops
  
  for (const skillId of monster.skills) {
    // 기본 10% 확률로 스킬 페이지 드롭 (보스는 20%)
    const dropChance = monster.tier === 'boss' ? 0.2 : 0.1
    if (Math.random() < dropChance) {
      drops.push(skillId)
    }
  }
  
  return drops
} 