import React, { useState } from 'react'
import { X, Coins, Gem } from 'lucide-react'

interface ShopPanelProps {
  isOpen: boolean
  onClose: () => void
}

const ShopPanel: React.FC<ShopPanelProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'consumables' | 'materials' | 'buffs' | 'pages'>('consumables')

  return (
    <div className={`panel-slide-up ${isOpen ? 'open' : ''} fixed inset-x-0 bottom-16 h-[calc(100vh-80px-64px)] bg-dark-800 border-t border-gray-700 z-30`}>
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">상점</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* 재화 표시 */}
      <div className="flex justify-center gap-6 p-3 bg-dark-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-yellow-400" />
          <span className="text-yellow-400 font-mono">1,250</span>
        </div>
        <div className="flex items-center gap-2">
          <Gem size={16} className="text-purple-400" />
          <span className="text-purple-400 font-mono">15</span>
        </div>
      </div>
      
      {/* 카테고리 탭 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveCategory('consumables')}
          className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
            activeCategory === 'consumables' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          소모품
        </button>
        <button
          onClick={() => setActiveCategory('materials')}
          className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
            activeCategory === 'materials' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          재료팩
        </button>
        <button
          onClick={() => setActiveCategory('buffs')}
          className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
            activeCategory === 'buffs' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          버프
        </button>
        <button
          onClick={() => setActiveCategory('pages')}
          className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
            activeCategory === 'pages' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          페이지
        </button>
      </div>
      
      {/* 상품 목록 - 스크롤 가능 영역 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px - 64px - 140px)' }}>
        {activeCategory === 'consumables' && (
          <div className="p-4 space-y-3">
            <h3 className="text-md font-semibold text-white mb-3">소모품</h3>
            
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="bg-dark-900 p-3 rounded border border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-red-400 font-semibold">
                      {index % 2 === 0 ? '체력 포션' : '마나 포션'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {index % 2 === 0 ? 'HP 200 즉시 회복' : 'MP 100 즉시 회복'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins size={14} />
                      <span>{index % 2 === 0 ? '50' : '40'}</span>
                    </div>
                    <button className="mt-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                      구매
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeCategory === 'materials' && (
          <div className="p-4 space-y-3">
            <h3 className="text-md font-semibold text-white mb-3">재료팩</h3>
            
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="bg-dark-900 p-3 rounded border border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-orange-400 font-semibold">
                      {['화염', '빙결', '독성', '그림자', '번개', '자연'][index]} 재료팩
                    </div>
                    <div className="text-xs text-gray-400">재료 5개, 수정 2개</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Gem size={14} />
                      <span>3</span>
                    </div>
                    <button className="mt-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                      구매
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeCategory === 'buffs' && (
          <div className="p-4 space-y-3">
            <h3 className="text-md font-semibold text-white mb-3">버프 아이템</h3>
            
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-dark-900 p-3 rounded border border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-yellow-400 font-semibold">
                      {['경험치', '드롭률', '골드', '스킬', '크리티컬'][index]} 부스터
                    </div>
                    <div className="text-xs text-gray-400">1시간 동안 효과 +{30 + index * 10}%</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Gem size={14} />
                      <span>{5 + index * 2}</span>
                    </div>
                    <button className="mt-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                      구매
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeCategory === 'pages' && (
          <div className="p-4 space-y-3">
            <h3 className="text-md font-semibold text-white mb-3">스킬 페이지</h3>
            
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-dark-900 p-3 rounded border border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-purple-400 font-semibold">
                      {index === 0 ? '랜덤 스킬 페이지' : 
                       index === 1 ? '고급 스킬 페이지' :
                       index === 2 ? '희귀 스킬 페이지' : '전설 스킬 페이지'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {index === 0 ? '무작위 스킬 페이지 1개' :
                       index === 1 ? '고급 등급 스킬 페이지 1개' :
                       index === 2 ? '희귀 등급 스킬 페이지 1개' : '전설 등급 스킬 페이지 1개'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Gem size={14} />
                      <span>{[10, 25, 50, 100][index]}</span>
                    </div>
                    <button className="mt-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                      구매
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopPanel 