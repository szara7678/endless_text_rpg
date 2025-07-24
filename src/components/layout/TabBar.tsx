import React from 'react'
import { User, Package, ShoppingCart, Hammer } from 'lucide-react'

interface TabBarProps {
  activePanel: string | null
  onPanelChange: (panel: 'character' | 'inventory' | 'shop' | 'life' | null) => void
}

const TabBar: React.FC<TabBarProps> = ({ activePanel, onPanelChange }) => {
  return (
    <div className="tab-bar fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-30 h-16">
      <div className="flex justify-around py-2">
        
        {/* 캐릭터 탭 */}
        <button
          onClick={() => onPanelChange('character')}
          className={`tab-item flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activePanel === 'character' 
              ? 'text-blue-400 bg-blue-900/30' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User size={20} />
          <span className="text-xs mt-1">캐릭터</span>
        </button>
        
        {/* 인벤토리 탭 */}
        <button
          onClick={() => onPanelChange('inventory')}
          className={`tab-item flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activePanel === 'inventory' 
              ? 'text-green-400 bg-green-900/30' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Package size={20} />
          <span className="text-xs mt-1">인벤토리</span>
        </button>
        
        {/* 상점 탭 */}
        <button
          onClick={() => onPanelChange('shop')}
          className={`tab-item flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activePanel === 'shop' 
              ? 'text-yellow-400 bg-yellow-900/30' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShoppingCart size={20} />
          <span className="text-xs mt-1">상점</span>
        </button>

        {/* 생활 스킬 탭 */}
        <button
          onClick={() => onPanelChange('life')}
          className={`tab-item flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activePanel === 'life' 
              ? 'text-orange-400 bg-orange-900/30' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Hammer size={20} />
          <span className="text-xs mt-1">생활</span>
        </button>
        
      </div>
    </div>
  )
}

export default TabBar 