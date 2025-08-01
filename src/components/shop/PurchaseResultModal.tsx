import React from 'react'
import { X, Package, Star, Zap, Crown, Gift } from 'lucide-react'

interface PurchaseResultModalProps {
  isOpen: boolean
  onClose: () => void
  result: {
    packageName: string
    items: Array<{
      id: string
      name: string
      count: number
      type: 'item' | 'material' | 'skill'
      rarity?: string
      icon?: string
    }>
  }
}

const PurchaseResultModal: React.FC<PurchaseResultModalProps> = ({ 
  isOpen, 
  onClose, 
  result 
}) => {
  if (!isOpen || !result) return null

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

  const getItemIcon = (item: any) => {
    if (item.icon) return item.icon
    if (item.type === 'skill') return '📜'
    if (item.type === 'material') return '📦'
    return '🎁'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Gift className="text-yellow-400" size={20} />
            구매 완료
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 구매 정보 */}
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <Package className="text-blue-400" size={24} />
            <div>
              <h4 className="font-semibold text-white">{result.packageName}</h4>
              <p className="text-sm text-blue-400">구매 완료!</p>
            </div>
          </div>
        </div>

        {/* 획득 아이템 목록 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1">
            <Star className="text-yellow-400" size={14} />
            획득한 아이템 ({result.items.length}개)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {result.items.map((item, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-3 ${getRarityColor(item.rarity || 'Common')}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getItemIcon(item)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-sm text-gray-400">
                      수량: {item.count}개
                      {item.type === 'skill' && ' (스킬 페이지)'}
                      {item.type === 'material' && ' (재료)'}
                      {item.type === 'item' && ' (아이템)'}
                    </div>
                  </div>
                  {item.rarity && (
                    <span className={`text-xs px-2 py-1 rounded ${getRarityColor(item.rarity)} bg-opacity-20`}>
                      {item.rarity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 요약 정보 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400">총 아이템</div>
              <div className="text-white font-bold">{result.items.length}개</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">총 수량</div>
              <div className="text-white font-bold">
                {result.items.reduce((sum, item) => sum + item.count, 0)}개
              </div>
            </div>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            확인
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded text-xs text-gray-300">
          <p>• 모든 아이템이 인벤토리에 추가되었습니다.</p>
          <p>• 인벤토리에서 아이템을 확인할 수 있습니다.</p>
          <p>• 스킬 페이지는 스킬 탭에서 확인하세요.</p>
        </div>
      </div>
    </div>
  )
}

export default PurchaseResultModal 