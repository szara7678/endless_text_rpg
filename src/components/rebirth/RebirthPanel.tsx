import React, { useState } from 'react'
import { X, RotateCcw, Crown, Zap, TrendingUp } from 'lucide-react'
import { useGameStore } from '../../stores'

interface RebirthPanelProps {
  isOpen: boolean
  onClose: () => void
}

const RebirthPanel: React.FC<RebirthPanelProps> = ({ isOpen, onClose }) => {
  const { player, tower, executeRebirth, canRebirth } = useGameStore()
  const [showConfirmation, setShowConfirmation] = useState(false)

  // 환생 가능 여부 확인
  const rebirthData = canRebirth()

  // 획득 예상 AP 계산
  const calculateRebirthAP = () => {
    if (tower.currentFloor <= 100) return 0
    
    // 기본 공식: (현재 층수 - 100) * 2 + 보너스
    const baseAP = (tower.currentFloor - 100) * 2
    const milestoneBonus = Math.floor((tower.currentFloor - 100) / 50) * 10 // 50층마다 10 AP 보너스
    const totalAP = baseAP + milestoneBonus
    
    return totalAP
  }

  // 환생 혜택 계산
  const getRebirthBenefits = () => {
    const apGain = calculateRebirthAP()
    const skillLevelBonus = Math.floor(apGain / 20) // 20 AP당 스킬 레벨 1 보너스
    
    return {
      ap: apGain,
      skillLevelBonus,
      materialBonus: 0
    }
  }

  // 환생 실행
  const handleRebirth = () => {
    const benefits = getRebirthBenefits()
    executeRebirth(benefits)
    setShowConfirmation(false)
    onClose()
  }

  if (!isOpen) return null

  const benefits = getRebirthBenefits()

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="text-purple-400" size={24} />
            환생 시스템
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* 현재 상태 */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Crown className="text-yellow-400" size={20} />
              현재 상태
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">현재 층수</span>
                <span className="text-white font-medium">{tower.currentFloor}층</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">보유 AP</span>
                <span className="text-purple-400 font-medium">{player.rebirthLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">환생 횟수</span>
                <span className="text-white font-medium">{Math.floor(player.rebirthLevel / 100)}회</span>
              </div>
            </div>
          </div>

          {/* 환생 조건 */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">환생 조건</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {tower.currentFloor > 100 ? (
                  <span className="text-green-400">✅</span>
                ) : (
                  <span className="text-red-400">❌</span>
                )}
                <span className="text-gray-400">
                  100층 이상 달성 {tower.currentFloor > 100 ? `(${tower.currentFloor}층)` : `(${tower.currentFloor}/100층)`}
                </span>
              </div>
            </div>
          </div>

          {/* 환생 혜택 */}
          {tower.currentFloor > 100 && (
            <div className="bg-purple-900/30 rounded-lg p-4 mb-6 border border-purple-600">
              <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Zap className="text-purple-400" size={20} />
                환생 혜택
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">획득 AP</span>
                  <span className="text-purple-400 font-bold">+{benefits.ap}</span>
                </div>
                                 <div className="flex justify-between">
                   <span className="text-gray-400">다음 게임 스킬 레벨 보너스</span>
                   <span className="text-green-400 font-medium">+{benefits.skillLevelBonus}</span>
                 </div>
              </div>
              
              {/* AP 계산 공식 설명 */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  <div>계산식: (현재층수 - 100) × 2 + 마일스톤 보너스</div>
                  <div>마일스톤: 50층마다 +10 AP</div>
                </div>
              </div>
            </div>
          )}

          {/* 환생 안내 */}
          {tower.currentFloor <= 100 && (
            <div className="bg-orange-900/30 rounded-lg p-4 mb-6 border border-orange-600">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">환생 안내</h3>
              <p className="text-sm text-gray-400">
                100층을 넘어서면 환생이 가능합니다. 환생시 다음 혜택을 받습니다:
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>• AP 획득: (층수 - 100) × 2</li>
                <li>• 50층마다 추가 10 AP 보너스</li>
                <li>• AP로 스킬 강화 및 영구 버프</li>
                <li>• 다음 플레이에서 시작 보너스 적용</li>
              </ul>
            </div>
          )}

          {/* 환생 리스크 경고 */}
          {tower.currentFloor > 100 && (
            <div className="bg-red-900/30 rounded-lg p-4 mb-6 border border-red-600">
              <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ 주의사항</h3>
              <p className="text-sm text-gray-400">
                환생시 현재 진행도가 초기화됩니다:
              </p>
                             <ul className="text-xs text-gray-500 mt-2 space-y-1">
                 <li>• 층수만 1층으로 초기화</li>
                 <li>• 인벤토리, 스킬, 장비 모두 유지</li>
                 <li>• 획득한 AP로 영구 강화 가능</li>
                 <li>• 더 빠른 진행으로 더 높은 층 도달</li>
               </ul>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded transition-colors"
            >
              취소
            </button>
            {tower.currentFloor > 100 ? (
              <button
                onClick={() => setShowConfirmation(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp size={16} />
                환생하기
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-700 text-gray-500 py-3 px-4 rounded cursor-not-allowed"
              >
                환생 불가능
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 확인 다이얼로그 */}
              {showConfirmation && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
            onClick={() => setShowConfirmation(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              환생 확인
            </h3>
            <p className="text-gray-300 text-center mb-6">
              정말로 환생하시겠습니까?<br/>
              <span className="text-purple-400 font-bold">+{benefits.ap} AP</span>를 획득하고<br/>
              현재 진행도가 초기화됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRebirth}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
              >
                환생
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RebirthPanel 