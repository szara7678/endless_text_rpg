import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../../stores'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { CombatPhase } from '../../types'

const MainView: React.FC = () => {
  const { 
    tower, 
    player,
    startAutoCombat,
    stopAutoCombat,
    setAutoSpeed,
    clearCombatLog,
    addSkillTrainingXp,
    addSkillPage
  } = useGameStore()
  const logContainerRef = useRef<HTMLDivElement>(null)

  // 로그가 업데이트될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [tower?.combatLog])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'player_attack':
        return 'bg-blue-900/30 border-blue-500 text-blue-300'
      case 'monster_attack':
        return 'bg-red-900/30 border-red-500 text-red-300'
      case 'monster_skill':
        return 'bg-purple-900/30 border-purple-500 text-purple-300'
      case 'combat':
        return 'bg-yellow-900/30 border-yellow-500 text-yellow-300'
      case 'loot':
        return 'bg-green-900/30 border-green-500 text-green-300'
      case 'floor':
        return 'bg-cyan-900/30 border-cyan-500 text-cyan-300'
      case 'skill':
        return 'bg-purple-900/30 border-purple-500 text-purple-300'
      case 'death':
        return 'bg-red-900/50 border-red-400 text-red-200'
      default:
        return 'bg-gray-900/30 border-gray-500 text-gray-300'
    }
  }

  // 전투 상태 텍스트 가져오기
  const getCombatPhaseText = (phase: string) => {
    switch (phase) {
      case 'player_turn':
        return '플레이어 턴'
      case 'monster_turn':
        return '몬스터 턴'
      case 'waiting':
        return '턴 대기 중'
      case 'complete':
        return '전투 완료'
      default:
        return '알 수 없음'
    }
  }

  // 자동 전투 토글
  const handleToggleAuto = () => {
    if (tower.autoMode) {
      stopAutoCombat()
    } else {
      startAutoCombat(tower.autoSpeed || 1)
    }
  }

  // 속도 변경
  const handleSpeedChange = () => {
    const speeds = [1, 2, 3, 5]
    const currentIndex = speeds.indexOf(tower.autoSpeed || 1)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    
    // setAutoSpeed를 사용하여 일관된 방식으로 속도 변경
    setAutoSpeed(nextSpeed)
  }

  const handleClearLog = () => {
    clearCombatLog()
  }

  // 현재 층 몬스터 수 계산
  const getCurrentFloorMonsterInfo = () => {
    const currentFloor = tower.currentFloor
    const floorInCycle = currentFloor % 10
    const killCount = tower.monsterKillCount || 0
    
    let requiredKills = 0
    if (floorInCycle === 0) {
      // 휴식층: 즉시 다음 층으로
      return { current: 0, required: 0, text: '휴식층' }
    } else if (floorInCycle >= 1 && floorInCycle <= 5) {
      // 일반 몬스터층: 3마리 처치
      requiredKills = 3
    } else if (floorInCycle >= 6 && floorInCycle <= 8) {
      // 정예 몬스터층: 2마리 처치
      requiredKills = 2
    } else if (floorInCycle === 9) {
      // 보스층: 1마리 처치
      requiredKills = 1
    }
    
    return { 
      current: killCount, 
      required: requiredKills, 
      text: `${killCount}/${requiredKills}` 
    }
  }

  // 스킬 시스템 테스트용
  const handleAddSkillXp = () => {
    addSkillTrainingXp('basic_attack', 'cast', 10)
  }

  const handleAddSkillPage = () => {
    const skills = ['fireball', 'ice_shard', 'flame_aura', 'frost_bite', 'ember_toss']
    const randomSkill = skills[Math.floor(Math.random() * skills.length)]
    addSkillPage(randomSkill)
  }

  return (
    <div className="main-view h-full bg-gray-900 p-4">
      <div className="h-full bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col">
        


        {/* 전투 상황 및 자동 진행 컨트롤 */}
        {tower?.isInCombat && tower.currentMonster && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-red-300">
                ⚔️ {tower.currentMonster.name}
              </h3>
              <div className="text-sm text-gray-400">
                {player.highestFloor}층 ({getCurrentFloorMonsterInfo().text})
              </div>
            </div>
            
            {/* 몬스터 HP 바 */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">HP</span>
                <span className="text-red-400">
                  {tower.currentMonster.hp}/{tower.currentMonster.maxHp}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(tower.currentMonster.hp / tower.currentMonster.maxHp) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            {/* 자동 진행 컨트롤 */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleAuto}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  tower.autoMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {tower.autoMode ? '⏸️ 일시정지' : '▶️ 자동 전투'}
              </button>
              
              <button
                onClick={handleSpeedChange}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                ⚡ {tower.autoSpeed || 1}x
              </button>
            </div>
            
            {/* 전투 상태 표시 */}
            <div className="mt-2 text-center">
              <div className="inline-flex items-center gap-2 text-yellow-400 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  tower.combatState?.phase === 'player_turn' ? 'bg-blue-500' :
                  tower.combatState?.phase === 'monster_turn' ? 'bg-red-500' :
                  'bg-gray-500'
                } animate-pulse`}></div>
                <span>{getCombatPhaseText(tower.combatState?.phase || 'waiting')}</span>
              </div>
            </div>
            
            {/* 자동 진행 상태 표시 */}
            {tower.autoMode && (
              <div className="mt-2 text-center">
                <div className="inline-flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>자동 전투 진행 중... ({tower.autoSpeed || 1}x 속도)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 게임 로그 */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={logContainerRef}
            className="h-full overflow-y-auto space-y-2"
          >
            {tower?.combatLog && tower.combatLog.length > 0 ? (
              tower.combatLog.map((log: any) => (
                <div key={log.id} className={`p-3 border-l-4 rounded ${getLogStyle(log.type)}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">{log.message}</span>
                    <span className="text-xs opacity-75 ml-2 flex-shrink-0">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // 로딩 상태
              <div className="space-y-2">
                <div className="p-3 bg-blue-900/30 border-l-4 border-blue-500 rounded">
                  <div className="text-blue-300 font-semibold">🎮 게임 시작</div>
                  <div className="text-gray-300 text-sm mt-1">
                    무한 텍스트 RPG에 오신 것을 환영합니다!
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded">
                  <div className="text-yellow-300 font-semibold">⚡ 로딩 중</div>
                  <div className="text-gray-300 text-sm mt-1">
                    전투 시스템을 초기화하는 중입니다...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainView 