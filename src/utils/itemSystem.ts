 
// 아이템 판매 가격 계산
export function calculateItemSellPrice(item: any): number {
  // item이 없거나 itemId가 없는 경우 기본값 반환
  if (!item || !item.itemId) {
    return 5
  }
  
  let basePrice = 0
  
  // 아이템 타입별 기본 가격
  if (item.itemId.includes('sword') || item.itemId.includes('staff')) {
    basePrice = 50 // 무기
  } else if (item.itemId.includes('armor')) {
    basePrice = 40 // 방어구
  } else if (item.itemId.includes('ring')) {
    basePrice = 30 // 액세서리
  } else if (item.itemId.includes('potion')) {
    basePrice = 10 // 소모품
  } else {
    basePrice = 5 // 기타 아이템
  }
  
  // 레벨에 따른 가격 증가
  const levelMultiplier = 1 + (item.level - 1) * 0.5
  
  // 품질에 따른 가격 증가
  const qualityMultiplier = {
    'Common': 1,
    'Uncommon': 1.5,
    'Rare': 2.5,
    'Epic': 4,
    'Legendary': 6
  }[item.quality] || 1
  
  // 강화도에 따른 가격 증가 (장비만)
  let enhancementMultiplier = 1
  if (item.enhancement && item.itemId && (item.itemId.includes('sword') || item.itemId.includes('staff') || item.itemId.includes('armor') || item.itemId.includes('ring'))) {
    enhancementMultiplier = 1 + item.enhancement * 0.3
  }
  
  return Math.floor(basePrice * levelMultiplier * qualityMultiplier * enhancementMultiplier)
}

// 아이템 이름 가져오기 (한글 이름 우선)
export async function getItemName(itemId: string): Promise<string> {
  try {
    // 동적으로 아이템 파일 로드 시도
    try {
      const itemData = (await import(`../data/items/${itemId}.json`)).default
      return itemData.name || itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    } catch (importError) {
      // 개별 파일이 없으면 materials 폴더에서 시도
      try {
        const materialData = (await import(`../data/materials/${itemId}.json`)).default
        return materialData.name || itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      } catch (materialError) {
        // materials에도 없으면 기본 이름 반환
        return itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    }
  } catch (error) {
    console.warn(`아이템 이름 로드 실패: ${itemId}`, error)
    return itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
} 