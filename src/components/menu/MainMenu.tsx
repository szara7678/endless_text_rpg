import React from 'react'
import { useGameStore } from '../../stores'

const MainMenu: React.FC = () => {
  const { startNewGame, continueGame, gameState } = useGameStore()

  // 메뉴가 아닌 상태에서는 렌더링 안함
  if (gameState !== 'menu') return null

  const handleNewGame = async () => {
    console.log('🎮 새 게임 시작!')
    try {
      await startNewGame()
    } catch (error) {
      console.error('새 게임 시작 실패:', error)
      alert('게임 시작에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleContinueGame = async () => {
    console.log('📂 이어하기!')
    try {
      await continueGame()
    } catch (error) {
      console.error('이어하기 실패:', error)
      alert('저장된 게임이 없거나 불러오기에 실패했습니다.')
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      {/* 게임 로고 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gradient mb-4">
          🗼 무한 텍스트 RPG
        </h1>
        <p className="text-gray-400 text-lg">
          끝없는 탑을 오르는 모험이 시작됩니다
        </p>
      </div>

      {/* 메뉴 버튼들 */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handleNewGame}
          className="w-full btn-primary text-lg py-4 hover:scale-105 transition-transform"
        >
          🆕 새 게임
        </button>
        
        <button
          onClick={handleContinueGame}
          className="w-full btn-secondary text-lg py-4 hover:scale-105 transition-transform"
        >
          ▶️ 이어하기
        </button>
        
        <button
          onClick={() => alert('설정 기능은 준비 중입니다.')}
          className="w-full btn-secondary text-lg py-4 hover:scale-105 transition-transform"
        >
          ⚙️ 설정
        </button>
        
        <button
          onClick={() => alert('도움말:\n\n🗼 끝없는 탑을 오르며 몬스터와 전투\n⚔️ 자동 전투 시스템\n📜 스킬 페이지 3장으로 스킬 해금\n💎 아이템과 재료 수집')}
          className="w-full btn-secondary text-lg py-4 hover:scale-105 transition-transform"
        >
          ❓ 도움말
        </button>
      </div>

      {/* 버전 정보 */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>v1.0.0 - 기획안 기반 구현</p>
        <p>🎮 모바일 최적화 UI</p>
      </div>
    </div>
  )
}

export default MainMenu 