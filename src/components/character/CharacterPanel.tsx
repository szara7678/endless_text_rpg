import React, { useState } from 'react'
import { X, User, Shield, Zap, Award, Plus, ArrowUp, Star } from 'lucide-react'
import { useGameStore } from '../../stores'
import ItemDetailModal from '../common/ItemDetailModal'
import SkillDetailModal from '../common/SkillDetailModal'
import { loadItem } from '../../utils/dataLoader'
import { calculateLevelUpCost } from '../../utils/skillSystem'

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
  const [skillFilter, setSkillFilter] = useState('all')
  const [selectedElement, setSelectedElement] = useState('All')
  const [allSkills, setAllSkills] = useState<any[]>([])

  if (!isOpen) return null

  const handleItemClick = async (itemId: string, equipment?: any) => {
    try {
      if (equipment) {
        // 장착된 장비 정보를 사용
        setSelectedItem(equipment)
        setShowItemModal(true)
      } else {
        // 기본 아이템 데이터 로드
        const itemData = await loadItem(itemId)
        if (itemData) {
          setSelectedItem(itemData)
          setShowItemModal(true)
        }
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

  const handleLevelUpSkill = async (skillId: string) => {
    // AP를 사용하여 스킬 레벨업
    const learnedSkill = [...skills.activeSkills, ...skills.passiveSkills].find(s => s.skillId === skillId)
    if (learnedSkill) {
      try {
        const skillData = await import(`../../data/skills/${skillId}.json`)
        const apCost = calculateLevelUpCost(skillData.default, learnedSkill.level)
        
        if (player.rebirthLevel >= apCost) {
          // 스킬 레벨업 실행 (AP 차감은 levelUpSkill 함수 내에서 처리)
          const currentState = useGameStore.getState()
          currentState.levelUpSkill(skillId)
          
          console.log(`✅ ${skillId} 레벨업 완료! AP ${apCost} 소모`)
        } else {
          console.log('AP 부족:', player.rebirthLevel, '필요:', apCost)
        }
      } catch (error) {
        console.error('스킬 레벨업 실패:', error)
      }
    }
  }

  // 모든 스킬 목록 로드
  React.useEffect(() => {
    const loadAllSkills = async () => {
      try {
        const skillIds = [
          'basic_attack', 'fireball', 'ice_shard', 'flame_aura', 'frost_bite', 'ember_toss',
          'thunder_shock', 'thunder_roar', 'shadow_bite', 'dark_howl', 'toxic_spit', 'venom_burst',
          'nature_blessing', 'verdant_charge'
        ]
        
        const loadedSkills = []
        for (const skillId of skillIds) {
          try {
            const skillData = await import(`../../data/skills/${skillId}.json`)
            if (skillData.default) {
              loadedSkills.push(skillData.default)
            }
          } catch (error) {
            console.error(`스킬 로드 실패: ${skillId}`, error)
          }
        }
        setAllSkills(loadedSkills)
      } catch (error) {
        console.error('스킬 목록 로드 실패:', error)
      }
    }
    loadAllSkills()
  }, [])

  // 스킬 필터링
  const filteredSkills = React.useMemo(() => {
    if (!allSkills.length) return []
    
    let filtered = allSkills
    
    // 필터 적용
    if (skillFilter === 'learned') {
      filtered = filtered.filter(skill => 
        skills.activeSkills.some(s => s.skillId === skill.skillId) || 
        skills.passiveSkills.some(s => s.skillId === skill.skillId)
      )
    } else if (skillFilter === 'unlearned') {
      filtered = filtered.filter(skill => 
        !skills.activeSkills.some(s => s.skillId === skill.skillId) && 
        !skills.passiveSkills.some(s => s.skillId === skill.skillId)
      )
    }
    
    // 속성 필터 적용 (모든 탭에서 사용 가능)
    if (selectedElement && selectedElement !== 'All') {
      filtered = filtered.filter(skill => skill.element === selectedElement)
    }
    
    // 습득한 스킬을 위로 정렬
    filtered.sort((a, b) => {
      const aLearned = skills.activeSkills.some(s => s.skillId === a.skillId) || 
                       skills.passiveSkills.some(s => s.skillId === a.skillId)
      const bLearned = skills.activeSkills.some(s => s.skillId === b.skillId) || 
                       skills.passiveSkills.some(s => s.skillId === b.skillId)
      
      if (aLearned && !bLearned) return -1
      if (!aLearned && bLearned) return 1
      return 0
    })
    
    return filtered
  }, [allSkills, skillFilter, selectedElement, skills])

  const baseHp = player.baseMaxHp ?? 100;
  const baseMp = player.baseMaxMp ?? 50;
  const formatStat = (value: number) => value > 0 ? `+${value}` : value < 0 ? `${value}` : '0';

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
                      {player.foodStats?.physicalAttack > 0 && (
                        <div className="text-xs text-green-400">🍽️ +{player.foodStats.physicalAttack}</div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">마법 공격</div>
                      <div className="text-lg font-bold text-blue-400">{player.magicalAttack}</div>
                      {player.foodStats?.magicalAttack > 0 && (
                        <div className="text-xs text-green-400">🍽️ +{player.foodStats.magicalAttack}</div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">물리 방어</div>
                      <div className="text-lg font-bold text-green-400">{player.physicalDefense}</div>
                      {player.foodStats?.physicalDefense > 0 && (
                        <div className="text-xs text-green-400">🍽️ +{player.foodStats.physicalDefense}</div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">마법 방어</div>
                      <div className="text-lg font-bold text-cyan-400">{player.magicalDefense}</div>
                      {player.foodStats?.magicalDefense > 0 && (
                        <div className="text-xs text-green-400">🍽️ +{player.foodStats.magicalDefense}</div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">속도</div>
                      <div className="text-lg font-bold text-yellow-400">{player.speed}</div>
                      {player.foodStats?.speed > 0 && (
                        <div className="text-xs text-green-400">🍽️ +{player.foodStats.speed}</div>
                      )}
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
                      onClick={() => player.equipment.weapon && handleItemClick(player.equipment.weapon.itemId, player.equipment.weapon)}
                    >
                      <div className="text-sm text-gray-400 mb-1">무기</div>
                      {player.equipment.weapon ? (
                        <div>
                          <div className="font-medium text-white">
                            {player.equipment.weapon.itemId?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-400">
                            Lv {player.equipment.weapon.level || 1} | {player.equipment.weapon.quality || 'Common'} +{player.equipment.weapon.enhancement || 0}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">착용 중인 무기가 없습니다</div>
                      )}
                    </div>
                    
                    <div 
                      className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => player.equipment.armor && handleItemClick(player.equipment.armor.itemId, player.equipment.armor)}
                    >
                      <div className="text-sm text-gray-400 mb-1">방어구</div>
                      {player.equipment.armor ? (
                        <div>
                          <div className="font-medium text-white">
                            {player.equipment.armor.itemId?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-400">
                            Lv {player.equipment.armor.level || 1} | {player.equipment.armor.quality || 'Common'} +{player.equipment.armor.enhancement || 0}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">착용 중인 방어구가 없습니다</div>
                      )}
                    </div>
                    
                    <div 
                      className="bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => player.equipment.accessory && handleItemClick(player.equipment.accessory.itemId, player.equipment.accessory)}
                    >
                      <div className="text-sm text-gray-400 mb-1">액세서리</div>
                      {player.equipment.accessory ? (
                        <div>
                          <div className="font-medium text-white">
                            {player.equipment.accessory.itemId?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-400">
                            Lv {player.equipment.accessory.level || 1} | {player.equipment.accessory.quality || 'Common'} +{player.equipment.accessory.enhancement || 0}
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
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 HP</div>
                      <div className="text-lg font-bold text-red-300">
                        {formatStat(player.maxHp - baseHp)}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 MP</div>
                      <div className="text-lg font-bold text-blue-300">
                        {formatStat(player.maxMp - baseMp)}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">장비 속도</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {formatStat(player.speed - player.baseSpeed)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 속성별 장비 효과 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-purple-400">🔥 속성별 장비 효과</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">화염 공격</div>
                      <div className="text-lg font-bold text-red-400">
                        +{player.elementalStats?.flame?.attack || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">화염 저항</div>
                      <div className="text-lg font-bold text-red-300">
                        +{player.elementalStats?.flame?.resistance || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">빙결 공격</div>
                      <div className="text-lg font-bold text-blue-400">
                        +{player.elementalStats?.frost?.attack || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">빙결 저항</div>
                      <div className="text-lg font-bold text-blue-300">
                        +{player.elementalStats?.frost?.resistance || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">독성 공격</div>
                      <div className="text-lg font-bold text-green-400">
                        +{player.elementalStats?.toxic?.attack || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">독성 저항</div>
                      <div className="text-lg font-bold text-green-300">
                        +{player.elementalStats?.toxic?.resistance || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">암흑 공격</div>
                      <div className="text-lg font-bold text-gray-400">
                        +{player.elementalStats?.shadow?.attack || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">암흑 저항</div>
                      <div className="text-lg font-bold text-gray-300">
                        +{player.elementalStats?.shadow?.resistance || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">번개 공격</div>
                      <div className="text-lg font-bold text-yellow-400">
                        +{player.elementalStats?.thunder?.attack || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">번개 저항</div>
                      <div className="text-lg font-bold text-yellow-300">
                        +{player.elementalStats?.thunder?.resistance || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">자연 공격</div>
                      <div className="text-lg font-bold text-emerald-400">
                        +{player.elementalStats?.verdant?.attack || 0}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-sm text-gray-400">자연 저항</div>
                      <div className="text-lg font-bold text-emerald-300">
                        +{player.elementalStats?.verdant?.resistance || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="p-4 space-y-6">
                {/* 스킬 필터 탭 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setSkillFilter('all')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        skillFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      모든 스킬
                    </button>
                    <button
                      onClick={() => setSkillFilter('learned')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        skillFilter === 'learned' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      습득한 스킬
                    </button>
                    <button
                      onClick={() => setSkillFilter('unlearned')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        skillFilter === 'unlearned' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      미습득 스킬
                    </button>
                  </div>

                  {/* 속성별 필터 (모든 탭에서 사용 가능) */}
                  <div className="flex space-x-1 mb-4">
                    {[
                      { element: 'All', emoji: '🌟', color: 'text-yellow-400' },
                      { element: 'Flame', emoji: '🔥', color: 'text-red-400' },
                      { element: 'Frost', emoji: '❄️', color: 'text-blue-400' },
                      { element: 'Thunder', emoji: '⚡', color: 'text-yellow-400' },
                      { element: 'Toxic', emoji: '☠️', color: 'text-green-400' },
                      { element: 'Shadow', emoji: '🌑', color: 'text-purple-400' },
                      { element: 'Verdant', emoji: '🌿', color: 'text-emerald-400' },
                      { element: 'Physical', emoji: '⚔️', color: 'text-gray-400' }
                    ].map(({ element, emoji, color }) => (
                      <button
                        key={element}
                        onClick={() => setSelectedElement(element)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                          selectedElement === element 
                            ? 'bg-gray-700 text-white border border-gray-500' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-sm">{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 스킬 목록 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-purple-400">⚡ 스킬 목록</h3>
                  <div className="space-y-2">
                    {filteredSkills.length > 0 ? filteredSkills.map((skill) => {
                      const isLearned = skills.activeSkills.some(s => s.skillId === skill.skillId) || 
                                      skills.passiveSkills.some(s => s.skillId === skill.skillId)
                      const learnedSkill = isLearned ? 
                        [...skills.activeSkills, ...skills.passiveSkills].find(s => s.skillId === skill.skillId) : null
                      
                      const skillInfo = {
                        name: skill.name,
                        level: learnedSkill ? `Lv ${learnedSkill.level}` : '미습득',
                        progress: learnedSkill ? `${learnedSkill.currentXp || 0}/${learnedSkill.maxXp || 100}` : '',
                        type: skill.type,
                        element: skill.element,
                        requiredPages: skill.requiredPages || 0
                      }
                      
                      const levelUpCost = learnedSkill ? { 
                        apCost: (() => {
                          try {
                            const skillData = require(`../../data/skills/${skill.skillId}.json`)
                            return calculateLevelUpCost(skillData, learnedSkill.level)
                          } catch {
                            return 1
                          }
                        })(),
                        goldCost: 0 // 골드 제거
                      } : null
                      
                      const canLevel = learnedSkill && levelUpCost ? { 
                        canLevel: (learnedSkill.currentXp || 0) >= (learnedSkill.maxXp || 0) && 
                                 player.rebirthLevel >= levelUpCost.apCost &&
                                 skill.skillId !== 'basic_attack'
                      } : { canLevel: false }
                      
                                             const canUnlock = !isLearned && (skills.pagesOwned[skill.skillId] || 0) >= skillInfo.requiredPages
                      
                      return (
                        <div 
                          key={skill.skillId} 
                          className={`relative bg-gray-800 rounded p-3 cursor-pointer hover:bg-gray-700 transition-colors ${
                            !isLearned ? 'border-l-4 border-yellow-500' : ''
                          }`}
                          onClick={() => handleSkillClick(skill.skillId)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-white">{skillInfo.name}</div>
                              <div className="text-sm text-gray-400">
                                {skillInfo.level} • {skillInfo.type} • {skillInfo.element}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!isLearned && canUnlock && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUnlockSkill(skill.skillId)
                                  }}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                >
                                  해금
                                </button>
                              )}
                              {learnedSkill && skill.skillId !== 'basic_attack' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (canLevel.canLevel) {
                                      handleLevelUpSkill(skill.skillId)
                                    }
                                  }}
                                  disabled={!canLevel.canLevel}
                                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs flex items-center gap-1 ${
                                    canLevel.canLevel 
                                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <ArrowUp size={12} />
                                  레벨업
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {learnedSkill && (
                            <>
                              <div className="text-xs text-gray-400 mb-2">
                                경험치: {skillInfo.progress}
                              </div>
                              
                              <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                                <div 
                                  className={`h-1 rounded-full transition-all duration-300 ${
                                    skillInfo.type === 'Active' ? 'bg-purple-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${((learnedSkill.currentXp || 0) / (learnedSkill.maxXp || 100)) * 100}%` }}
                                />
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                다음 레벨업: AP {levelUpCost?.apCost || 0}
                              </div>
                            </>
                          )}
                          
                          {!isLearned && (
                            <div className="text-xs text-gray-500">
                              필요 스킬 페이지: {skillInfo.requiredPages}개
                            </div>
                          )}
                        </div>
                      )
                    }) : (
                      <div className="text-gray-500 text-center py-4">
                        해당하는 스킬이 없습니다
                      </div>
                    )}
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