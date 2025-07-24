import React from 'react'
import { useGameStore } from '../../stores'
import HUD from './HUD'
import MainView from './MainView'

const Layout: React.FC = () => {
  const { gameState, forceResetToMenu } = useGameStore()

  // 게임 상태가 아니면 렌더링 안함
  if (gameState !== 'playing') return null

  return (
    <div className="layout h-full flex flex-col relative bg-gray-900">
      {/* 상단 HUD */}
      <HUD />
      
      {/* 메인 게임 영역 */}
      <div className="flex-1 overflow-hidden">
        <MainView />
      </div>
      
      {/* 디버깅용 메뉴 복귀 버튼 (우하단 작은 버튼) */}
      <div className="absolute bottom-4 right-4">
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