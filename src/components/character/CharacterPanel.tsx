import React, { useState } from 'react'
import { X, User, Shield, Zap, Award, Plus, ArrowUp, Star } from 'lucide-react'
import { useGameStore } from '../../stores'
import ItemDetailModal from '../common/ItemDetailModal'
import SkillDetailModal from '../common/SkillDetailModal'
import { loadItem } from '../../utils/dataLoader'
// import { canUnlockSkill, canLevelUpSkill, calculateLevelUpCost, formatSkillInfo } from '../../utils/skillSystem'

interface CharacterPanelProps {
  isOpen: boolean
  onClose: () => void
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ isOpen, onClose }) => {
  const { player, skills, unlockSkill, levelUpSkill, equipItem, unequipItem, enhanceEquipment } = useGameStore()
  const [activeTab, setActiveTab] = useState<'info' | 'equipment' | 'skills' | 'titles'>('info')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedSkill, setSelectedSkill] = useState<any>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)

  if (!isOpen) return null

  const handleItemClick = async (itemId: string) => {
    try {
      const itemData = await loadItem(itemId)
      if (itemData) {
        setSelectedItem(itemData)
        setShowItemModal(true)
      }
    } catch (error) {
      console.error('아이템 데이터 로드 실패:', error)
    }
  }

  const handleSkillClick = async (skillId: string) => {
    try {
      // 스킬 데이터를 직접 생성 (실제 스킬 데이터 로드 대신)
      const skillData = {
        skillId,
        name: skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        level: skills.activeSkills.find(s => s.skillId === skillId)?.level || 
               skills.passiveSkills.find(s => s.skillId === skillId)?.level || 1,
        triggerChance: skills.activeSkills.find(s => s.skillId === skillId)?.triggerChance || 
                      skills.passiveSkills.find(s => s.skillId === skillId)?.triggerChance || 10,
        currentXp: skills.activeSkills.find(s => s.skillId === skillId)?.currentXp || 
                  skills.passiveSkills.find(s => s.skillId === skillId)?.currentXp || 0,
        maxXp: skills.activeSkills.find(s => s.skillId === skillId)?.maxXp || 
              skills.passiveSkills.find(s => s.skillId === skillId)?.maxXp || 100
      }
      setSelectedSkill(skillData)
      setShowSkillModal(true)
    } catch (error) {
      console.error('스킬 데이터 로드 실패:', error)
    }
  }

  const handleUnlockSkill = (skillId: string) => {
    unlockSkill(skillId)
  }

  const handleLevelUpSkill = (skillId: string) => {
    levelUpSkill(skillId)
  }

  // 해금 가능한 스킬 목록
  const unlockableSkills = ['fireball', 'ice_shard', 'flame_aura', 'frost_bite', 'ember_toss']

  return (
    <>
      <div 
        className="fixed inset-x-0 bg-gray-800 border-t border-gray-700 z-20 flex flex-col"
        style={{ top: '64px', bottom: '64px' }}
      >
        {/* 패널 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">👤 캐릭터</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 구분 탭 */}
        <div className="flex border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User size={16} />
              <span>정보</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'equipment' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield size={16} />
              <span>장비</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'skills' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap size={16} />
              <span>스킬</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'titles' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Award size={16} />
              <span>칭호</span>
            </div>
          </button>
        </div>

        {/* 패널 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          <div className="pb-32">
            {activeTab === 'info' && (
              <div className="p-4 space-y-6">
                {/* 기본 정보 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-blue-400">📊 기본 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{player.highestFloor}F</div>
                      <div className="text-sm text-gray-400">최고 층수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{player.rebirthLevel}</div>
                      <div className="text-sm text-gray-400">환생 포인트 (AP)</div>
                    </div>
                  </div>
                </div>

                {/* 생명력 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-red-400">❤️ 생명력</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">HP</span>
                      <span className="text-red-400 font-mono">
                        {player.hp}/{player.maxHp}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">MP</span>
                      <span className="text-blue-400 font-mono">
                        {player.mp}/{player.maxMp}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 전투 스탯 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-orange-400">⚔️ 전투 스탯</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">물리 공격</div>
                      <div className="text-lg font-bold text-red-400">{player.physicalAttack}</div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">마법 공격</div>
                      <div className="text-lg font-bold text-blue-400">{player.magicalAttack}</div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">물리 방어</div>
                      <div className="text-lg font-bold text-green-400">{player.physicalDefense}</div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">마법 방어</div>
                      <div className="text-lg font-bold text-cyan-400">{player.magicalDefense}</div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">속도</div>
                      <div className="text-lg font-bold text-yellow-400">{player.speed}</div>
                    </div>
                  </div>
                </div>

                {/* 상성 스탯 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-purple-400">🔮 상성 스탯</h3>
                  <div className="space-y-3">
                    {/* 화염 */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium text-red-400">화염</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">공격력</div>
                          <div className="text-red-400 font-bold">{player.elementalStats?.flame?.attack || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">저항력</div>
                          <div className="text-red-300 font-bold">{player.elementalStats?.flame?.resistance || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* 빙결 */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-blue-400">빙결</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">공격력</div>
                          <div className="text-blue-400 font-bold">{player.elementalStats?.frost?.attack || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">저항력</div>
                          <div className="text-blue-300 font-bold">{player.elementalStats?.frost?.resistance || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* 독성 */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-400">독성</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">공격력</div>
                          <div className="text-green-400 font-bold">{player.elementalStats?.toxic?.attack || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">저항력</div>
                          <div className="text-green-300 font-bold">{player.elementalStats?.toxic?.resistance || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* 암흑 */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span className="text-sm font-medium text-gray-400">암흑</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">공격력</div>
                          <div className="text-gray-400 font-bold">{player.elementalStats?.shadow?.attack || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">저항력</div>
                          <div className="text-gray-300 font-bold">{player.elementalStats?.shadow?.resistance || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* 번개 */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm font-medium text-yellow-400">번개</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">공격력</div>
                          <div className="text-yellow-400 font-bold">{player.elementalStats?.thunder?.attack || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">저항력</div>
                          <div className="text-yellow-300 font-bold">{player.elementalStats?.thunder?.resistance || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* 자연 */}
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-sm font-medium text-emerald-400">자연</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">공격력</div>
                          <div className="text-emerald-400 font-bold">{player.elementalStats?.verdant?.attack || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">저항력</div>
                          <div className="text-emerald-300 font-bold">{player.elementalStats?.verdant?.resistance || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="p-4 space-y-6">
                {/* 장비 상세 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-orange-400">🛡️ 착용 중인 장비</h3>
                  <div className="space-y-3">
                    <div 
                      className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => player.equipment.weapon && handleItemClick(player.equipment.weapon.itemId)}
                    >
                      <div className="text-sm text-gray-400 mb-1">무기</div>
                      {player.equipment.weapon ? (
                        <div>
                          <div className="font-medium text-white">{player.equipment.weapon.itemId}</div>
                          <div className="text-sm text-gray-400">
                            레벨 {player.equipment.weapon.level} | +{player.equipment.weapon.enhancement}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">착용 중인 무기가 없습니다</div>
                      )}
                    </div>
                    
                    <div 
                      className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => player.equipment.armor && handleItemClick(player.equipment.armor.itemId)}
                    >
                      <div className="text-sm text-gray-400 mb-1">방어구</div>
                      {player.equipment.armor ? (
                        <div>
                          <div className="font-medium text-white">{player.equipment.armor.itemId}</div>
                          <div className="text-sm text-gray-400">
                            레벨 {player.equipment.armor.level} | +{player.equipment.armor.enhancement}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">착용 중인 방어구가 없습니다</div>
                      )}
                    </div>
                    
                    <div 
                      className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => player.equipment.accessory && handleItemClick(player.equipment.accessory.itemId)}
                    >
                      <div className="text-sm text-gray-400 mb-1">액세서리</div>
                      {player.equipment.accessory ? (
                        <div>
                          <div className="font-medium text-white">{player.equipment.accessory.itemId}</div>
                          <div className="text-sm text-gray-400">
                            레벨 {player.equipment.accessory.level} | +{player.equipment.accessory.enhancement}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">착용 중인 액세서리가 없습니다</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 장비 효과 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-green-400">✨ 장비 효과</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 물리 공격</div>
                      <div className="text-lg font-bold text-red-400">
                        +{player.physicalAttack - player.basePhysicalAttack}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 물리 방어</div>
                      <div className="text-lg font-bold text-green-400">
                        +{player.physicalDefense - player.basePhysicalDefense}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 마법 공격</div>
                      <div className="text-lg font-bold text-blue-400">
                        +{player.magicalAttack - player.baseMagicalAttack}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 마법 방어</div>
                      <div className="text-lg font-bold text-cyan-400">
                        +{player.magicalDefense - player.baseMagicalDefense}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="p-4 space-y-6">
                {/* 보유 액티브 스킬 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-purple-400">⚡ 액티브 스킬</h3>
                  <div className="space-y-2">
                    {skills.activeSkills.length > 0 ? skills.activeSkills.map((skill) => {
                      // 임시로 직접 계산
                      const skillInfo = {
                        name: skill.skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        level: `Lv ${skill.level}`,
                        progress: `${skill.currentXp || 0}/${skill.maxXp || 0}`,
                      }
                      const levelUpCost = { apCost: 1, goldCost: Math.floor(100 * Math.pow(1.5, skill.level - 1)) }
                      const canLevel = { canLevel: (skill.currentXp || 0) >= (skill.maxXp || 0) && player.rebirthLevel >= 1 && player.gold >= levelUpCost.goldCost }
                      
                      return (
                        <div 
                          key={skill.skillId} 
                          className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => handleSkillClick(skill.skillId)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-white">{skillInfo.name}</div>
                              <div className="text-sm text-gray-400">{skillInfo.level}</div>
                            </div>
                            {canLevel.canLevel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLevelUpSkill(skill.skillId)
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <ArrowUp size={12} />
                                레벨업
                              </button>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-2">
                            경험치: {skillInfo.progress}
                          </div>
                          
                          <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                            <div 
                              className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${skill.maxXp ? ((skill.currentXp || 0) / skill.maxXp) * 100 : 0}%` }}
                            />
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            다음 레벨업: AP {levelUpCost.apCost}, 골드 {levelUpCost.goldCost}
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-gray-500 text-center py-4">
                        보유한 액티브 스킬이 없습니다
                      </div>
                    )}
                  </div>
                </div>

                {/* 보유 패시브 스킬 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-blue-400">🔮 패시브 스킬</h3>
                  <div className="space-y-2">
                    {skills.passiveSkills.length > 0 ? skills.passiveSkills.map((skill) => {
                      // 임시로 직접 계산
                      const skillInfo = {
                        name: skill.skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        level: `Lv ${skill.level}`,
                        progress: `${skill.currentXp || 0}/${skill.maxXp || 0}`,
                      }
                      const levelUpCost = { apCost: 1, goldCost: Math.floor(100 * Math.pow(1.5, skill.level - 1)) }
                      const canLevel = { canLevel: (skill.currentXp || 0) >= (skill.maxXp || 0) && player.rebirthLevel >= 1 && player.gold >= levelUpCost.goldCost }
                      
                      return (
                        <div 
                          key={skill.skillId} 
                          className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => handleSkillClick(skill.skillId)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-white">{skillInfo.name}</div>
                              <div className="text-sm text-gray-400">{skillInfo.level}</div>
                            </div>
                            {canLevel.canLevel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLevelUpSkill(skill.skillId)
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <ArrowUp size={12} />
                                레벨업
                              </button>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-2">
                            경험치: {skillInfo.progress}
                          </div>
                          
                          <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${skill.maxXp ? ((skill.currentXp || 0) / skill.maxXp) * 100 : 0}%` }}
                            />
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            다음 레벨업: AP {levelUpCost.apCost}, 골드 {levelUpCost.goldCost}
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-gray-500 text-center py-4">
                        보유한 패시브 스킬이 없습니다
                      </div>
                    )}
                  </div>
                </div>

                {/* 스킬 해금 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-yellow-400">📜 스킬 해금</h3>
                  <div className="space-y-2">
                    {unlockableSkills.map((skillId) => {
                      const pageCount = skills.pagesOwned[skillId] || 0
                      const canUnlock = pageCount >= 3 // 직접 계산
                      const alreadyOwned = skills.activeSkills.some(s => s.skillId === skillId) ||
                                         skills.passiveSkills.some(s => s.skillId === skillId)
                      
                      return (
                        <div key={skillId} className="bg-gray-800 rounded p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-white">
                                {skillId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                              <div className="text-sm text-gray-400">
                                페이지: {pageCount}/3
                                {alreadyOwned && <span className="text-green-400 ml-2">(보유 중)</span>}
                              </div>
                            </div>
                            
                            {canUnlock && !alreadyOwned ? (
                              <button
                                onClick={() => handleUnlockSkill(skillId)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                              >
                                <Plus size={14} />
                                해금
                              </button>
                            ) : (
                              <div className="text-xs text-gray-500">
                                {alreadyOwned ? '보유 중' : `${3 - pageCount}페이지 필요`}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'titles' && (
              <div className="p-4 space-y-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-yellow-400">🏆 획득한 칭호</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded p-3 border-l-4 border-yellow-500">
                      <div className="font-semibold text-yellow-400">🔥 화염의 탐험가</div>
                      <div className="text-sm text-gray-400">화염 몬스터 10마리 처치</div>
                      <div className="text-sm text-green-400 mt-1">효과: 화염 피해 +5%</div>
                    </div>
                    <div className="bg-gray-800 rounded p-3 border-l-4 border-blue-500">
                      <div className="font-semibold text-blue-400">🗼 초보 등반가</div>
                      <div className="text-sm text-gray-400">5층 달성</div>
                      <div className="text-sm text-green-400 mt-1">효과: HP +10</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 아이템 상세 모달 */}
      <ItemDetailModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        item={selectedItem}
      />

      {/* 스킬 상세 모달 */}
      <SkillDetailModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        skill={selectedSkill}
      />
    </>
  )
}

export default CharacterPanel 