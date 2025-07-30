import React, { useState } from 'react'
import { X, Coins, Gem, ShoppingCart, Package, Zap, Star, Crown } from 'lucide-react'
import { useGameStore } from '../../stores'

interface ShopPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ShopItem {
  id: string
  name: string
  description: string
  category: 'equipment' | 'consumable' | 'material' | 'premium'
  currency: 'gold' | 'gem'
  price: number
  itemData: {
    itemId: string
    level: number
    quantity: number
  }
  rarity: 'Common' | 'Fine' | 'Superior' | 'Epic' | 'Legendary'
  icon: string
  requirements?: {
    level?: number
    rebirthLevel?: number
  }
}

const SHOP_ITEMS: ShopItem[] = [
  // 골드 상점
  {
    id: 'health_potion_shop',
    name: '체력 물약',
    description: 'HP를 즉시 50 회복합니다.',
    category: 'consumable',
    currency: 'gold',
    price: 100,
    itemData: { itemId: 'health_potion', level: 1, quantity: 1 },
    rarity: 'Common',
    icon: '🧪'
  },
  {
    id: 'mana_potion_shop',
    name: '마나 물약',
    description: 'MP를 즉시 30 회복합니다.',
    category: 'consumable',
    currency: 'gold',
    price: 80,
    itemData: { itemId: 'mana_potion', level: 1, quantity: 1 },
    rarity: 'Common',
    icon: '💙'
  },
  {
    id: 'iron_ore_shop',
    name: '철 광석 팩',
    description: '철 광석 5개 묶음입니다.',
    category: 'material',
    currency: 'gold',
    price: 150,
    itemData: { itemId: 'iron_ore', level: 1, quantity: 5 },
    rarity: 'Fine',
    icon: '⛏️'
  },
  {
    id: 'wood_shop',
    name: '나무 팩',
    description: '나무 10개 묶음입니다.',
    category: 'material',
    currency: 'gold',
    price: 100,
    itemData: { itemId: 'wood', level: 1, quantity: 10 },
    rarity: 'Common',
    icon: '🪵'
  },
  {
    id: 'iron_sword_shop',
    name: '철 검',
    description: '물리 공격력 15의 튼튼한 검입니다.',
    category: 'equipment',
    currency: 'gold',
    price: 500,
    itemData: { itemId: 'iron_sword', level: 1, quantity: 1 },
    rarity: 'Fine',
    icon: '⚔️',
    requirements: { level: 3 }
  },
  
  // 젬 상점 (프리미엄)
  {
    id: 'skill_page_pack',
    name: '스킬 페이지 팩',
    description: '랜덤 스킬 페이지 3개를 획득합니다.',
    category: 'premium',
    currency: 'gem',
    price: 10,
    itemData: { itemId: 'skill_page_random', level: 1, quantity: 3 },
    rarity: 'Epic',
    icon: '📜'
  },
  {
    id: 'premium_material_pack',
    name: '프리미엄 재료 팩',
    description: '고급 재료들을 대량으로 획득합니다.',
    category: 'premium',
    currency: 'gem',
    price: 20,
    itemData: { itemId: 'premium_material_pack', level: 1, quantity: 1 },
    rarity: 'Legendary',
    icon: '💎'
  },
  {
    id: 'enhancement_stone',
    name: '강화석',
    description: '장비 강화 성공률을 100%로 만듭니다.',
    category: 'premium',
    currency: 'gem',
    price: 5,
    itemData: { itemId: 'enhancement_stone', level: 1, quantity: 1 },
    rarity: 'Epic',
    icon: '✨'
  },
  {
    id: 'exp_boost',
    name: '경험치 부스터',
    description: '1시간 동안 모든 경험치를 2배로 받습니다.',
    category: 'premium',
    currency: 'gem',
    price: 15,
    itemData: { itemId: 'exp_boost', level: 1, quantity: 1 },
    rarity: 'Superior',
    icon: '🚀'
  },
  {
    id: 'rebirth_stone',
    name: '환생석',
    description: '즉시 +10 AP를 획득합니다.',
    category: 'premium',
    currency: 'gem',
    price: 50,
    itemData: { itemId: 'rebirth_stone', level: 1, quantity: 1 },
    rarity: 'Legendary',
    icon: '🌟',
    requirements: { rebirthLevel: 1 }
  }
]

const ShopPanel: React.FC<ShopPanelProps> = ({ isOpen, onClose }) => {
  const { player, purchaseItem } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'equipment' | 'consumable' | 'material' | 'premium'>('all')
  const [selectedCurrency, setSelectedCurrency] = useState<'all' | 'gold' | 'gem'>('all')

  // 아이템 필터링
  const filteredItems = SHOP_ITEMS.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (selectedCurrency !== 'all' && item.currency !== selectedCurrency) return false
    
    // 레벨 요구사항 체크
    if (item.requirements?.level && (player.rebirthLevel < item.requirements.level * 10)) return false
    if (item.requirements?.rebirthLevel && player.rebirthLevel < item.requirements.rebirthLevel) return false
    
    return true
  })

  // 구매 처리
  const handlePurchase = (item: ShopItem) => {
    const canAfford = item.currency === 'gold' 
      ? player.gold >= item.price 
                       : (player.gem || 0) >= item.price

    if (!canAfford) {
      alert(`${item.currency === 'gold' ? '골드' : '젬'}가 부족합니다!`)
      return
    }

    // 구매 실행
    purchaseItem(item)
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

      {/* 통화 표시 */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-400" size={16} />
              <span className="text-white font-medium">{player.gold.toLocaleString()}</span>
              <span className="text-gray-400 text-xs">골드</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="text-cyan-400" size={16} />
              <span className="text-white font-medium">{player.gem || 0}</span>
              <span className="text-gray-400 text-xs">젬</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            💎 젬은 환생시 층수에 따라 획득 가능
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-sm text-gray-400 mr-2">카테고리:</span>
          {['all', 'equipment', 'consumable', 'material', 'premium'].map((category) => (
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
               category === 'equipment' ? '장비' :
               category === 'consumable' ? '소모품' :
               category === 'material' ? '재료' : '프리미엄'}
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
            
            const meetsRequirements = 
              (!item.requirements?.level || (player.rebirthLevel >= item.requirements.level * 10)) &&
              (!item.requirements?.rebirthLevel || player.rebirthLevel >= item.requirements.rebirthLevel)

            return (
              <div
                key={item.id}
                className={`bg-gray-800 rounded-lg p-4 border-2 transition-all duration-200 ${getRarityColor(item.rarity)} ${
                  canAfford && meetsRequirements ? 'hover:scale-105' : 'opacity-75'
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
                      {item.category === 'premium' && (
                        <Star className="text-yellow-400" size={12} />
                      )}
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>

                {/* 수량 표시 */}
                {item.itemData.quantity > 1 && (
                  <div className="text-xs text-blue-400 mb-2">
                    📦 수량: {item.itemData.quantity}개
                  </div>
                )}

                {/* 요구사항 */}
                {item.requirements && (
                  <div className="text-xs text-gray-500 mb-3">
                    {item.requirements.level && (
                      <div>레벨 {item.requirements.level} 이상</div>
                    )}
                    {item.requirements.rebirthLevel && (
                      <div>환생 레벨 {item.requirements.rebirthLevel} 이상</div>
                    )}
                  </div>
                )}

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
                    disabled={!canAfford || !meetsRequirements}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      canAfford && meetsRequirements
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!meetsRequirements ? '조건 미달' : 
                     !canAfford ? '자금 부족' : '구매'}
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
    </div>
  )
}

export default ShopPanel 