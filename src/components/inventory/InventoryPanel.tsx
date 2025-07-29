import React, { useState } from 'react'
import { X, Package, Hammer, Pill, ArrowUpDown, Flame, Snowflake, Skull, Moon, Zap, Leaf, Trash2 } from 'lucide-react'
import { useGameStore } from '../../stores'
import ItemDetailModal from '../common/ItemDetailModal'
import SellModal from './SellModal'
import { loadItem } from '../../utils/dataLoader'
import { calculateItemSellPrice } from '../../utils/itemSystem'

interface InventoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

type MainTab = 'materials' | 'equipment' | 'consumables'
type SortOrder = 'level_desc' | 'level_asc'
type ElementFilter = 'all' | 'Flame' | 'Frost' | 'Toxic' | 'Shadow' | 'Thunder' | 'Verdant'

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, onClose }) => {
  const { inventory, equipItem, player } = useGameStore()
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('materials')
  const [activeSubTab, setActiveSubTab] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('level_desc')
  const [elementFilter, setElementFilter] = useState<ElementFilter>('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showBulkSellModal, setShowBulkSellModal] = useState(false)

  if (!isOpen) return null

  // 장비가 현재 장착되어 있는지 확인하는 함수
  const isEquipped = (item: any) => {
    if (item.uniqueId) {
      // 고유 ID가 있는 장비는 uniqueId로 비교
      return (
        player.equipment.weapon?.uniqueId === item.uniqueId ||
        player.equipment.armor?.uniqueId === item.uniqueId ||
        player.equipment.accessory?.uniqueId === item.uniqueId
      )
    } else {
      // 일반 아이템은 itemId로 비교
      return (
        player.equipment.weapon?.itemId === item.itemId ||
        player.equipment.armor?.itemId === item.itemId ||
        player.equipment.accessory?.itemId === item.itemId
      )
    }
  }

  const handleItemClick = async (itemId: string) => {
    try {
      console.log('handleItemClick 호출:', { itemId, activeMainTab })
      
      let inventoryItem = null
      
      // 현재 탭에 따라 적절한 인벤토리에서 아이템 찾기
      if (activeMainTab === 'materials') {
        // 재료는 inventory.materials에서 찾기
        inventoryItem = inventory.materials.find(mat => 
          mat.materialId === itemId
        )
        console.log('재료 검색 결과:', inventoryItem)
      } else if (activeMainTab === 'equipment') {
        // 장비는 inventory.items에서 찾기
        inventoryItem = inventory.items.find(item => 
          item.itemId === itemId || item.uniqueId === itemId
        )
        console.log('장비 검색 결과:', inventoryItem)
      } else if (activeMainTab === 'consumables') {
        // 소모품은 inventory.consumables에서 찾기
        inventoryItem = inventory.consumables.find(con => 
          con.itemId === itemId
        )
        console.log('소모품 검색 결과:', inventoryItem)
      }
      
      if (inventoryItem) {
        // 아이템 상세 모달 열기
        setSelectedItem(inventoryItem)
        setShowItemModal(true)
      } else {
        // 인벤토리에 없는 경우 기본 아이템 데이터 로드
        const itemData = await loadItem(itemId)
        if (itemData) {
          setSelectedItem(itemData)
          setShowItemModal(true)
        }
      }
    } catch (error) {
      console.error('아이템 데이터 로드 실패:', error)
    }
  }

  const handleMainTabChange = (tab: MainTab) => {
    setActiveMainTab(tab)
    setActiveSubTab('all')
    setElementFilter('all')
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'level_desc' ? 'level_asc' : 'level_desc')
  }

  // 속성별 아이콘과 색상
  const getElementInfo = (element: ElementFilter) => {
    const elementMap: Record<ElementFilter, { icon: any, color: string, name: string }> = {
      'all': { icon: Package, color: 'text-gray-400', name: '전체' },
      'Flame': { icon: Flame, color: 'text-red-400', name: '화염' },
      'Frost': { icon: Snowflake, color: 'text-blue-400', name: '빙결' },
      'Toxic': { icon: Skull, color: 'text-green-400', name: '독성' },
      'Shadow': { icon: Moon, color: 'text-gray-400', name: '암흑' },
      'Thunder': { icon: Zap, color: 'text-yellow-400', name: '번개' },
      'Verdant': { icon: Leaf, color: 'text-emerald-400', name: '자연' }
    }
    return elementMap[element]
  }

  // 아이템 분류 및 정렬 함수
  const getFilteredAndSortedItems = () => {
    let items: any[] = []

    if (activeMainTab === 'materials') {
      items = inventory.materials.map(mat => {
        // 재료 속성 판별
        let element = 'neutral'
        if (mat.materialId?.includes('flame') || mat.materialId?.includes('fire')) element = 'Flame'
        else if (mat.materialId?.includes('frost') || mat.materialId?.includes('ice')) element = 'Frost'
        else if (mat.materialId?.includes('toxic') || mat.materialId?.includes('poison')) element = 'Toxic'
        else if (mat.materialId?.includes('shadow') || mat.materialId?.includes('dark')) element = 'Shadow'
        else if (mat.materialId?.includes('thunder') || mat.materialId?.includes('lightning')) element = 'Thunder'
        else if (mat.materialId?.includes('verdant') || mat.materialId?.includes('nature')) element = 'Verdant'
        
        return {
          ...mat,
          type: 'material',
          level: mat.level || 1,
          element: element
        }
      })

      // 재료 하위 탭 필터링
      if (activeSubTab === 'elemental') {
        items = items.filter(item => ['Flame', 'Frost', 'Toxic', 'Shadow', 'Thunder', 'Verdant'].includes(item.element))
        
        // 속성 필터 적용
        if (elementFilter !== 'all') {
          items = items.filter(item => item.element === elementFilter)
        }
      } else if (activeSubTab === 'fish') {
        items = items.filter(item => item.materialId?.includes('fish'))
      } else if (activeSubTab === 'herb') {
        items = items.filter(item => item.materialId?.includes('herb'))
      } else if (activeSubTab === 'ore') {
        items = items.filter(item => item.materialId?.includes('ore'))
      }
    } else if (activeMainTab === 'equipment') {
      // 장비는 items에서 health_potion, mana_potion 제외하고 가져오기
      // 장비는 uniqueId로 개별 관리되므로 각각 별도 아이템으로 표시
      items = inventory.items
        .filter(item => !item.itemId.includes('potion') && !item.itemId.includes('food'))
        .map(item => {
          // 장비 카테고리 판별
          let category = 'accessory'
          if (item.itemId.includes('sword') || item.itemId.includes('staff') || item.itemId.includes('weapon')) {
            category = 'weapon'
          } else if (item.itemId.includes('armor') || item.itemId.includes('chest')) {
            category = 'armor'
          } else if (item.itemId.includes('ring') || item.itemId.includes('necklace') || item.itemId.includes('amulet')) {
            category = 'accessory'
          }
          
          return {
            ...item,
            type: 'equipment',
            category: category,
            displayId: item.uniqueId || `${item.itemId}_${Math.random()}` // 고유 표시용 ID
          }
        })

      // 장비 하위 탭 필터링
      if (activeSubTab === 'weapon') {
        items = items.filter(item => item.category === 'weapon')
      } else if (activeSubTab === 'armor') {
        items = items.filter(item => item.category === 'armor')
      } else if (activeSubTab === 'accessory') {
        items = items.filter(item => item.category === 'accessory')
      }
    } else if (activeMainTab === 'consumables') {
      // 소모품은 potion류와 food류 items 합치기
      const potionItems = inventory.items
        .filter(item => item.itemId.includes('potion'))
        .map(item => ({
          ...item,
          type: 'consumable',
          level: item.level || 1,
          consumableId: item.itemId,
          category: 'potion'
        }))
      
      const foodItems = inventory.items
        .filter(item => item.itemId.includes('food') || item.itemId.includes('bread') || item.itemId.includes('stew'))
        .map(item => ({
          ...item,
          type: 'consumable',
          level: item.level || 1,
          consumableId: item.itemId,
          category: 'food'
        }))
      
      items = [
        ...inventory.consumables.map(consumable => ({
          ...consumable,
          type: 'consumable',
          level: consumable.level || 1,
          category: consumable.itemId?.includes('food') ? 'food' : 'potion'
        })),
        ...potionItems,
        ...foodItems
      ]

      // 소모품 하위 탭 필터링
      if (activeSubTab === 'potion') {
        items = items.filter(item => item.category === 'potion')
      } else if (activeSubTab === 'food') {
        items = items.filter(item => item.category === 'food')
      } else if (activeSubTab === 'scroll') {
        items = items.filter(item => item.category === 'scroll')
      }
    }

    // 정렬 적용
    items.sort((a, b) => {
      if (sortOrder === 'level_desc') {
        return (b.level || 1) - (a.level || 1)
      } else {
        return (a.level || 1) - (b.level || 1)
      }
    })

    return items
  }

  const filteredItems = getFilteredAndSortedItems()

  // 탭 구성
  const getSubTabs = () => {
    if (activeMainTab === 'materials') {
      return [
        { id: 'all', name: '전체' },
        { id: 'elemental', name: '속성' },
        { id: 'fish', name: '물고기' },
        { id: 'herb', name: '약초' },
        { id: 'ore', name: '광석' }
      ]
    } else if (activeMainTab === 'equipment') {
      return [
        { id: 'all', name: '전체' },
        { id: 'weapon', name: '무기' },
        { id: 'armor', name: '방어구' },
        { id: 'accessory', name: '악세사리' }
      ]
    } else if (activeMainTab === 'consumables') {
      return [
        { id: 'all', name: '전체' },
        { id: 'potion', name: '물약' },
        { id: 'food', name: '음식' },
        { id: 'scroll', name: '스크롤' }
      ]
    }
    return []
  }

  return (
    <>
      <div 
        className="fixed inset-x-0 bg-gray-800 border-t border-gray-700 z-20 flex flex-col"
        style={{ top: '64px', bottom: '64px' }}
      >
        {/* 패널 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">🎒 인벤토리</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 메인 탭 */}
        <div className="flex border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <button
            onClick={() => handleMainTabChange('materials')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeMainTab === 'materials' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package size={16} />
              <span>재료</span>
            </div>
          </button>
          <button
            onClick={() => handleMainTabChange('equipment')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeMainTab === 'equipment' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Hammer size={16} />
              <span>장비</span>
            </div>
          </button>
          <button
            onClick={() => handleMainTabChange('consumables')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeMainTab === 'consumables' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Pill size={16} />
              <span>소모품</span>
            </div>
          </button>
        </div>

        {/* 서브 탭 */}
        <div className="flex border-b border-gray-700 bg-gray-700 flex-shrink-0 overflow-x-auto">
          {getSubTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSubTab === tab.id ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* 속성 필터 영역 (재료 > 속성 탭에서만 표시) */}
        {activeMainTab === 'materials' && activeSubTab === 'elemental' && (
          <div className="p-3 bg-gray-700 border-b border-gray-600 flex-shrink-0">
            <div className="flex items-center gap-1">
              {(['all', 'Flame', 'Frost', 'Toxic', 'Shadow', 'Thunder', 'Verdant'] as ElementFilter[]).map((element) => {
                const elementInfo = getElementInfo(element)
                const ElementIcon = elementInfo.icon
                return (
                  <button
                    key={element}
                    onClick={() => setElementFilter(element)}
                    className={`p-1 rounded transition-colors ${
                      elementFilter === element
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={elementInfo.name}
                  >
                    <ElementIcon size={16} className={elementInfo.color} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 정렬 및 판매 컨트롤 영역 */}
        <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-600 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkSellModal(true)}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              <Trash2 size={14} />
              <span>일괄 판매</span>
            </button>
          </div>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'level_desc' ? '레벨 높은순' : '레벨 낮은순'}</span>
          </button>
        </div>

        {/* 아이템 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {activeMainTab === 'materials' ? '보유한 재료가 없습니다' :
               activeMainTab === 'equipment' ? '보유한 장비가 없습니다' :
               '보유한 소모품이 없습니다'}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredItems.map((item, index) => {
                const itemId = item.materialId || item.itemId || item.consumableId
                const equipped = activeMainTab === 'equipment' && isEquipped(item)
                
                return (
                  <div
                    key={item.displayId || item.uniqueId || `${itemId}-${index}`}
                    className={`relative bg-gray-800 rounded-lg p-3 cursor-pointer transition-colors border ${
                      equipped 
                        ? 'border-yellow-400 border-2 bg-yellow-900/20 hover:bg-yellow-800/30' 
                        : 'border-gray-700 hover:bg-gray-700'
                    }`}
                    onClick={() => handleItemClick(itemId)}
                  >
                    {/* 장착 상태 뱃지 */}
                    {equipped && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                        E
                      </div>
                    )}
                    
                  {/* 아이템 정보 */}
                    <div className="space-y-1">
                    {/* 아이템 이름 */}
                      <div className={`text-xs font-medium mb-1 ${equipped ? 'text-yellow-200' : 'text-white'}`}>
                        {itemId?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    
                    {/* 레벨 표시 */}
                    <div className="text-xs text-purple-400 mb-1">
                      Lv {item.level || 1}
                    </div>

                      {/* 품질 표시 (장비인 경우) */}
                      {activeMainTab === 'equipment' && item.quality && (
                        <div className={`text-xs mb-1 ${
                          item.quality === 'Legendary' ? 'text-orange-400' :
                          item.quality === 'Epic' ? 'text-purple-400' :
                          item.quality === 'Superior' ? 'text-blue-400' :
                          item.quality === 'Fine' ? 'text-green-400' :
                          'text-gray-400'
                        }`}>
                          {item.quality}
                          {item.enhancement > 0 && ` +${item.enhancement}`}
                        </div>
                      )}

                      {/* 수량 표시 (장비가 아닌 경우만) */}
                      {activeMainTab !== 'equipment' && (
                    <div className="text-xs text-gray-400">
                      {item.count || item.quantity || 1}개
                    </div>
                      )}

                    {/* 속성 표시 (재료 > 속성 탭에서) */}
                    {activeMainTab === 'materials' && activeSubTab === 'elemental' && item.element && item.element !== 'neutral' && (
                      <div className="mt-1">
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          item.element === 'Flame' ? 'bg-red-900 text-red-400' :
                          item.element === 'Frost' ? 'bg-blue-900 text-blue-400' :
                          item.element === 'Toxic' ? 'bg-green-900 text-green-400' :
                          item.element === 'Shadow' ? 'bg-gray-900 text-gray-400' :
                          item.element === 'Thunder' ? 'bg-yellow-900 text-yellow-400' :
                          item.element === 'Verdant' ? 'bg-emerald-900 text-emerald-400' :
                          'bg-gray-900 text-gray-400'
                        }`}>
                          {getElementInfo(item.element as ElementFilter)?.name || item.element}
                        </span>
                      </div>
                    )}
                  </div>
                  

                </div>
                )
              })}
            </div>
          )}


        </div>
      </div>

      {/* 아이템 상세 모달 */}
      <ItemDetailModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        item={selectedItem}
      />



      {/* 일괄 판매 모달 */}
      <SellModal
        isOpen={showBulkSellModal}
        onClose={() => setShowBulkSellModal(false)}
        isBulkSell={true}
      />
    </>
  )
}

export default InventoryPanel 