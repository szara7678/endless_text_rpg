import React from 'react'
import { Play, Pause, Trash2, Gauge } from 'lucide-react'

interface FloatingActionButtonProps {
  autoMode: boolean
  autoSpeed: number
  onToggleAuto: () => void
  onClearLog: () => void
  onSpeedChange: () => void
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  autoMode,
  autoSpeed,
  onToggleAuto,
  onClearLog,
  onSpeedChange
}) => {
  return (
    <div className="fab-container fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center gap-2">
        {/* 자동 진행 토글 */}
        <button
          onClick={onToggleAuto}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 border ${
            autoMode 
              ? 'bg-green-600 hover:bg-green-700 text-white border-green-500' 
              : 'bg-gray-600 hover:bg-gray-700 text-white border-gray-500'
          }`}
          title={autoMode ? '자동 진행 중지' : '자동 진행 시작'}
        >
          {autoMode ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        {/* 로그 초기화 */}
        <button
          onClick={onClearLog}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-200 border border-red-500"
          title="전투 로그 초기화"
        >
          <Trash2 size={20} />
        </button>
        
        {/* 진행 속도 조절 */}
        <button
          onClick={onSpeedChange}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 border border-blue-500 min-w-[60px]"
          title="진행 속도 변경"
        >
          <div className="flex items-center gap-1">
            <Gauge size={16} />
            <span className="text-sm font-bold">{autoSpeed}x</span>
          </div>
        </button>
      </div>
      
      {/* 자동 진행 상태 표시 */}
      {autoMode && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-800 px-2 py-1 rounded text-xs text-green-400 border border-gray-600">
          자동 진행 중 ({autoSpeed}x)
        </div>
      )}
    </div>
  )
}

export default FloatingActionButton 