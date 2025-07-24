import React, { useState } from 'react'
import { X, ShoppingCart, Package, Zap, FileText, Star } from 'lucide-react'
import { useGameStore } from '../../stores'

interface ShopPanelProps {
  isOpen: boolean
  onClose: () => void
}

const ShopPanel: React.FC<ShopPanelProps> = ({ isOpen, onClose }) => {
  const { player } = useGameStore()
  const [activeTab, setActiveTab] = useState<'consumables' | 'materials' | 'buffs' | 'pages' | 'boosters'>('consumables')

  if (!isOpen) return null

  const getShopItems = () => {
    switch (activeTab) {
      case 'consumables':
        return [
          {
            id: 'health_potion',
            name: '체력 물약',
            description: 'HP를 50 회복합니다',
            price: 25,
            currency: 'gold',
            icon: '🧪'
          },
          {
            id: 'mana_potion', 
            name: '마나 물약',
            description: 'MP를 30 회복합니다',
            price: 20,
            currency: 'gold',
            icon: '💙'
          }
        ]
      case 'materials':
        return [
          {
            id: 'flame_ore_pack',
            name: '화염 광석 팩',
            description: '화염 광석 5개 + 잔불 수정 2개',
            price: 3,
            currency: 'gem',
            icon: '📦'
          },
          {
            id: 'frost_ore_pack',
            name: '서리 광석 팩',
            description: '서리 광석 5개 + 얼음 수정 2개',
            price: 3,
            currency: 'gem',
            icon: '📦'
          }
        ]
      case 'buffs':
        return [
          {
            id: 'attack_buff',
            name: '공격력 증진 물약',
            description: '1시간 동안 공격력 +20%',
            price: 5,
            currency: 'gem',
            icon: '⚔️'
          },
          {
            id: 'gold_buff',
            name: '황금 손 물약',
            description: '1시간 동안 골드 획득량 +50%',
            price: 7,
            currency: 'gem',
            icon: '💰'
          }
        ]
      case 'pages':
        return [
          {
            id: 'skill_page_random',
            name: '랜덤 스킬 페이지',
            description: '랜덤한 스킬 페이지 1장을 획득합니다',
            price: 5,
            currency: 'gem',
            icon: '📜'
          },
          {
            id: 'skill_page_rare',
            name: '희귀 스킬 페이지',
            description: '희귀 등급 스킬 페이지 1장을 획득합니다',
            price: 15,
            currency: 'gem',
            icon: '📜'
          }
        ]
      case 'boosters':
        return [
          {
            id: 'exp_booster',
            name: 'EXP 부스터',
            description: '1시간 동안 경험치 획득량 +100%',
            price: 10,
            currency: 'gem',
            icon: '⭐'
          },
          {
            id: 'drop_booster',
            name: '드롭 부스터',
            description: '1시간 동안 아이템 드롭률 +50%',
            price: 8,
            currency: 'gem',
            icon: '🎁'
          }
        ]
      default:
        return []
    }
  }

  const handlePurchase = (item: any) => {
    const canAfford = item.currency === 'gold' 
      ? player.gold >= item.price
      : player.gem >= item.price

    if (!canAfford) {
      alert(`${item.currency === 'gold' ? '골드' : '젠'}가 부족합니다!`)
      return
    }

    // TODO: 실제 구매 로직 구현
    alert(`${item.name}을(를) 구매했습니다! (구매 기능 구현 예정)`)
  }

  return (
    <div 
      className="fixed inset-x-0 bg-gray-800 border-t border-gray-700 z-20 flex flex-col"
      style={{ top: '64px', bottom: '64px' }}
    >
      {/* 패널 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">🛒 상점</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* 구분 탭 */}
      <div className="flex border-b border-gray-700 bg-gray-800 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveTab('consumables')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'consumables' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <ShoppingCart size={14} />
            <span>소모품</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'materials' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Package size={14} />
            <span>재료팩</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('buffs')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'buffs' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Zap size={14} />
            <span>버프</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'pages' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <FileText size={14} />
            <span>페이지</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('boosters')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'boosters' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Star size={14} />
            <span>부스터</span>
          </div>
        </button>
      </div>

      {/* 패널 내용 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-32">
          <div className="p-4">
            <div className="space-y-3">
              {getShopItems().map((item) => {
                const canAfford = item.currency === 'gold' 
                  ? player.gold >= item.price
                  : player.gem >= item.price

                return (
                  <div key={item.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-sm text-gray-400">{item.description}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${
                          item.currency === 'gold' ? 'text-yellow-400' : 'text-purple-400'
                        }`}>
                          {item.currency === 'gold' ? '💰' : '💎'} {item.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          보유: {item.currency === 'gold' ? player.gold.toLocaleString() : player.gem}
                        </div>
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford}
                          className={`mt-2 px-4 py-2 rounded text-sm font-semibold transition-colors ${
                            canAfford
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '구매' : '부족'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 상점 안내 */}
            <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-blue-300 font-semibold mb-2">💡 상점 이용 안내</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• 골드는 몬스터 처치로 획득할 수 있습니다</div>
                <div>• 젠은 특별한 보상으로 가끔 획득됩니다</div>
                <div>• 스킬 페이지는 3장을 모으면 스킬을 배울 수 있습니다</div>
                <div>• 버프와 부스터는 일정 시간 동안 효과가 지속됩니다</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopPanel 