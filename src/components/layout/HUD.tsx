import React from 'react'
import { useGameStore } from '../../stores'

const HUD: React.FC = () => {
  const { player } = useGameStore()

  return (
    <div className="hud bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex justify-between items-center">
        {/* 좌측: HP/MP */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-sm font-medium">❤️ HP</span>
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
              />
            </div>
            <span className="text-white text-xs font-mono">
              {player.hp}/{player.maxHp}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 text-sm font-medium">💧 MP</span>
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (player.mp / player.maxMp) * 100)}%` }}
              />
            </div>
            <span className="text-white text-xs font-mono">
              {player.mp}/{player.maxMp}
            </span>
          </div>
        </div>

        {/* 중앙: 층수 */}
        <div className="flex flex-col items-center">
          <div className="text-white text-lg font-bold">
            {player.highestFloor}층
          </div>
        </div>

        {/* 우측: 재화 */}
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400 text-sm">💰</span>
            <span className="text-white text-sm font-mono">
              {player.gold.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-purple-400 text-sm">💎</span>
            <span className="text-white text-sm font-mono">
              {player.gem.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HUD 