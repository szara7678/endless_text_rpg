import React, { useState } from 'react'
import { X, Sword, Shield, Star, Zap } from 'lucide-react'
import { useGameStore } from '../../stores'
import { calculateEnhancementCost, getBaseEquipmentStats } from '../../utils/equipmentSystem'

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
  const { player, enhanceEquipment, addCombatLog } = useGameStore()
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementCount, setEnhancementCount] = useState(0)

  if (!isOpen || !equipment) return null

  // equipmentSystem의 calculateEnhancementCost 사용
  const getEnhancementCost = (currentLevel: number) => {
    return calculateEnhancementCost({
      ...equipment,
      enhancement: currentLevel
    })
  }

  const getEnhancementRate = (currentLevel: number) => {
    return Math.max(50, 80 - currentLevel * 5)
  }

  const handleEnhance = async () => {
    if (isEnhancing || equipment.enhancement >= 10) return

    const cost = getEnhancementCost(equipment.enhancement || 0)
    if (player.gold < cost) {
      addCombatLog('loot', '❌ 강화에 필요한 골드가 부족합니다.')
      return
    }

    setIsEnhancing(true)
    setEnhancementCount(prev => prev + 1)

    // 강화 실행
    enhanceEquipment(equipmentType)

    // 잠시 후 다음 강화 가능
    setTimeout(() => {
      setIsEnhancing(false)
    }, 500)
  }

  const handleContinuousEnhance = async () => {
    if (isEnhancing || equipment.enhancement >= 10) return

    const cost = getEnhancementCost(equipment.enhancement || 0)
    if (player.gold < cost) {
      addCombatLog('loot', '❌ 강화에 필요한 골드가 부족합니다.')
      return
    }

    setIsEnhancing(true)
    setEnhancementCount(prev => prev + 1)

    // 연속 강화 실행
    enhanceEquipment(equipmentType)

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
              <h4 className="font-semibold text-white">{equipment.name || equipment.itemId}</h4>
              <p className="text-sm text-gray-400">품질: {equipment.quality || 'Common'}</p>
            </div>
          </div>
        </div>

        {/* 강화 정보 */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">현재 강화 레벨</span>
            <span className="text-yellow-400">+{equipment.enhancement || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">다음 강화 비용</span>
            <span className="text-yellow-400">{getEnhancementCost(equipment.enhancement || 0)} 골드</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">성공률</span>
            <span className="text-green-400">{getEnhancementRate(equipment.enhancement || 0)}%</span>
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
            disabled={isEnhancing || equipment.enhancement >= 10 || player.gold < getEnhancementCost(equipment.enhancement || 0)}
            className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Zap size={16} />
            {isEnhancing ? '강화 중...' : '강화'}
          </button>
          <button
            onClick={handleContinuousEnhance}
            disabled={isEnhancing || equipment.enhancement >= 10 || player.gold < getEnhancementCost(equipment.enhancement || 0)}
            className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            연속 강화
          </button>
        </div>

        {equipment.enhancement >= 10 && (
          <div className="text-center text-yellow-400 text-sm mt-3">
            ⭐ 최대 강화 달성!
          </div>
        )}
      </div>
    </div>
  )
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ isOpen, item, onClose }) => {
  const { player, equipItem, unequipItem, enhanceEquipment } = useGameStore()
  const [showEnhancementModal, setShowEnhancementModal] = useState(false)

  if (!isOpen || !item) return null

  // 현재 착용 중인지 확인
  const isEquipped = () => {
    if (item.type === 'weapon') {
      // uniqueId가 있으면 uniqueId로 정확히 비교, 없으면 itemId로 비교
      if (item.uniqueId) {
        return player.equipment.weapon?.uniqueId === item.uniqueId
      } else {
        return player.equipment.weapon?.itemId === item.itemId
      }
    }
    if (item.type === 'armor') {
      // uniqueId가 있으면 uniqueId로 정확히 비교, 없으면 itemId로 비교
      if (item.uniqueId) {
        return player.equipment.armor?.uniqueId === item.uniqueId
      } else {
        return player.equipment.armor?.itemId === item.itemId
      }
    }
    return false
  }

  // 장착/해제 처리
  const handleEquipToggle = () => {
    if (isEquipped()) {
      // 해제
      if (item.type === 'weapon') {
        unequipItem('weapon')
      } else if (item.type === 'armor') {
        unequipItem('armor')
      }
    } else {
      // 장착 - uniqueId가 있는 경우 해당 아이템을 찾아서 장착
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

  // 강화 비용 계산
  const getEnhancementCost = (currentLevel: number) => {
    return Math.floor(100 * Math.pow(1.5, currentLevel))
  }

  // 강화 성공률 계산
  const getEnhancementRate = (currentLevel: number) => {
    return Math.max(30, 90 - currentLevel * 5)
  }

  // 장비 타입인지 확인
  const isEquipment = item.type === 'weapon' || item.type === 'armor'
  const currentEquipment = isEquipped() ? (item.type === 'weapon' ? player.equipment.weapon : player.equipment.armor) : null

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
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <div className="text-sm text-gray-400">{item.type} • {item.quality}</div>
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
            <p className="text-gray-300">{item.description}</p>
          </div>

          {/* 기본 스탯 */}
          {isEquipment && (
            <div>
              <h4 className="text-white font-medium mb-2">기본 능력치</h4>
              <div className="space-y-1 text-sm">
                {(() => {
                  // 장착된 인스턴스가 있으면 강화 수치 포함, 아니면 기본값
                  const actualStats = currentEquipment
                    ? getBaseEquipmentStats(currentEquipment.itemId) // Assuming getBaseEquipmentStats can take an item object
                    : getBaseEquipmentStats(item.itemId)
                  return (
                    <>
                      {actualStats.physicalAttack && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">물리 공격력</span>
                          <span className="text-red-400">+{actualStats.physicalAttack}</span>
                        </div>
                      )}
                      {actualStats.magicalAttack && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마법 공격력</span>
                          <span className="text-blue-400">+{actualStats.magicalAttack}</span>
                        </div>
                      )}
                      {actualStats.physicalDefense && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">물리 방어력</span>
                          <span className="text-green-400">+{actualStats.physicalDefense}</span>
                        </div>
                      )}
                      {actualStats.magicalDefense && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">마법 방어력</span>
                          <span className="text-purple-400">+{actualStats.magicalDefense}</span>
                        </div>
                      )}
                      {actualStats.hp && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">HP</span>
                          <span className="text-red-300">+{actualStats.hp}</span>
                        </div>
                      )}
                      {actualStats.mp && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">MP</span>
                          <span className="text-blue-300">+{actualStats.mp}</span>
                        </div>
                      )}
                      {actualStats.speed && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">속도</span>
                          <span className="text-yellow-400">+{actualStats.speed}</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}



          {/* 가격 정보 */}
          {item.sellPrice && (
            <div>
              <h4 className="text-white font-medium mb-2">가격 정보</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">판매 가격</span>
                <span className="text-yellow-400">{item.sellPrice} 골드</span>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼들 (장비인 경우만) */}
        {isEquipment && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
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
              
              {/* 강화 버튼: 장착 여부와 관계없이 노출 */}
              {item.enhanceable && (
                <button
                  onClick={handleEnhance}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Zap size={16} />
                  강화
                </button>
              )}
            </div>
            
            {/* 최대 강화 안내 */}
            {currentEquipment && currentEquipment.enhancement >= 10 && (
              <div className="text-center text-yellow-400 text-sm mt-2">
                ⭐ 최대 강화 달성!
              </div>
            )}
          </div>
        )}

        {/* 강화 모달 */}
        <EnhancementModal
          isOpen={showEnhancementModal}
          onClose={() => setShowEnhancementModal(false)}
          equipment={currentEquipment}
          equipmentType={item.type as 'weapon' | 'armor'}
        />
      </div>
    </div>
  )
}

export default ItemDetailModal 