import React, { useState } from 'react'
import { X, Info, Sword, Star, Activity } from 'lucide-react'
import { useGameStore } from '../../stores'

// 스킬 데이터 import
import fireballData from '../../data/skills/fireball.json'
import flameAuraData from '../../data/skills/flame_aura.json'

interface CharacterPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface SkillModalProps {
  skillId: string
  isOpen: boolean
  onClose: () => void
}

// 품질별 색상 정의
const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'Normal': return 'text-gray-400 border-gray-600'
    case 'Fine': return 'text-green-400 border-green-600'
    case 'Masterwork': return 'text-blue-400 border-blue-600'
    case 'Legendary': return 'text-purple-400 border-purple-600'
    default: return 'text-gray-400 border-gray-600'
  }
}

// 스킬 데이터 맵핑
const skillDataMap: { [key: string]: any } = {
  'fireball': fireballData,
  'flame_aura': flameAuraData,
  'ice_bolt': {
    id: 'ice_bolt',
    name: '아이스 볼트',
    description: '빙결 마법으로 적을 공격합니다.',
    type: 'Active',
    theme: 'Frost',
    maxLevel: 5,
    mpCost: 20,
    effects: [
      { level: 1, damage: 100, triggerChance: 20 },
      { level: 2, damage: 125, triggerChance: 20 },
      { level: 3, damage: 150, triggerChance: 22 }
    ],
    trainingRules: [
      { event: 'cast', xpGain: 1 },
      { event: 'kill', xpGain: 5 },
      { event: 'killWeak', xpGain: 20 }
    ]
  }
}

