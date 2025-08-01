import React from 'react'
import { useGameStore } from '../../stores'
import HUD from './HUD'
import MainView from './MainView'
import TabBar from './TabBar'
import CharacterPanel from '../character/CharacterPanel'
import InventoryPanel from '../inventory/InventoryPanel'
import ShopPanel from '../shop/ShopPanel'
import LifePanel from '../life/LifePanel'
import SettingsPanel from '../settings/SettingsPanel'

const Layout: React.FC = () => {
  const { gameState, forceResetToMenu, ui, setActivePanel } = useGameStore()

  // 게임 상태가 아니면 렌더링 안함
  if (gameState !== 'playing') return null

  const handlePanelChange = (panel: 'character' | 'inventory' | 'shop' | 'life' | 'settings' | null) => {
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
      <div className="flex-1 pb-20 overflow-hidden">
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

      {ui.activePanel === 'life' && (
        <LifePanel 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}

      {ui.activePanel === 'settings' && (
        <SettingsPanel 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}
    </div>
  )
}

export default Layout 