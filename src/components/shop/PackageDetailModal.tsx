import React from 'react'
import { X, Package, Star, Zap, Crown } from 'lucide-react'
import { useGameStore } from '../../stores'

interface PackageDetailModalProps {
  isOpen: boolean
  onClose: () => void
  packageData: any
  onPurchase?: (packageId: string) => Promise<void>
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  packageData,
  onPurchase
}) => {
  const { player, purchasePackage } = useGameStore()

  if (!isOpen || !packageData) return null

  const canAfford = packageData.currency === 'gold' 
    ? player.gold >= packageData.price 
    : (player.gem || 0) >= packageData.price

  const handlePurchase = async () => {
    if (!canAfford) {
      alert(`${packageData.currency === 'gold' ? '골드' : '젬'}가 부족합니다!`)
      return
    }

    if (onPurchase) {
      await onPurchase(packageData.id)
    } else {
      purchasePackage(packageData.id)
    }
    onClose()
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-600'
      case 'Fine': return 'text-green-400 border-green-600'
      case 'Superior': return 'text-blue-400 border-blue-600'
      case 'Epic': return 'text-purple-400 border-purple-600'
      case 'Legendary': return 'text-yellow-400 border-yellow-600'
      default: return 'text-gray-400 border-gray-600'
    }
  }

  const renderGuaranteedItems = () => {
    if (!packageData.contents?.guaranteed) return null

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1">
          <Zap size={14} />
          보장 아이템
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {packageData.contents.guaranteed.map((item: any, index: number) => (
            <div key={index} className="bg-green-900/30 border border-green-600 rounded p-2">
              <div className="text-xs text-green-400 font-medium">
                {item.itemId || item.materialId || item.skillId}
              </div>
              <div className="text-xs text-gray-400">
                수량: {item.count}개
                {item.level && ` (Lv.${item.level})`}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderRandomItems = () => {
    if (!packageData.contents?.random) return null

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-1">
          <Star size={14} />
          랜덤 아이템 (확률 기반)
        </h4>
        <div className="text-xs text-gray-400 mb-2">
          총 {packageData.contents.randomCount.min}~{packageData.contents.randomCount.max}개 획득
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {packageData.contents.random.map((item: any, index: number) => (
            <div key={index} className="bg-blue-900/30 border border-blue-600 rounded p-2">
              <div className="text-xs text-blue-400 font-medium">
                {item.itemId || item.materialId || item.skillId}
              </div>
              <div className="text-xs text-gray-400">
                {item.count?.min && item.count?.max 
                  ? `수량: ${item.count.min}~${item.count.max}개`
                  : `수량: ${item.count}개`
                }
                {item.level && ` (Lv.${item.level})`}
              </div>
              <div className="text-xs text-yellow-400">
                확률: {item.weight}%
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="text-blue-400" size={20} />
            {packageData.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 패키지 정보 */}
        <div className={`border-2 rounded-lg p-4 mb-4 ${getRarityColor(packageData.rarity)}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{packageData.icon}</div>
            <div>
              <h4 className="font-semibold text-white">{packageData.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${getRarityColor(packageData.rarity)} bg-opacity-20`}>
                  {packageData.rarity}
                </span>
                {packageData.category === 'package' && (
                  <Star className="text-yellow-400" size={12} />
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">{packageData.description}</p>
        </div>

        {/* 구성품 정보 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1">
            <Crown size={14} />
            패키지 구성품
          </h4>
          {renderGuaranteedItems()}
          {renderRandomItems()}
        </div>

        {/* 가격 정보 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {packageData.currency === 'gold' ? (
                <span className="text-yellow-400">💰</span>
              ) : (
                <span className="text-cyan-400">💎</span>
              )}
              <span className="text-white font-bold text-lg">
                {packageData.price.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm">
                {packageData.currency === 'gold' ? '골드' : '젬'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              보유: {packageData.currency === 'gold' 
                ? player.gold.toLocaleString() 
                : (player.gem || 0).toLocaleString()
              }
            </div>
          </div>

          {/* 구매 버튼 */}
          <button
            onClick={handlePurchase}
            disabled={!canAfford}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              canAfford
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!canAfford ? '자금 부족' : '패키지 구매'}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded text-xs text-gray-300">
          <p>• 패키지 구매 시 즉시 아이템이 인벤토리에 추가됩니다.</p>
          <p>• 랜덤 아이템은 확률에 따라 획득됩니다.</p>
          <p>• 인벤토리 공간이 부족할 경우 아이템을 받을 수 없습니다.</p>
        </div>
      </div>
    </div>
  )
}

export default PackageDetailModal 