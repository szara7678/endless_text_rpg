import React from 'react'
import { X } from 'lucide-react'

interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
}

const qualityColors = {
  Common: 'text-gray-300 border-gray-500',
  Uncommon: 'text-green-300 border-green-500',
  Rare: 'text-blue-300 border-blue-500',
  Epic: 'text-purple-300 border-purple-500',
  Legendary: 'text-yellow-300 border-yellow-500'
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null

  const qualityColor = qualityColors[item.quality as keyof typeof qualityColors] || qualityColors.Common

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className={`text-lg font-bold ${qualityColor}`}>{item.name}</h2>
            <div className="text-sm text-gray-400">{item.type} • {item.quality}</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-4">
          {/* 설명 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">설명</h3>
            <p className="text-gray-400 text-sm">{item.description}</p>
          </div>

          {/* 기본 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">기본 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">레벨: <span className="text-white">{item.level}</span></div>
              <div className="text-gray-400">요구 레벨: <span className="text-white">{item.requiredLevel || 1}</span></div>
              {item.sellPrice && (
                <div className="text-gray-400">판매가: <span className="text-yellow-400">{item.sellPrice}G</span></div>
              )}
              {item.maxEnhancement && (
                <div className="text-gray-400">최대 강화: <span className="text-white">+{item.maxEnhancement}</span></div>
              )}
            </div>
          </div>

          {/* 스탯 */}
          {item.stats && Object.values(item.stats).some((v: any) => v > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">스탯</h3>
              <div className="space-y-1">
                {item.stats.physicalAttack > 0 && (
                  <div className="text-sm text-red-400">물리 공격력: +{item.stats.physicalAttack}</div>
                )}
                {item.stats.magicalAttack > 0 && (
                  <div className="text-sm text-blue-400">마법 공격력: +{item.stats.magicalAttack}</div>
                )}
                {item.stats.physicalDefense > 0 && (
                  <div className="text-sm text-green-400">물리 방어력: +{item.stats.physicalDefense}</div>
                )}
                {item.stats.magicalDefense > 0 && (
                  <div className="text-sm text-cyan-400">마법 방어력: +{item.stats.magicalDefense}</div>
                )}
                {item.stats.speed > 0 && (
                  <div className="text-sm text-yellow-400">속도: +{item.stats.speed}</div>
                )}
              </div>
            </div>
          )}

          {/* 효과 */}
          {item.effects && item.effects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">효과</h3>
              <div className="space-y-1">
                {item.effects.map((effect: any, index: number) => (
                  <div key={index} className="text-sm text-purple-400">
                    • {effect.type === 'heal_hp' ? `HP ${effect.value} 회복` : 
                       effect.type === 'heal_mp' ? `MP ${effect.value} 회복` :
                       effect.type === 'damage' ? `${effect.value}% 데미지` :
                       effect.type}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 재료 */}
          {item.materials && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">제작 재료</h3>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(item.materials).map(([material, count]: [string, any]) => (
                  <div key={material} className="text-sm text-gray-400">
                    {material}: {count}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추가 정보 */}
          {item.type === 'consumable' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">소모품 정보</h3>
              <div className="space-y-1 text-sm">
                {item.stackable && (
                  <div className="text-gray-400">최대 중첩: <span className="text-white">{item.maxStack}</span></div>
                )}
                {item.cooldown > 0 && (
                  <div className="text-gray-400">재사용 대기시간: <span className="text-white">{item.cooldown}초</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailModal 