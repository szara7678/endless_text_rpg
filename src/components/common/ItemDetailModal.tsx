import React, { useState, useEffect } from 'react'
import { X, Sword, Shield, Star, Zap } from 'lucide-react'
import { useGameStore } from '../../stores'
import { calculateEnhancementCost, getBaseEquipmentStats } from '../../utils/equipmentSystem'
import { calculateItemSellPrice } from '../../utils/itemSystem'
import { loadItem } from '../../utils/dataLoader'

interface ItemDetailModalProps {
  isOpen: boolean
  item: any
  onClose: () => void
}

// 강화 모달 컴포넌트
const EnhancementModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  equipment: any
  equipmentType: 'weapon' | 'armor'
}> = ({ isOpen, onClose, equipment, equipmentType }) => {
  const { player, enhanceEquipment, enhanceInventoryEquipment, addCombatLog } = useGameStore()
  
  // 실시간으로 최신 장비 정보 가져오기
  const getCurrentEquipment = () => {
    // 장착된 장비인지 확인
    const currentPlayer = useGameStore.getState().player
    const isEquipped = currentPlayer.equipment[equipmentType]?.uniqueId === equipment.uniqueId || 
                      currentPlayer.equipment[equipmentType]?.itemId === equipment.itemId
    
    if (isEquipped) {
      // 장착된 장비의 최신 정보 가져오기
      return currentPlayer.equipment[equipmentType] || equipment
    } else {
      // 인벤토리에서 최신 정보 가져오기
      const { inventory } = useGameStore.getState()
      const inventoryItem = inventory.items.find(item => 
        item.uniqueId === equipment.uniqueId || 
        (item.itemId === equipment.itemId && !equipment.uniqueId)
      )
      return inventoryItem || equipment
    }
  }
  
  const currentEquipment = getCurrentEquipment()
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementCount, setEnhancementCount] = useState(0)

  if (!isOpen || !equipment) return null

  // equipmentSystem의 calculateEnhancementCost 사용
  const getEnhancementCost = (currentLevel: number) => {
    return calculateEnhancementCost({
      ...currentEquipment,
      enhancement: currentLevel
    })
  }

  const getEnhancementRate = (currentLevel: number) => {
    return Math.max(50, 80 - currentLevel * 5)
  }

  const handleEnhance = async () => {
    if (isEnhancing || currentEquipment.enhancement >= 10) return

    const cost = getEnhancementCost(currentEquipment.enhancement || 0)
    if (player.gold < cost) {
      addCombatLog('loot', '❌ 강화에 필요한 골드가 부족합니다.')
      return
    }

    setIsEnhancing(true)
    setEnhancementCount(prev => prev + 1)

    // 장착 여부에 따라 다른 강화 함수 호출
    if (currentEquipment.uniqueId) {
      enhanceInventoryEquipment(currentEquipment.itemId, currentEquipment.uniqueId)
    } else {
      enhanceEquipment(equipmentType)
    }

    // 잠시 후 다음 강화 가능
    setTimeout(() => {
      setIsEnhancing(false)
    }, 500)
  }

  const handleContinuousEnhance = async () => {
    if (isEnhancing || currentEquipment.enhancement >= 10) return

    const cost = getEnhancementCost(currentEquipment.enhancement || 0)
    if (player.gold < cost) {
      addCombatLog('loot', '❌ 강화에 필요한 골드가 부족합니다.')
      return
    }

    setIsEnhancing(true)
    setEnhancementCount(prev => prev + 1)

    // 장착 여부에 따라 다른 강화 함수 호출
    if (currentEquipment.uniqueId) {
      enhanceInventoryEquipment(currentEquipment.itemId, currentEquipment.uniqueId)
    } else {
      enhanceEquipment(equipmentType)
    }

    // 잠시 후 다음 강화 가능
    setTimeout(() => {
      setIsEnhancing(false)
    }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">⚡ 장비 강화</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 장비 정보 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">
              {equipmentType === 'weapon' ? <Sword className="text-red-400" /> : <Shield className="text-blue-400" />}
            </div>
            <div>
              <h4 className="font-semibold text-white">{currentEquipment.name || currentEquipment.itemId}</h4>
              <p className="text-sm text-gray-400">품질: {currentEquipment.quality || 'Common'}</p>
            </div>
          </div>
        </div>

        {/* 강화 정보 */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">현재 강화 레벨</span>
            <span className="text-yellow-400">+{currentEquipment.enhancement || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">다음 강화 비용</span>
            <span className="text-yellow-400">{getEnhancementCost(currentEquipment.enhancement || 0)} 골드</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">성공률</span>
            <span className="text-green-400">{getEnhancementRate(currentEquipment.enhancement || 0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">보유 골드</span>
            <span className="text-yellow-400">{player.gold} 골드</span>
          </div>
        </div>

        {/* 강화 횟수 */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            이번 세션 강화 횟수: <span className="text-yellow-400">{enhancementCount}</span>
          </p>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-2">
          <button
            onClick={handleEnhance}
            disabled={isEnhancing || currentEquipment.enhancement >= 10 || player.gold < getEnhancementCost(currentEquipment.enhancement || 0)}
            className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Zap size={16} />
            {isEnhancing ? '강화 중...' : '강화'}
          </button>
          <button
            onClick={handleContinuousEnhance}
            disabled={isEnhancing || currentEquipment.enhancement >= 10 || player.gold < getEnhancementCost(currentEquipment.enhancement || 0)}
            className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            연속 강화
          </button>
        </div>

        {currentEquipment.enhancement >= 10 && (
          <div className="text-center text-yellow-400 text-sm mt-3">
            ⭐ 최대 강화 달성!
          </div>
        )}
      </div>
    </div>
  )
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ isOpen, item, onClose }) => {
  const { player, equipItem, unequipItem, enhanceEquipment, inventory, addCombatLog } = useGameStore()
  const [showEnhancementModal, setShowEnhancementModal] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [itemData, setItemData] = useState<any>(null)

  // 아이템 데이터 로드
  useEffect(() => {
    if (item && item.itemId) {
      loadItem(item.itemId).then(data => {
        setItemData(data)
      }).catch(error => {
        console.warn('아이템 데이터 로드 실패:', error)
        setItemData(null)
      })
    } else if (item && item.materialId) {
      loadItem(item.materialId).then(data => {
        setItemData(data)
      }).catch(error => {
        console.warn('재료 데이터 로드 실패:', error)
        setItemData(null)
      })
    } else {
      setItemData(null)
    }
  }, [item])

  if (!isOpen || !item) return null

  // 현재 착용 중인지 확인
  const isEquipped = () => {
    // itemType을 먼저 결정
    const equipmentType = item.type || (item.itemId?.includes('sword') || item.itemId?.includes('staff') ? 'weapon' : 
                                       item.itemId?.includes('armor') ? 'armor' : null)
    
    if (equipmentType === 'weapon') {
      // uniqueId가 있으면 uniqueId로 정확히 비교, 없으면 itemId로 비교
      if (item.uniqueId) {
        return player.equipment.weapon?.uniqueId === item.uniqueId
      } else {
        return player.equipment.weapon?.itemId === item.itemId
      }
    }
    if (equipmentType === 'armor') {
      // uniqueId가 있으면 uniqueId로 정확히 비교, 없으면 itemId로 비교
      if (item.uniqueId) {
        return player.equipment.armor?.uniqueId === item.uniqueId
      } else {
        return player.equipment.armor?.itemId === item.itemId
      }
    }
    if (equipmentType === 'accessory') {
      // uniqueId가 있으면 uniqueId로 정확히 비교, 없으면 itemId로 비교
      if (item.uniqueId) {
        return player.equipment.accessory?.uniqueId === item.uniqueId
      } else {
        return player.equipment.accessory?.itemId === item.itemId
      }
    }
    return false
  }

  // 장착/해제 처리
  const handleEquipToggle = () => {
    console.log('handleEquipToggle 호출됨:', { item, itemType, isEquipped: isEquipped() })
    
    if (isEquipped()) {
      // 해제 - itemType을 사용하여 정확한 슬롯 결정
      console.log('장비 해제 시도:', itemType)
      if (itemType === 'weapon') {
        unequipItem('weapon')
      } else if (itemType === 'armor') {
        unequipItem('armor')
      } else if (itemType === 'accessory') {
        unequipItem('accessory')
      }
    } else {
      // 장착 - uniqueId가 있는 경우 해당 아이템을 찾아서 장착
      console.log('장비 장착 시도:', item.uniqueId || item.itemId)
      if (item.uniqueId) {
        // uniqueId로 정확한 아이템을 찾아서 장착
        equipItem(item.uniqueId)
      } else {
        // 기존 방식
        equipItem(item.itemId)
      }
    }
    onClose() // 장착/해제 시 항상 모달 닫기
  }

  // 강화 모달 열기
  const handleEnhance = () => {
    setShowEnhancementModal(true)
  }

  // 판매 모달 열기
  const handleSell = () => {
    setSellQuantity(1)
    setShowSellModal(true)
  }

  // 강화 비용 계산
  const getEnhancementCost = (currentLevel: number) => {
    return Math.floor(100 * Math.pow(1.5, currentLevel))
  }

  // 강화 성공률 계산
  const getEnhancementRate = (currentLevel: number) => {
    return Math.max(30, 90 - currentLevel * 5)
  }

  // 장비 타입인지 확인
  const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' || 
                     item.itemId?.includes('sword') || item.itemId?.includes('staff') || 
                     item.itemId?.includes('armor') || item.itemId?.includes('ring') || 
                     item.itemId?.includes('necklace') || item.itemId?.includes('amulet')

  // 판매 가능한 아이템인지 확인
  const canSell = () => {
    // 장착된 아이템만 판매 불가
    return !isEquipped()
  }

  // 아이템 수량 확인
  const getItemQuantity = () => {
    console.log('getItemQuantity 호출:', {
      itemId: item.itemId,
      materialId: item.materialId,
      type: item.type,
      uniqueId: item.uniqueId
    })
    
    // 장비 (inventory.items에서 찾기)
    if (item.uniqueId) {
      const inventoryItem = inventory.items.find(invItem => invItem.uniqueId === item.uniqueId)
      if (inventoryItem) {
        console.log('inventory.items에서 찾음 (uniqueId):', inventoryItem)
        return inventoryItem.quantity || 1
      }
    }
    
    // 재료 (inventory.materials에서 찾기)
    if (item.materialId) {
      const materialItem = inventory.materials.find(mat => mat.materialId === item.materialId)
      if (materialItem) {
        console.log('inventory.materials에서 찾음:', materialItem)
        return materialItem.count || 1
      }
    }
    
    // 소모품 (inventory.consumables에서 찾기)
    if (item.itemId && !item.uniqueId) {
      const consumableItem = inventory.consumables.find(con => con.itemId === item.itemId)
      if (consumableItem) {
        console.log('inventory.consumables에서 찾음:', consumableItem)
        return consumableItem.quantity || 1
      }
    }
    
    // 일반 아이템 (inventory.items에서 찾기)
    if (item.itemId) {
      const inventoryItem = inventory.items.find(invItem => invItem.itemId === item.itemId)
      if (inventoryItem) {
        console.log('inventory.items에서 찾음 (itemId):', inventoryItem)
        return inventoryItem.quantity || 1
      }
    }
    
    console.log('아이템을 찾을 수 없음')
    return 1
  }

  // 아이템 판매 처리
  const handleSellItem = () => {
    if (!item) return
    const sellPrice = calculateItemSellPrice(item) * sellQuantity
    
    console.log('판매할 아이템 정보:', {
      itemId: item.itemId,
      materialId: item.materialId,
      uniqueId: item.uniqueId,
      type: item.type,
      sellQuantity
    })
    
    // 장비 수량 감소 (inventory.items)
    const updatedItems = inventory.items.map(invItem => {
      let shouldUpdate = false
      
      if (item.uniqueId && invItem.uniqueId === item.uniqueId) shouldUpdate = true
      else if (item.itemId && invItem.itemId === item.itemId && !item.uniqueId) shouldUpdate = true
      
      if (shouldUpdate) {
        const currentCount = invItem.quantity || 1
        const newCount = currentCount - sellQuantity
        console.log('inventory.items 업데이트:', { currentCount, newCount, itemId: invItem.itemId })
        return newCount > 0 ? { ...invItem, quantity: newCount } : null
      }
      return invItem
    }).filter(Boolean)
    
    // 재료 수량 감소 (inventory.materials)
    const updatedMaterials = inventory.materials.map(mat => {
      if (item.materialId && mat.materialId === item.materialId) {
        const currentCount = mat.count
        const newCount = currentCount - sellQuantity
        console.log('inventory.materials 업데이트:', { currentCount, newCount, materialId: mat.materialId })
        return newCount > 0 ? { ...mat, count: newCount } : null
      }
      return mat
    }).filter(Boolean)
    
    // 소모품 수량 감소 (inventory.consumables)
    const updatedConsumables = inventory.consumables.map(con => {
      if (item.itemId && con.itemId === item.itemId) {
        const currentCount = con.quantity || 1
        const newCount = currentCount - sellQuantity
        console.log('inventory.consumables 업데이트:', { currentCount, newCount, itemId: con.itemId })
        return newCount > 0 ? { ...con, quantity: newCount } : null
      }
      return con
    }).filter(Boolean)
    
    // 골드 추가
    const newGold = player.gold + sellPrice
    
    console.log('최종 업데이트:', {
      items: updatedItems.length,
      materials: updatedMaterials.length,
      consumables: updatedConsumables.length,
      newGold
    })
    
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
    
    // 한글 이름 가져오기
    const itemName = itemData?.name || item.name || (item.itemId || item.materialId)?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    addCombatLog('loot', `💰 ${itemName} ${sellQuantity}개 판매! +${sellPrice} 골드`)
    setShowSellModal(false)
    onClose()
  }
  const itemType = item.type || (item.itemId?.includes('sword') || item.itemId?.includes('staff') ? 'weapon' : 
                                 item.itemId?.includes('armor') ? 'armor' : 
                                 item.itemId?.includes('ring') || item.itemId?.includes('necklace') || item.itemId?.includes('amulet') ? 'accessory' : null)
  const currentEquipment = isEquipped() ? (itemType === 'weapon' ? player.equipment.weapon : 
                                           itemType === 'armor' ? player.equipment.armor : 
                                           itemType === 'accessory' ? player.equipment.accessory : null) : item

  // 강화 모달에 전달할 장비 정보 (실시간 업데이트를 위해 함수로 전달)
  const getEquipmentForEnhancement = () => {
    if (isEquipped()) {
      return itemType === 'weapon' ? player.equipment.weapon : 
             itemType === 'armor' ? player.equipment.armor : 
             itemType === 'accessory' ? player.equipment.accessory : null
    } else {
      return item
    }
  }

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
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {item.type === 'weapon' && <Sword className="text-red-400" />}
              {item.type === 'armor' && <Shield className="text-blue-400" />}
              {item.type === 'consumable' && <span>🧪</span>}
              {item.type === 'material' && <span>📦</span>}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {itemData?.name || item.name || (item.itemId || item.materialId)?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <div className="text-sm text-gray-400">
                {itemData?.type || item.type || (item.itemId?.includes('sword') || item.itemId?.includes('staff') ? 'weapon' : 
                               item.itemId?.includes('armor') ? 'armor' : 'equipment')} • {item.quality || itemData?.rarity || 'Common'}
                {item.level && ` • Lv${item.level}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 아이템 정보 */}
        <div className="p-4 space-y-4">
          {/* 설명 */}
          <div>
            <p className="text-gray-300">
              {itemData?.description || item.description || `${(item.itemId || item.materialId)?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}입니다.`}
            </p>
          </div>

          {/* 기본 스탯 */}
          {isEquipment && (
            <div>
              <h4 className="text-white font-medium mb-2">기본 능력치</h4>
              <div className="space-y-1 text-sm">
                {(() => {
                  const baseStats = getBaseEquipmentStats(item.itemId)
                  return (
                    <>
                      {baseStats.physicalAttack && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">물리 공격력</span>
                          <span className="text-red-400">+{baseStats.physicalAttack}</span>
                        </div>
                      )}
                      {baseStats.magicalAttack && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마법 공격력</span>
                          <span className="text-blue-400">+{baseStats.magicalAttack}</span>
                        </div>
                      )}
                      {baseStats.physicalDefense && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">물리 방어력</span>
                          <span className="text-green-400">+{baseStats.physicalDefense}</span>
                        </div>
                      )}
                      {baseStats.magicalDefense && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마법 방어력</span>
                          <span className="text-purple-400">+{baseStats.magicalDefense}</span>
                        </div>
                      )}
                      {baseStats.hp && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">HP</span>
                          <span className="text-red-300">+{baseStats.hp}</span>
                        </div>
                      )}
                      {baseStats.mp && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">MP</span>
                          <span className="text-blue-300">+{baseStats.mp}</span>
                        </div>
                      )}
                      {baseStats.speed && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">속도</span>
                          <span className="text-yellow-400">+{baseStats.speed}</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* 실제 스탯 (강화 포함) */}
          {isEquipment && item.enhancement > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">실제 능력치 (강화 +{item.enhancement})</h4>
              <div className="space-y-1 text-sm">
                {(() => {
                  const baseStats = getBaseEquipmentStats(item.itemId)
                  const level = item.level || 1
                  const enhancement = item.enhancement || 0
                  const quality = item.quality || 'Common'
                  
                  // 품질 배수 계산
                  const qualityMultiplier = {
                    'Common': 1,
                    'Fine': 1.2,
                    'Superior': 1.5,
                    'Epic': 2,
                    'Legendary': 3
                  }[quality] || 1
                  
                  // 레벨 보너스 (5% per level)
                  const levelBonus = 1 + (level - 1) * 0.05
                  
                  // 강화 보너스 (8% per enhancement)
                  const enhancementBonus = 1 + enhancement * 0.08
                  
                  // 최종 배수
                  const totalMultiplier = qualityMultiplier * levelBonus * enhancementBonus
                  
                  return (
                    <>
                      {baseStats.physicalAttack && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">물리 공격력</span>
                          <span className="text-red-400">+{Math.floor(baseStats.physicalAttack * totalMultiplier)}</span>
                        </div>
                      )}
                      {baseStats.magicalAttack && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마법 공격력</span>
                          <span className="text-blue-400">+{Math.floor(baseStats.magicalAttack * totalMultiplier)}</span>
                        </div>
                      )}
                      {baseStats.physicalDefense && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">물리 방어력</span>
                          <span className="text-green-400">+{Math.floor(baseStats.physicalDefense * totalMultiplier)}</span>
                        </div>
                      )}
                      {baseStats.magicalDefense && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마법 방어력</span>
                          <span className="text-purple-400">+{Math.floor(baseStats.magicalDefense * totalMultiplier)}</span>
                        </div>
                      )}
                      {baseStats.hp && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">HP</span>
                          <span className="text-red-300">+{Math.floor(baseStats.hp * totalMultiplier)}</span>
                        </div>
                      )}
                      {baseStats.mp && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">MP</span>
                          <span className="text-blue-300">+{Math.floor(baseStats.mp * totalMultiplier)}</span>
                        </div>
                      )}
                      {baseStats.speed && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">속도</span>
                          <span className="text-yellow-400">+{Math.floor(baseStats.speed * totalMultiplier)}</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}



          {/* 가격 정보 */}
          <div>
            <h4 className="text-white font-medium mb-2">가격 정보</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">판매 가격</span>
              <span className="text-yellow-400">{calculateItemSellPrice(item)} 골드</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            {/* 장비인 경우 장착/해제 버튼 */}
            {isEquipment && (
              <button
                onClick={handleEquipToggle}
                className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                  isEquipped()
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isEquipped() ? '해제' : '장착'}
              </button>
            )}
            
            {/* 강화 버튼: 장비인 경우만 */}
            {isEquipment && (
              <button
                onClick={handleEnhance}
                className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Zap size={16} />
                강화
              </button>
            )}

            {/* 판매 버튼: 판매 가능한 아이템인 경우만 */}
            {canSell() && (
              <button
                onClick={handleSell}
                className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors"
              >
                💰 판매
              </button>
            )}
          </div>
          
          {/* 최대 강화 안내 */}
          {isEquipment && currentEquipment && currentEquipment.enhancement >= 10 && (
            <div className="text-center text-yellow-400 text-sm mt-2">
              ⭐ 최대 강화 달성!
            </div>
          )}
        </div>

        {/* 강화 모달 */}
        <EnhancementModal
          isOpen={showEnhancementModal}
          onClose={() => setShowEnhancementModal(false)}
          equipment={item}
          equipmentType={itemType as 'weapon' | 'armor'}
        />

        {/* 판매 모달 */}
        {showSellModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSellModal(false)}
          >
            <div 
              className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">💰 아이템 판매</h3>
                <button
                  onClick={() => setShowSellModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3 text-white">
                    {itemData?.name || item.name || (item.itemId || item.materialId)?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">레벨:</span>
                      <span className="text-white">Lv {item.level || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">품질:</span>
                      <span className="text-white">{item.quality || 'Common'}</span>
                    </div>
                    {item.enhancement && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">강화:</span>
                        <span className="text-white">+{item.enhancement}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-300">보유 수량:</span>
                      <span className="text-white">{getItemQuantity()}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">판매 가격:</span>
                      <span className="text-yellow-400 font-bold">
                        {calculateItemSellPrice(item)} 골드
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-300 mb-2">판매 수량:</label>
                    <input
                      type="number"
                      min="1"
                      max={getItemQuantity()}
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(Math.max(1, Math.min(getItemQuantity(), parseInt(e.target.value) || 1)))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSellItem}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    💰 {calculateItemSellPrice(item) * sellQuantity} 골드에 판매
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemDetailModal 