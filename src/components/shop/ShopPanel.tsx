import React, { useState } from 'react'
import { X, Coins, Gem, ShoppingCart, Package, Zap, Star, Crown } from 'lucide-react'
import { useGameStore } from '../../stores'
import PackageDetailModal from './PackageDetailModal'
import PurchaseResultModal from './PurchaseResultModal'

interface ShopPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ShopItem {
  id: string
  name: string
  description: string
  category: 'package' | 'scroll'
  currency: 'gold' | 'gem'
  price: number
  rarity: 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary'
  icon: string
  effects?: any
  contents?: any
}

// 패키지 데이터 가져오기
import packagesData from '../../data/shop/packages.json'

const SHOP_ITEMS: ShopItem[] = [
  // 패키지 아이템들
  {
    id: 'materialBox',
    name: '재료 랜덤박스',
    description: '다양한 재료들을 랜덤으로 획득합니다.',
    category: 'package',
    currency: 'gold',
    price: 500,
    rarity: 'Fine',
    icon: '📦'
  },
  {
    id: 'skillPack',
    name: '스킬 페이지 랜덤팩',
    description: '랜덤 스킬 페이지를 획득합니다.',
    category: 'package',
    currency: 'gem',
    price: 10,
    rarity: 'Epic',
    icon: '📜'
  },
  {
    id: 'orePack',
    name: '광석 팩',
    description: '다양한 광석들을 획득합니다.',
    category: 'package',
    currency: 'gold',
    price: 300,
    rarity: 'Fine',
    icon: '⛏️'
  },
  {
    id: 'cookingPack',
    name: '요리 팩',
    description: '다양한 요리 재료와 완성된 요리를 획득합니다.',
    category: 'package',
    currency: 'gold',
    price: 400,
    rarity: 'Superior',
    icon: '🍳'
  },

  {
    id: 'potionPack',
    name: '물약 팩',
    description: '다양한 물약들을 획득합니다.',
    category: 'package',
    currency: 'gold',
    price: 250,
    rarity: 'Fine',
    icon: '🧪'
  },
  {
    id: 'fishPack',
    name: '물고기 팩',
    description: '다양한 물고기들을 획득합니다.',
    category: 'package',
    currency: 'gold',
    price: 200,
    rarity: 'Fine',
    icon: '🐟'
  },
  {
    id: 'herbPack',
    name: '약초 팩',
    description: '다양한 약초들을 획득합니다.',
    category: 'package',
    currency: 'gold',
    price: 180,
    rarity: 'Fine',
    icon: '🌿'
  },
  
  // 스크롤 아이템들
  {
    id: 'ap_scroll',
    name: 'AP 증가 스크롤',
    description: '사용 시 즉시 +5 AP를 획득합니다.',
    category: 'scroll',
    currency: 'gem',
    price: 25,
    rarity: 'Epic',
    icon: '📜',
    effects: {
      apBonus: 5
    }
  },
  {
    id: 'revival_scroll',
    name: '부활 스크롤',
    description: '보유 시 사망할 때 HP 100%로 부활하고 전투를 재개합니다.',
    category: 'scroll',
    currency: 'gem',
    price: 50,
    rarity: 'Legendary',
    icon: '📜',
    effects: {
      revival: true
    }
  }
]

