import React from 'react'
import { useGameStore } from '../../stores'
import HUD from './HUD'
import MainView from './MainView'
import TabBar from './TabBar'
import CharacterPanel from '../character/CharacterPanel'
import InventoryPanel from '../inventory/InventoryPanel'
import ShopPanel from '../shop/ShopPanel'

const Layout: React.FC = () => {
  const { gameState, forceResetToMenu, ui, setActivePanel } = useGameStore()

  // 게임 상태가 아니면 렌더링 안함
  if (gameState !== 'playing') return null

  const handlePanelChange = (panel: 'character' | 'inventory' | 'shop' | null) => {
    // 같은 탭을 다시 클릭하면 닫기, 다른 탭을 클릭하면 해당 탭으로 변경
    if (ui.activePanel === panel) {
      setActivePanel(null)
    } else {
      setActivePanel(panel)
    }
  }

  return (
    <div className="layout h-full flex flex-col relative bg-gray-900">
      {/* 상단 HUD */}
      <HUD />
      
      {/* 메인 게임 영역 - TabBar 공간 확보 */}
      <div className="flex-1 pb-16 overflow-hidden">
        <MainView />
      </div>
      
      {/* 하단 탭바 - 고정 위치 */}
      <TabBar 
        activePanel={ui.activePanel} 
        onPanelChange={handlePanelChange} 
      />
      
      {/* 패널들 */}
      {ui.activePanel === 'character' && (
        <CharacterPanel 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}
      
      {ui.activePanel === 'inventory' && (
        <InventoryPanel 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}
      
      {ui.activePanel === 'shop' && (
        <ShopPanel 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}
      
      {/* 디버깅용 메뉴 복귀 버튼 (우하단 작은 버튼) */}
      <div className="absolute bottom-20 right-4">
        <button
          onClick={() => forceResetToMenu()}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
        >
          메뉴
        </button>
      </div>
    </div>
  )
}

export default Layout 