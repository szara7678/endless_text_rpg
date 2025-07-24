import React from 'react'
import { X } from 'lucide-react'

interface SkillDetailModalProps {
  isOpen: boolean
  onClose: () => void
  skill: any
}

const elementColors = {
  Physical: 'text-red-400',
  Fire: 'text-orange-400',
  Water: 'text-blue-400',
  Earth: 'text-green-400',
  Air: 'text-gray-300',
  Dark: 'text-purple-400',
  Light: 'text-yellow-400'
}

const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ isOpen, onClose, skill }) => {
  if (!isOpen || !skill) return null

  const elementColor = elementColors[skill.element as keyof typeof elementColors] || elementColors.Physical

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-white">{skill.name}</h2>
            <div className={`text-sm ${elementColor}`}>{skill.element} • {skill.type}</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-4">
          {/* 설명 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">설명</h3>
            <p className="text-gray-400 text-sm">{skill.description}</p>
          </div>

          {/* 기본 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">기본 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">타입: <span className="text-white">{skill.type}</span></div>
              <div className="text-gray-400">속성: <span className={elementColor}>{skill.element}</span></div>
              {skill.mpCost > 0 && (
                <div className="text-gray-400">MP 소모: <span className="text-blue-400">{skill.mpCost}</span></div>
              )}
              {skill.cooldown > 0 && (
                <div className="text-gray-400">재사용 대기: <span className="text-white">{skill.cooldown}초</span></div>
              )}
              {skill.triggerChance < 100 && (
                <div className="text-gray-400">발동률: <span className="text-white">{skill.triggerChance}%</span></div>
              )}
              {skill.maxLevel && (
                <div className="text-gray-400">최대 레벨: <span className="text-white">{skill.maxLevel}</span></div>
              )}
            </div>
          </div>

          {/* 효과 */}
          {skill.effects && skill.effects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">효과</h3>
              <div className="space-y-1">
                {skill.effects.map((effect: any, index: number) => (
                  <div key={index} className="text-sm text-purple-400">
                    • {effect.type === 'damage' ? `${effect.element} 데미지 ${effect.value}%` : 
                       effect.type === 'heal' ? `HP ${effect.value} 회복` :
                       effect.type === 'buff' ? `${effect.stat} ${effect.value} 증가` :
                       effect.type}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 학습 조건 */}
          {skill.requiredPages > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">학습 조건</h3>
              <div className="text-sm text-gray-400">
                스킬 페이지: <span className="text-purple-400">{skill.requiredPages}장</span>
              </div>
            </div>
          )}

          {/* 훈련 규칙 */}
          {skill.trainingRules && skill.trainingRules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">성장 조건</h3>
              <div className="space-y-1">
                {skill.trainingRules.map((rule: any, index: number) => (
                  <div key={index} className="text-sm text-gray-400">
                    • {rule.condition === 'use_count' ? `${rule.value}회 사용시` :
                       rule.condition === 'damage_dealt' ? `${rule.value} 데미지 누적시` :
                       rule.condition} 경험치 +{rule.xpGain}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default SkillDetailModal 