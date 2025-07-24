import React from 'react'
import { useGameStore } from '../../stores'

const HUD: React.FC = () => {
  const { player } = useGameStore()

  return (
    <div className="hud bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* 플레이어 기본 정보 */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <div className="text-gray-400">HP</div>
            <div className="text-red-400 font-mono">
              {player.hp}/{player.maxHp}
          </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-400">MP</div>
            <div className="text-blue-400 font-mono">
              {player.mp}/{player.maxMp}
        </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-400">층수</div>
            <div className="text-yellow-400 font-mono">
              {player.highestFloor}F
            </div>
          </div>
        </div>

        {/* 재화 정보 */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <div className="text-gray-400">골드</div>
            <div className="text-yellow-400 font-mono">
              {player.gold.toLocaleString()}G
      </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-400">젠</div>
            <div className="text-purple-400 font-mono">
              {player.gem}💎
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HUD 