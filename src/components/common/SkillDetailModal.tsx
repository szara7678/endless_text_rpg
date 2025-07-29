import React from 'react'
import { X, Zap, Target, Flame, Snowflake, Skull, Moon, Zap as Thunder, Leaf } from 'lucide-react'
import { calculateSkillDamage, calculateLevelUpCost } from '../../utils/skillSystem'

interface SkillDetailModalProps {
  isOpen: boolean
  onClose: () => void
  skill: any
}

const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ isOpen, onClose, skill }) => {
  if (!isOpen || !skill) return null

  // 속성별 아이콘과 색상
  const getElementInfo = (element: string) => {
    const elementMap: Record<string, { icon: any, color: string, bgColor: string, name: string }> = {
      'Flame': { icon: Flame, color: 'text-red-400', bgColor: 'bg-red-900', name: '화염' },
      'Frost': { icon: Snowflake, color: 'text-blue-400', bgColor: 'bg-blue-900', name: '빙결' },
      'Toxic': { icon: Skull, color: 'text-green-400', bgColor: 'bg-green-900', name: '독성' },
      'Shadow': { icon: Moon, color: 'text-gray-400', bgColor: 'bg-gray-900', name: '암흑' },
      'Thunder': { icon: Thunder, color: 'text-yellow-400', bgColor: 'bg-yellow-900', name: '번개' },
      'Verdant': { icon: Leaf, color: 'text-emerald-400', bgColor: 'bg-emerald-900', name: '자연' },
      'physical': { icon: Target, color: 'text-orange-400', bgColor: 'bg-orange-900', name: '물리' },
      'magical': { icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-900', name: '마법' },
      'neutral': { icon: Target, color: 'text-gray-400', bgColor: 'bg-gray-900', name: '무속성' }
    }
    return elementMap[element] || elementMap['neutral']
  }

  // 스킬 데이터에서 실제 발동률 계산
  const calculateActualTriggerChance = async (skillId: string, level: number) => {
    try {
      const skillData = await import(`../../data/skills/${skillId}.json`)
      if (skillData.default) {
        const { triggerChance } = skillData.default
        
        if (skillId === 'basic_attack') {
          return 100
        }
        
        if (triggerChance) {
          const { base, perLevel, max } = triggerChance
          const calculatedChance = base + (level - 1) * perLevel
          return Math.min(calculatedChance, max)
        }
        
        return 10
      }
    } catch (error) {
      console.error(`스킬 데이터 로드 실패: ${skillId}`, error)
    }
    return skillId === 'basic_attack' ? 100 : 10
  }

  const [skillInfo, setSkillInfo] = React.useState({
    name: skill.skillId?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Skill',
    level: skill.level || 1,
    triggerChance: skill.triggerChance || (skill.skillId === 'basic_attack' ? 100 : 10),
    currentXp: skill.currentXp || 0,
    maxXp: skill.maxXp || 100,
    element: 'physical', // 기본값
    description: '스킬 설명이 여기에 표시됩니다.',
    type: 'Active'
  })
  const [skillData, setSkillData] = React.useState<any>(null)

  // 스킬 정보 업데이트 (경험치 포함)
  React.useEffect(() => {
    setSkillInfo(prev => ({
      ...prev,
      currentXp: skill.currentXp || 0,
      maxXp: skill.maxXp || 100,
      level: skill.level || 1
    }))
  }, [skill.currentXp, skill.maxXp, skill.level])

  // 스킬 데이터 로드 및 정보 업데이트
  React.useEffect(() => {
    const loadSkillData = async () => {
      try {
        const skillData = await import(`../../data/skills/${skill.skillId}.json`)
        if (skillData.default) {
          setSkillInfo(prev => ({
            ...prev,
            name: skillData.default.name || prev.name,
            element: skillData.default.element || prev.element,
            type: skillData.default.type || prev.type,
            description: skillData.default.description || prev.description
          }))
          setSkillData(skillData.default)
        }
      } catch (error) {
        console.error(`스킬 데이터 로드 실패: ${skill.skillId}`, error)
      }
    }
    loadSkillData()
  }, [skill.skillId])

  // 실제 발동률 계산 (비동기 처리)
  React.useEffect(() => {
    const updateTriggerChance = async () => {
      const actualChance = await calculateActualTriggerChance(skill.skillId, skillInfo.level)
      setSkillInfo(prev => ({ ...prev, triggerChance: actualChance }))
    }
    updateTriggerChance()
  }, [skill.skillId, skillInfo.level])

  // 속성별 스킬 분류
  if (skill.skillId?.includes('fireball') || skill.skillId?.includes('flame') || skill.skillId?.includes('ember')) {
    skillInfo.element = 'Flame'
  } else if (skill.skillId?.includes('ice') || skill.skillId?.includes('frost')) {
    skillInfo.element = 'Frost'
  } else if (skill.skillId?.includes('poison') || skill.skillId?.includes('toxic')) {
    skillInfo.element = 'Toxic'
  } else if (skill.skillId?.includes('shadow') || skill.skillId?.includes('dark')) {
    skillInfo.element = 'Shadow'
  } else if (skill.skillId?.includes('thunder') || skill.skillId?.includes('lightning')) {
    skillInfo.element = 'Thunder'
  } else if (skill.skillId?.includes('nature') || skill.skillId?.includes('verdant')) {
    skillInfo.element = 'Verdant'
  }

  // 스킬 타입 분류
  if (skill.skillId?.includes('aura') || skill.skillId?.includes('passive')) {
    skillInfo.type = 'Passive'
  }

  // 스킬별 설명
  const descriptions: Record<string, string> = {
    'basic_attack': '기본적인 물리 공격으로 적에게 피해를 입힙니다. 모든 전투에서 100% 확률로 발동되며, 레벨업시 추가 피해량이 증가합니다.',
    'fireball': '강력한 화염구를 발사하여 적에게 큰 피해를 입힙니다. 화염 속성 피해를 가하며, 빙결 속성 적에게 상성 보너스 피해를 줍니다. 레벨업시 발동률과 피해량이 증가합니다.',
    'ice_shard': '날카로운 얼음 조각을 발사하여 적을 공격합니다. 빙결 속성 피해를 가하며, 화염 속성 적에게 상성 보너스 피해를 줍니다. 정밀한 공격으로 치명타 확률이 높습니다.',
    'flame_aura': '몸 주변에 화염 오라를 생성하여 지속적으로 주변 적들에게 피해를 입힙니다. 패시브 스킬로 전투 중 자동으로 발동되며, 시간이 지날수록 더 강력해집니다.',
    'frost_bite': '적을 얼려서 이동 속도와 공격 속도를 감소시킵니다. 패시브 스킬로 공격시 일정 확률로 발동되며, 적의 행동을 방해하여 전투를 유리하게 만듭니다.',
    'ember_toss': '작은 화염탄 여러 개를 던져 여러 적에게 동시에 피해를 입힙니다. 범위 공격 스킬로 다수의 적을 상대할 때 효과적이며, 발동률이 빠르게 증가합니다.'
  }

  skillInfo.description = descriptions[skill.skillId] || skillInfo.description

  const elementInfo = getElementInfo(skillInfo.element)
  const ElementIcon = elementInfo.icon
  const progressPercent = skillInfo.maxXp ? Math.floor((skillInfo.currentXp / skillInfo.maxXp) * 100) : 0

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
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">📖 스킬 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 스킬 기본 정보 */}
        <div className="p-4 space-y-4">
          {/* 스킬 이름과 레벨 */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">{skillInfo.name}</h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-lg text-purple-400 font-semibold">Lv {skillInfo.level}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                skillInfo.type === 'Active' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
              }`}>
                {skillInfo.type === 'Active' ? '액티브' : '패시브'}
              </span>
            </div>
          </div>

          {/* 속성 정보 */}
          <div className={`${elementInfo.bgColor} rounded-lg p-3 border border-opacity-20`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ElementIcon size={20} className={elementInfo.color} />
              <span className={`font-medium ${elementInfo.color}`}>{elementInfo.name} 속성</span>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-300">발동률</div>
              <div className={`text-lg font-bold ${elementInfo.color}`}>{skillInfo.triggerChance.toFixed(1)}%</div>
            </div>
          </div>

          {/* 경험치 정보 */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">경험치</span>
              <span className="text-sm text-white font-mono">
                {skillInfo.currentXp}/{skillInfo.maxXp} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 스킬 설명 */}
          <div className="bg-gray-900 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-400 mb-2">📝 설명</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {skillInfo.description}
            </p>
          </div>

          {/* 스킬 효과 (레벨별) */}
          <div className="bg-gray-900 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-400 mb-2">⚡ 현재 효과</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">마법 대미지</span>
                <span className="text-white font-mono">
                  {skillData && skillData.damageCalculation ? (
                    (() => {
                      const damage = calculateSkillDamage(skillData, 1, { magicalAttack: 100, physicalAttack: 50 }, skillInfo.level)
                      return `${damage.magicDamage} (${skillData.damageCalculation.baseMagicAtk || 0} + ${skillData.damageCalculation.levelScaling || 0} × 레벨)`
                    })()
                  ) : (
                    '로딩 중...'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">물리 대미지</span>
                <span className="text-white font-mono">
                  {skillData && skillData.damageCalculation ? (
                    (() => {
                      const damage = calculateSkillDamage(skillData, 1, { magicalAttack: 100, physicalAttack: 50 }, skillInfo.level)
                      return `${damage.physicalDamage} (${skillData.damageCalculation.basePhysicalAtk || 0} + ${skillData.damageCalculation.levelScaling || 0} × 레벨)`
                    })()
                  ) : (
                    '로딩 중...'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">속성 보너스</span>
                <span className="text-white font-mono">
                  {skillData && skillData.damageCalculation ? (
                    `${(skillData.damageCalculation.elementalBonus || 1.0) * 100}%`
                  ) : (
                    '로딩 중...'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">발동률</span>
                <span className="text-white font-mono">{skillInfo.triggerChance.toFixed(1)}%</span>
              </div>
              {skillInfo.type === 'Passive' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">지속 효과</span>
                  <span className="text-white font-mono">{skillInfo.level * 5}초</span>
                </div>
              )}
            </div>
          </div>

                       {/* 다음 레벨 정보 */}
           <div className="bg-gray-900 rounded-lg p-3">
             <h4 className="text-sm font-medium text-gray-400 mb-2">📈 다음 레벨 효과</h4>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-300">마법 대미지</span>
                 <span className="text-green-400 font-mono">
                   {skillData && skillData.damageCalculation ? (
                     (() => {
                       const currentDamage = calculateSkillDamage(skillData, 1, { magicalAttack: 100, physicalAttack: 50 }, skillInfo.level)
                       const nextDamage = calculateSkillDamage(skillData, 1, { magicalAttack: 100, physicalAttack: 50 }, skillInfo.level + 1)
                       return `${nextDamage.magicDamage} (+${nextDamage.magicDamage - currentDamage.magicDamage})`
                     })()
                   ) : (
                     '로딩 중...'
                   )}
                 </span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-300">물리 대미지</span>
                 <span className="text-green-400 font-mono">
                   {skillData && skillData.damageCalculation ? (
                     (() => {
                       const currentDamage = calculateSkillDamage(skillData, 1, { magicalAttack: 100, physicalAttack: 50 }, skillInfo.level)
                       const nextDamage = calculateSkillDamage(skillData, 1, { magicalAttack: 100, physicalAttack: 50 }, skillInfo.level + 1)
                       return `${nextDamage.physicalDamage} (+${nextDamage.physicalDamage - currentDamage.physicalDamage})`
                     })()
                   ) : (
                     '로딩 중...'
                   )}
                 </span>
               </div>
               
               {/* 스킬별 발동률 증가 체크 */}
               {(() => {
                 // 기본 공격은 항상 100% 발동률 유지
                 if (skill.skillId === 'basic_attack') {
                   return null
                 }
                 
                 // 스킬 데이터에서 다음 레벨 발동률 계산
                 const calculateNextLevelTriggerChance = async () => {
                   try {
                     const skillData = await import(`../../data/skills/${skill.skillId}.json`)
                     if (skillData.default && skillData.default.triggerChance) {
                       const { base, perLevel, max } = skillData.default.triggerChance
                       const nextLevelChance = base + skillInfo.level * perLevel
                       const nextLevelFinalChance = Math.min(nextLevelChance, max)
                       
                       if (nextLevelFinalChance > skillInfo.triggerChance) {
                         return (
                           <div className="flex justify-between text-sm">
                             <span className="text-gray-300">발동률</span>
                             <span className="text-green-400 font-mono">
                               {nextLevelFinalChance.toFixed(1)}%
                               <span className="text-green-500 ml-1">(+{(nextLevelFinalChance - skillInfo.triggerChance).toFixed(1)}%)</span>
                             </span>
                           </div>
                         )
                       }
                     }
                   } catch (error) {
                     console.error(`스킬 데이터 로드 실패: ${skill.skillId}`, error)
                   }
                   return null
                 }
                 
                 // 비동기 처리를 위한 상태 관리
                 const [nextLevelInfo, setNextLevelInfo] = React.useState<React.ReactNode>(null)
                 
                 React.useEffect(() => {
                   calculateNextLevelTriggerChance().then(setNextLevelInfo)
                 }, [skill.skillId, skillInfo.level, skillInfo.triggerChance])
                 
                 return nextLevelInfo
               })()}
               
               <div className="text-xs text-gray-500 mt-2">
                 {skill.skillId === 'basic_attack' 
                   ? '* 기본 공격은 항상 100% 발동률을 유지합니다' 
                   : '* 발동률은 스킬별로 다른 레벨에서 상승합니다'}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default SkillDetailModal 