const SkillModal: React.FC<SkillModalProps> = ({ skillId, isOpen, onClose }) => {
  const { skills } = useGameStore()
  
  const playerSkill = skills.activeSkills.find((s: any) => s.skillId === skillId) || 
                     skills.passiveSkills.find((s: any) => s.skillId === skillId)
  
  const skillData = skillDataMap[skillId]

  if (!isOpen || !playerSkill || !skillData) return null

  const currentEffect = skillData.effects?.find((e: any) => e.level === playerSkill.level) || skillData.effects?.[0]

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-dark-800 border border-gray-600 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{skillData.name} Lv.{playerSkill.level}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400">설명</div>
            <div className="text-white text-sm">{skillData.description}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">수련치</div>
            <div className="text-white">{playerSkill.experience} / {playerSkill.experienceNeeded} XP</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(playerSkill.experience / playerSkill.experienceNeeded) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">현재 효과 (Lv.{playerSkill.level})</div>
            <div className="text-white text-sm">
              {skillData.type === 'Active' && currentEffect && (
                <div>
                  {currentEffect.damage && `데미지: ${currentEffect.damage}`}
                  {currentEffect.triggerChance && ` | 발동확률: ${currentEffect.triggerChance}%`}
                  {skillData.mpCost && ` | MP: ${skillData.mpCost}`}
                </div>
              )}
              {skillData.type === 'Passive' && currentEffect && (
                <div>
                  {currentEffect.buff && `${currentEffect.buff.type} +${currentEffect.buff.value}%`}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">수련 방법</div>
            <div className="text-white text-sm">
              {skillData.trainingRules?.map((rule: any, index: number) => (
                <div key={index}>
                  • {rule.event === 'cast' ? '스킬 사용' : 
                     rule.event === 'kill' ? '적 처치' : 
                     rule.event === 'killWeak' ? '상성 적 처치' : rule.event}: +{rule.xpGain} XP
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ isOpen, onClose }) => {
  const gameStore = useGameStore()
  const player = gameStore.player
  const inventory = gameStore.inventory
  const skills = gameStore.skills
  
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'titles'>('info')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const handleSkillClick = (skillId: string) => {
    setSelectedSkill(skillId)
  }

  // 스킬 이름 가져오기
  const getSkillName = (skillId: string) => {
    return skillDataMap[skillId]?.name || skillId
  }

  // 스킬 발동확률 가져오기
  const getSkillTriggerChance = (skillId: string, level: number) => {
    const skillData = skillDataMap[skillId]
    const effect = skillData?.effects?.find((e: any) => e.level === level)
    return effect?.triggerChance || 0
  }

  return (
    <>
      <div className={`panel-slide-up ${isOpen ? 'open' : ''} fixed inset-x-0 bottom-16 h-[calc(100vh-80px-64px)] bg-dark-800 border-t border-gray-700 z-30`}>
        {/* 패널 헤더 - 고정 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-dark-800">
          <h2 className="text-lg font-bold text-white">캐릭터</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 탭 네비게이션 - 고정 */}
        <div className="flex border-b border-gray-700 bg-dark-800">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'info' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Info size={16} />
              <span>정보</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'skills' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sword size={16} />
              <span>스킬</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'titles' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Star size={16} />
              <span>칭호</span>
            </div>
          </button>
        </div>
        
        {/* 패널 내용 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px - 64px - 120px)' }}>
          {activeTab === 'info' && (
            <div className="p-4 space-y-4">
              {/* 캐릭터 스탯 */}
              <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  스탯 정보
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">레벨</span>
                      <span className="text-white font-semibold">{player.highestFloor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">HP</span>
                      <span className="text-red-400">{player.hp}/{player.maxHp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">MP</span>
                      <span className="text-blue-400">{player.mp}/{player.maxMp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">물리 공격력</span>
                      <span className="text-orange-400">{player.physicalAttack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">마법 공격력</span>
                      <span className="text-purple-400">{player.magicalAttack}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">물리 방어력</span>
                      <span className="text-green-400">{player.physicalDefense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">마법 방어력</span>
                      <span className="text-cyan-400">{player.magicalDefense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">크리티컬</span>
                      <span className="text-yellow-400">{player.critical}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">속도</span>
                      <span className="text-pink-400">{player.speed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">현재 AP</span>
                      <span className="text-white">{player.actionPoints} AP</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 장착된 장비 */}
              <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-md font-semibold text-white mb-4">장착된 장비</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* 무기 */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-400 mb-1">🗡️ 무기</div>
                    {player.equipment.weapon ? (
                      <div className={`bg-orange-900/30 border rounded p-3 ${getQualityColor(player.equipment.weapon.rarity)}`}>
                        <div className="font-semibold">
                          {player.equipment.weapon.itemId.replace('_', ' ')} +{player.equipment.weapon.enhancement}
                        </div>
                        <div className="text-xs text-gray-400">
                          Lv.{player.equipment.weapon.level} ({player.equipment.weapon.rarity})
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/30 border border-gray-700 rounded p-3 text-gray-500 text-center">
                        장착된 무기가 없습니다
                      </div>
                    )}
                  </div>
                  
                  {/* 방어구 */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-400 mb-1">🛡️ 방어구</div>
                    {player.equipment.armor ? (
                      <div className={`bg-blue-900/30 border rounded p-3 ${getQualityColor(player.equipment.armor.rarity)}`}>
                        <div className="font-semibold">
                          {player.equipment.armor.itemId.replace('_', ' ')} +{player.equipment.armor.enhancement}
                        </div>
                        <div className="text-xs text-gray-400">
                          Lv.{player.equipment.armor.level} ({player.equipment.armor.rarity})
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/30 border border-gray-700 rounded p-3 text-gray-500 text-center">
                        장착된 방어구가 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'skills' && (
            <div className="p-4 space-y-4">
              <h3 className="text-md font-semibold text-white mb-4">보유 스킬</h3>
              
              {/* 액티브 스킬 */}
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">액티브 스킬</h4>
                <div className="space-y-2">
                  {skills.activeSkills.map((skill: any) => (
                    <div 
                      key={skill.skillId}
                      onClick={() => handleSkillClick(skill.skillId)}
                      className="bg-dark-900 p-3 rounded border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-red-400 font-semibold">{getSkillName(skill.skillId)} Lv.{skill.level}</div>
                          <div className="text-xs text-gray-400">발동확률: {getSkillTriggerChance(skill.skillId, skill.level)}%</div>
                        </div>
                        <div className="text-xs text-yellow-400">{skill.experience}/{skill.experienceNeeded} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 패시브 스킬 */}
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">패시브 스킬</h4>
                <div className="space-y-2">
                  {skills.passiveSkills.map((skill: any) => (
                    <div 
                      key={skill.skillId}
                      onClick={() => handleSkillClick(skill.skillId)}
                      className="bg-dark-900 p-3 rounded border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-orange-400 font-semibold">{getSkillName(skill.skillId)} Lv.{skill.level}</div>
                          <div className="text-xs text-gray-400">지속 효과</div>
                        </div>
                        <div className="text-xs text-yellow-400">{skill.experience}/{skill.experienceNeeded} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'titles' && (
            <div className="p-4 space-y-4">
              <h3 className="text-md font-semibold text-white mb-4">획득한 칭호 (모든 효과 적용)</h3>
              
              <div className="space-y-2">
                <div className="bg-dark-900 p-3 rounded border border-yellow-600">
                  <div className="text-yellow-400 font-semibold">화염의 전사</div>
                  <div className="text-xs text-gray-400">화염 속성 데미지 +15%</div>
                  <div className="text-xs text-green-400 mt-1">✓ 효과 적용됨</div>
                </div>
                
                <div className="bg-dark-900 p-3 rounded border border-blue-600">
                  <div className="text-blue-400 font-semibold">초보 모험가</div>
                  <div className="text-xs text-gray-400">처음 10층 달성 시 획득 | HP +50</div>
                  <div className="text-xs text-green-400 mt-1">✓ 효과 적용됨</div>
                </div>
                
                <div className="bg-dark-900 p-3 rounded border border-orange-600">
                  <div className="text-orange-400 font-semibold">숙련된 제작자</div>
                  <div className="text-xs text-gray-400">제작 스킬 Lv.5 달성 시 획득 | 제작 성공률 +10%</div>
                  <div className="text-xs text-green-400 mt-1">✓ 효과 적용됨</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 스킬 상세 모달 */}
      <SkillModal 
        skillId={selectedSkill || ''} 
        isOpen={!!selectedSkill} 
        onClose={() => setSelectedSkill(null)} 
      />
    </>
  )
}

export default CharacterPanel 