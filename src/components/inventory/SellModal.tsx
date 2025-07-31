import React, { useState, useEffect } from 'react'
import { X, Trash2, Filter } from 'lucide-react'
import { useGameStore } from '../../stores'
import { calculateItemSellPrice } from '../../utils/itemSystem'
import { loadItem } from '../../utils/dataLoader'

interface SellModalProps {
  isOpen: boolean
  onClose: () => void
  item?: any
  isBulkSell?: boolean
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, item, isBulkSell = false }) => {
  const { inventory, player, addCombatLog } = useGameStore()
  const [sellQuantity, setSellQuantity] = useState(1)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [filterLevel, setFilterLevel] = useState<number>(0)
  const [filterQuality, setFilterQuality] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<any>(item || null)
  const [excludedItems, setExcludedItems] = useState<Set<string>>(new Set())
  const [itemNames, setItemNames] = useState<{[key: string]: string}>({})

  // 아이템 이름 로드
  const loadItemName = async (itemId: string) => {
    if (itemNames[itemId]) return itemNames[itemId]
    
    try {
      const itemData = await loadItem(itemId)
      const name = itemData?.name || itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      setItemNames(prev => ({ ...prev, [itemId]: name }))
      return name
    } catch (error) {
      const name = itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      setItemNames(prev => ({ ...prev, [itemId]: name }))
      return name
    }
  }

  if (!isOpen) return null

  // 아이템을 고유하게 식별하는 함수
  const getItemKey = (item: any) => {
    if (item.uniqueId) return item.uniqueId
    if (item.materialId) return `material_${item.materialId}`
    if ((item as any).consumableId) return `consumable_${(item as any).consumableId}`
    return `item_${item.itemId}`
  }

  // 아이템 제외/포함 토글
  const toggleItemExclusion = (item: any) => {
    const itemKey = getItemKey(item)
    setExcludedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
    })
  }

  // 아이템이 제외되었는지 확인
  const isItemExcluded = (item: any) => {
    const itemKey = getItemKey(item)
    return excludedItems.has(itemKey)
  }

  const handleSellItem = () => {
    if (!selectedItem) return

    const sellPrice = calculateItemSellPrice(selectedItem) * sellQuantity
    
    // 인벤토리에서 아이템 제거
    const updatedItems = inventory.items.filter(invItem => 
      !(invItem.uniqueId === selectedItem.uniqueId && invItem.itemId === selectedItem.itemId)
    )
    
    // 골드 추가
    const newGold = player.gold + sellPrice
    
    // 상태 업데이트
    useGameStore.setState((state: any) => ({
      ...state,
      player: {
        ...state.player,
        gold: newGold
      },
      inventory: {
        ...state.inventory,
        items: updatedItems,
        usedSlots: updatedItems.length
      }
    }))

    // 한글 이름 가져오기
    loadItemName(selectedItem.itemId).then(itemName => {
      addCombatLog('loot', `💰 ${itemName} ${sellQuantity}개 판매! +${sellPrice} 골드`)
    })
    setSelectedItem(null)
    setSellQuantity(1)
    onClose()
  }

  const handleBulkSell = () => {
    if (filteredItems.length === 0) return

    let totalPrice = 0
    const itemsToRemove: any[] = []

    filteredItems.forEach(item => {
      const price = calculateItemSellPrice(item)
      totalPrice += price
      itemsToRemove.push(item)
    })

    // 디버깅: 제거할 아이템 정보 출력
    console.log('제거할 아이템들:', itemsToRemove.map(item => ({
      itemId: item.itemId,
      materialId: item.materialId,
      consumableId: item.consumableId,
      type: item.type
    })))

    // 인벤토리에서 아이템들 제거 (장비)
    const updatedItems = inventory.items.filter(invItem => 
      !itemsToRemove.some(removeItem => 
        removeItem.uniqueId === invItem.uniqueId && removeItem.itemId === removeItem.itemId
      )
    )

    // 재료에서 아이템들 제거
    const updatedMaterials = inventory.materials.filter(mat => 
      !itemsToRemove.some(removeItem => 
        (removeItem.materialId && removeItem.materialId === mat.materialId) ||
        (removeItem.itemId && removeItem.itemId === mat.materialId)
      )
    )

    // 소모품에서 아이템들 제거
    const updatedConsumables = inventory.consumables.filter(con => 
      !itemsToRemove.some(removeItem => 
        ((removeItem as any).consumableId && (removeItem as any).consumableId === (con as any).consumableId) ||
        (removeItem.itemId && removeItem.itemId === con.itemId)
      )
    )

    // 골드 추가
    const newGold = player.gold + totalPrice

    // 상태 업데이트
    useGameStore.setState((state: any) => ({
      ...state,
      player: {
        ...state.player,
        gold: newGold
      },
      inventory: {
        ...state.inventory,
        items: updatedItems,
        materials: updatedMaterials,
        consumables: updatedConsumables,
        usedSlots: updatedItems.length
      }
    }))

    addCombatLog('loot', `💰 ${filteredItems.length}개 아이템 일괄 판매! +${totalPrice} 골드`)
    onClose()
  }

  const getFilteredItems = () => {
    // 모든 아이템 타입을 포함하는 배열 생성
    let allItems: any[] = []

    // 장비 아이템 추가
    const equipmentItems = inventory.items
      .filter(item => {
        // 소모품 관련 키워드 제외
        const consumableKeywords = ['potion', 'food', 'bread', 'stew', 'drink', 'soup', 'feast']
        return !consumableKeywords.some(keyword => item.itemId.includes(keyword))
      })
      .map(item => ({
        ...item,
        type: 'equipment',
        category: item.itemId.includes('sword') || item.itemId.includes('staff') ? 'weapon' :
                 item.itemId.includes('armor') ? 'armor' : 'accessory'
      }))

    // 재료 아이템 추가
    const materialItems = inventory.materials.map(mat => ({
      ...mat,
      type: 'material',
      level: mat.level || 1,
      itemId: mat.materialId // materialId를 itemId로 매핑
    }))

    // 소모품 아이템 추가
    const potionItems = inventory.items
      .filter(item => item.itemId.includes('potion') || item.itemId.includes('drink'))
      .map(item => ({
        ...item,
        type: 'consumable',
        level: item.level || 1,
        consumableId: item.itemId,
        category: 'potion'
      }))
    
    const foodItems = inventory.items
      .filter(item => item.itemId.includes('food') || item.itemId.includes('bread') || item.itemId.includes('stew') || item.itemId.includes('soup') || item.itemId.includes('feast'))
      .map(item => ({
        ...item,
        type: 'consumable',
        level: item.level || 1,
        consumableId: item.itemId,
        category: 'food'
      }))
    
    const consumableItems = [
      ...inventory.consumables.map(consumable => ({
        ...consumable,
        type: 'consumable',
        level: consumable.level || 1,
        category: consumable.itemId?.includes('food') ? 'food' : 'potion'
      })),
      ...potionItems,
      ...foodItems
    ]

    // 모든 아이템 합치기
    allItems = [...equipmentItems, ...materialItems, ...consumableItems]

    // 디버깅: 전체 아이템 수 확인
    console.log('전체 아이템 수:', allItems.length)
    console.log('장비 수:', equipmentItems.length)
    console.log('재료 수:', materialItems.length)
    console.log('소모품 수:', consumableItems.length)
    console.log('필터 설정:', { filterLevel, filterQuality, filterType })

    let items = allItems

    // 레벨 필터 (최대 레벨로 변경)
    if (filterLevel > 0) {
      items = items.filter(item => item.level <= filterLevel)
      console.log('레벨 필터 후 아이템 수:', items.length)
    }

    // 품질 필터
    if (filterQuality !== 'all') {
      items = items.filter(item => {
        // 품질이 없는 아이템은 제외 (재료, 소모품 등)
        if (!item.quality) return false
        
        // 정확히 일치하는 품질만 필터링
        return item.quality === filterQuality
      })
      console.log('품질 필터 후 아이템 수:', items.length)
    }

    // 타입 필터
    if (filterType !== 'all') {
      items = items.filter(item => {
        if (filterType === 'weapon') {
          return item.itemId.includes('sword') || item.itemId.includes('staff')
        } else if (filterType === 'armor') {
          return item.itemId.includes('armor')
        } else if (filterType === 'accessory') {
          return item.itemId.includes('ring')
        } else if (filterType === 'consumable') {
          return item.itemId.includes('potion') || item.itemId.includes('drink') || item.itemId.includes('food') || item.itemId.includes('bread') || item.itemId.includes('stew') || item.itemId.includes('soup') || item.itemId.includes('feast')
        } else if (filterType === 'material') {
          return (item as any).materialId || item.itemId.includes('ore') || item.itemId.includes('herb') || item.itemId.includes('fish') || item.itemId.includes('essence') || item.itemId.includes('crystal') || item.itemId.includes('gem') || item.itemId.includes('metal') || item.itemId.includes('leather') || item.itemId.includes('wood') || item.itemId.includes('flour') || item.itemId.includes('milk') || item.itemId.includes('vegetable') || item.itemId.includes('wheat') || item.itemId.includes('meat') || item.itemId.includes('sap') || item.itemId.includes('stone') || item.itemId.includes('shard')
        }
        return true
      })
      console.log('타입 필터 후 아이템 수:', items.length)
    }

    // 제외된 아이템 필터링
    items = items.filter(item => !isItemExcluded(item))
    console.log('제외 아이템 필터 후 아이템 수:', items.length)

    console.log('최종 필터된 아이템 수:', items.length)
    return items
  }

  const filteredItems = getFilteredItems()

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">
            {isBulkSell ? '📦 일괄 판매' : '💰 아이템 판매'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!isBulkSell && (
            <>
              {/* 개별 판매 */}
              {!selectedItem ? (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-white">아이템 선택</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {inventory.items.map((item, index) => (
                      <div
                        key={`${item.uniqueId}-${index}`}
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="text-sm text-white">
                            {item.itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-400">
                            Lv {item.level || 1} • {item.quality || 'Common'}
                            {item.enhancement && ` • +${item.enhancement}`}
                          </div>
                        </div>
                        <div className="text-sm text-yellow-400 font-bold">
                          {calculateItemSellPrice(item)} 골드
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-white">
                    {selectedItem.itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">레벨:</span>
                      <span className="text-white">Lv {selectedItem.level || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">품질:</span>
                      <span className="text-white">{selectedItem.quality || 'Common'}</span>
                    </div>
                    {selectedItem.enhancement && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">강화:</span>
                        <span className="text-white">+{selectedItem.enhancement}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-300">판매 가격:</span>
                      <span className="text-yellow-400 font-bold">
                        {calculateItemSellPrice(selectedItem)} 골드
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-300 mb-2">판매 수량:</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedItem.quantity || 1}
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium transition-colors"
                    >
                      뒤로
                    </button>
                    <button
                      onClick={handleSellItem}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                    >
                      💰 {calculateItemSellPrice(selectedItem) * sellQuantity} 골드에 판매
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {isBulkSell && (
            <>
              {/* 일괄 판매 필터 */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-white">필터 설정</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">최대 레벨:</label>
                    <input
                      type="number"
                      min="0"
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">품질:</label>
                    <select
                      value={filterQuality}
                      onChange={(e) => setFilterQuality(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">전체</option>
                      <option value="Common">Common</option>
                      <option value="Fine">Fine</option>
                      <option value="Superior">Superior</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">타입:</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">전체</option>
                      <option value="weapon">무기</option>
                      <option value="armor">방어구</option>
                      <option value="accessory">액세서리</option>
                      <option value="consumable">소모품</option>
                      <option value="material">재료</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 필터된 아이템 목록 */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-white">
                  판매할 아이템 ({filteredItems.length}개)
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredItems.map((item, index) => (
                    <div
                      key={`${item.uniqueId}-${index}`}
                      className="flex items-center justify-between p-2 bg-gray-700 rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          {item.itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-gray-400">
                          Lv {item.level || 1} • {item.quality || 'Common'}
                          {item.enhancement && ` • +${item.enhancement}`}
                          {((item as any).count || (item as any).quantity) && ` • ${(item as any).count || (item as any).quantity}개`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-yellow-400 font-bold">
                          {calculateItemSellPrice(item)} 골드
                        </div>
                        <button
                          onClick={() => toggleItemExclusion(item)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          title="판매 목록에서 제외"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBulkSell}
                disabled={filteredItems.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-medium transition-colors"
              >
                💰 {filteredItems.length}개 아이템 일괄 판매
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellModal 