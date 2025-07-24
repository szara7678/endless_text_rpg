import React, { useEffect } from 'react'
import { useGameStore } from './stores'
import Layout from './components/layout/Layout'
import MainMenu from './components/menu/MainMenu'

const App: React.FC = () => {
  const { gameState, setGameState } = useGameStore()

  useEffect(() => {
    // 앱 시작 시 메뉴 상태로 초기화
    if (!gameState) {
      setGameState('menu')
    }
  }, [gameState, setGameState])

  return (
    <div className="app h-full bg-gray-900 text-white">
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && <Layout />}
      {gameState === 'loading' && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">게임을 초기화하는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App 