import React from 'react'
import { Hammer, User, ShoppingCart, Package } from 'lucide-react'

type PanelType = 'life' | 'character' | 'shop' | 'inventory' | null

interface TabBarProps {
  activePanel: PanelType
  onPanelChange: (panel: PanelType) => void
}

const TabBar: React.FC<TabBarProps> = ({ activePanel, onPanelChange }) => {
  const tabs = [
    {
      id: 'life' as const,
      name: '생활',
      icon: Hammer,
      description: '제작·낚시·농사·채집·광산'
    },
    {
      id: 'character' as const,
      name: '캐릭터',
      icon: User,
      description: '정보·스킬·칭호·Relic'
    },
    {
      id: 'inventory' as const,
      name: '인벤토리',
      icon: Package,
      description: '재료·장비·소모품·정리'
    },
    {
      id: 'shop' as const,
      name: '상점',
      icon: ShoppingCart,
      description: '소모품·재료팩·버프·Page·부스터'
    }
  ]

  return (
    <div className="tab-bar bg-dark-800 border-t border-gray-700 flex">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activePanel === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onPanelChange(tab.id)}
            className={`tab-button ${isActive ? 'active' : 'inactive'}`}
            title={tab.description}
          >
            <div className="flex flex-col items-center gap-1">
              <Icon size={18} />
              <span className="text-xs">{tab.name}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default TabBar 