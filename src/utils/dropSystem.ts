import { Monster, InventoryState } from '../types'
import { loadDropTable, loadItems } from './dataLoader'

// 몬스터 처치 시 아이템 드롭 처리
export async function processItemDrops(
  monster: Monster, 
  inventory: InventoryState
): Promise<{ items: string[], materials: string[], gold: number }> {
  const results = { items: [], materials: [], gold: 0 }
  
  if (!monster.dropTableId) return results
  
  try {
    const dropTable = await loadDropTable(monster.dropTableId)
    if (!dropTable || !dropTable.drops) return results
    
    for (const drop of dropTable.drops) {
      // 확률 체크
      if (Math.random() * 100 > drop.chance) continue
      
      // 수량 결정
      const quantity = Math.floor(
        Math.random() * (drop.maxQuantity - drop.minQuantity + 1) + drop.minQuantity
      )
      
      // 타입별 처리
      switch (drop.type) {
        case 'material':
          for (let i = 0; i < quantity; i++) {
            results.materials.push(drop.itemId)
          }
          break
          
        case 'consumable':
          for (let i = 0; i < quantity; i++) {
            results.items.push(drop.itemId)
          }
          break
          
        case 'equipment':
          for (let i = 0; i < quantity; i++) {
            results.items.push(drop.itemId)
          }
          break
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
  
  if (!monster.skillPageDrops) return drops
  
  for (const skillPageId of monster.skillPageDrops) {
    // 기본 20% 확률로 스킬 페이지 드롭
    if (Math.random() < 0.2) {
      drops.push(skillPageId)
    }
  }
  
  return drops
} 