const ShopPanel: React.FC<ShopPanelProps> = ({ isOpen, onClose }) => {
  const { player, purchaseItem, purchasePackage } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'package' | 'scroll'>('all')
  const [selectedCurrency, setSelectedCurrency] = useState<'all' | 'gold' | 'gem'>('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showItemDetail, setShowItemDetail] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<any>(null)
  const [showPurchaseResult, setShowPurchaseResult] = useState(false)

  // 아이템 필터링
  const filteredItems = SHOP_ITEMS.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (selectedCurrency !== 'all' && item.currency !== selectedCurrency) return false
    return true
  })

  // 구매 처리
  const handlePurchase = (item: ShopItem) => {
    // 모든 아이템에 대해 상세 정보 모달 표시
    if (item.category === 'package') {
      const packageData = packagesData[item.id]
      if (packageData) {
        setSelectedItem({ ...item, ...packageData })
        setShowItemDetail(true)
      } else {
        console.error('패키지 데이터를 찾을 수 없습니다:', item.id)
      }
    } else if (item.category === 'scroll') {
      setSelectedItem(item)
      setShowItemDetail(true)
    }
  }

  // 아이템 구매 처리
  const handleItemPurchase = async (item: any) => {
    try {
      if (item.category === 'package') {
        // 패키지 구매 - packages.json의 키와 일치하는 ID 사용
        const packageId = item.id // 이미 올바른 ID로 설정됨
        const result = await purchasePackage(packageId)
        if (result) {
          setPurchaseResult(result)
          setShowPurchaseResult(true)
          setShowItemDetail(false)
        }
      } else if (item.category === 'scroll') {
        // 스크롤 구매 - 바로 소비아이템으로 추가
        const { player } = useGameStore.getState()
        
        // 비용 확인
        const canAfford = item.currency === 'gold' 
          ? player.gold >= item.price 
          : (player.gem || 0) >= item.price

        if (!canAfford) {
          alert(`${item.currency === 'gold' ? '골드' : '젬'}가 부족합니다!`)
          return
        }

        // 비용 차감
        useGameStore.setState((state: any) => ({
          ...state,
          player: {
            ...state.player,
            gold: item.currency === 'gold' ? state.player.gold - item.price : state.player.gold,
            gem: item.currency === 'gem' ? (state.player.gem || 0) - item.price : (state.player.gem || 0)
          }
        }))

        // 스크롤 아이템을 인벤토리에 바로 추가
        useGameStore.getState().addItem(item.id, 1, 1, item.rarity)
        useGameStore.getState().addCombatLog('loot', `✅ ${item.name} 구매! 인벤토리에 추가됨`)
        
        console.log('스크롤 구매 완료:', {
          itemId: item.id,
          name: item.name,
          rarity: item.rarity
        })

        const scrollResult = {
          packageName: item.name,
          items: [{
            id: item.id,
            name: item.name,
            count: 1,
            type: 'item',
            rarity: item.rarity,
            icon: item.icon
          }]
        }
        setPurchaseResult(scrollResult)
        setShowPurchaseResult(true)
        setShowItemDetail(false)
      }
    } catch (error) {
      console.error('아이템 구매 오류:', error)
      alert('아이템 구매 중 오류가 발생했습니다.')
    }
  }

  // 희귀도별 색상
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

  if (!isOpen) return null

  return (
    <div className="absolute top-16 left-0 right-0 bg-gray-900 border-t border-gray-700 max-h-[calc(100vh-8rem)] overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-blue-400" size={20} />
          상점
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* 필터 */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-sm text-gray-400 mr-2">카테고리:</span>
          {['all', 'package', 'scroll'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? '전체' : 
               category === 'package' ? '패키지' : '스크롤'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400 mr-2">통화:</span>
          {['all', 'gold', 'gem'].map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency as any)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                selectedCurrency === currency
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {currency === 'all' ? '전체' : 
               currency === 'gold' ? '골드' : '젬'}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-16rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const canAfford = item.currency === 'gold' 
              ? player.gold >= item.price 
              : (player.gem || 0) >= item.price

            return (
              <div
                key={item.id}
                className={`bg-gray-800 rounded-lg p-4 border-2 transition-all duration-200 ${getRarityColor(item.rarity)} ${
                  canAfford ? 'hover:scale-105' : 'opacity-75'
                }`}
              >
                {/* 아이템 헤더 */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getRarityColor(item.rarity)} bg-opacity-20`}>
                        {item.rarity}
                      </span>
                      {item.category === 'scroll' && (
                        <Star className="text-yellow-400" size={12} />
                      )}
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>

                {/* 가격 및 구매 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.currency === 'gold' ? (
                      <Coins className="text-yellow-400" size={16} />
                    ) : (
                      <Gem className="text-cyan-400" size={16} />
                    )}
                    <span className="text-white font-bold">{item.price.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      canAfford
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? '자금 부족' : '상세보기'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 안내 메시지 */}
        {filteredItems.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>해당 조건의 상품이 없습니다.</p>
          </div>
        )}

        {/* 젬 획득 안내 */}
        <div className="mt-6 bg-cyan-900/30 rounded-lg p-4 border border-cyan-600">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
            <Crown className="text-cyan-400" size={20} />
            젬 획득 방법
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• 환생시 층수에 따라 젬 획득: (층수 - 100) ÷ 10</li>
            <li>• 특별 이벤트 및 업적 달성</li>
            <li>• 일일 로그인 보상</li>
            <li>• 프리미엄 아이템으로 게임 진행 가속화</li>
          </ul>
        </div>
      </div>

      {/* 아이템 상세 모달 */}
      <PackageDetailModal
        isOpen={showItemDetail}
        onClose={() => setShowItemDetail(false)}
        packageData={selectedItem}
        onPurchaseResult={(result) => {
          setPurchaseResult(result)
          setShowPurchaseResult(true)
        }}
        onItemPurchase={handleItemPurchase}
      />

      {/* 구매 결과 모달 */}
      <PurchaseResultModal
        isOpen={showPurchaseResult}
        onClose={() => setShowPurchaseResult(false)}
        result={purchaseResult}
      />
    </div>
  )
}

export default ShopPanel 