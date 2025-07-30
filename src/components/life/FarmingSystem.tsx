import React, { useState, useEffect } from 'react'
import { X, Sprout, Droplets, Scissors, Clock, Plus } from 'lucide-react'
import { useGameStore } from '../../stores'

interface FarmingSystemProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (success: boolean, rewards: any) => void
}

interface Crop {
  id: string
  name: string
  seedName: string
  growthTime: number // 밀리초
  waterInterval: number // 물주기 간격 (밀리초)
  harvestReward: { materialId: string, quantity: number }[]
  emoji: string
}

interface PlantedCrop {
  id: string
  cropId: string
  plantedAt: number
  lastWatered: number
  waterCount: number
  requiredWater: number
  harvestReady: boolean
}

const CROPS: Crop[] = [
  {
    id: 'red_herb_seed',
    name: '빨간 허브',
    seedName: '빨간 허브 씨앗',
    growthTime: 60000, // 1분
    waterInterval: 20000, // 20초마다 물주기
    harvestReward: [{ materialId: 'red_herb', quantity: 3 }],
    emoji: '🌹'
  },
  {
    id: 'blue_herb_seed',
    name: '파란 허브',
    seedName: '파란 허브 씨앗',
    growthTime: 90000, // 1.5분
    waterInterval: 30000, // 30초마다 물주기
    harvestReward: [{ materialId: 'blue_herb', quantity: 2 }],
    emoji: '💙'
  },
  {
    id: 'wheat_seed',
    name: '밀',
    seedName: '밀 씨앗',
    growthTime: 120000, // 2분
    waterInterval: 40000, // 40초마다 물주기
    harvestReward: [{ materialId: 'wheat', quantity: 5 }],
    emoji: '🌾'
  }
]

const FarmingSystem: React.FC<FarmingSystemProps> = ({ isOpen, onClose, onComplete }) => {
  const { saveGame } = useGameStore()
  const [plantedCrops, setPlantedCrops] = useState<PlantedCrop[]>([])
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // 1초마다 시간 업데이트
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isOpen])

  // 농장 플롯 개수 (4x2 = 8개)
  const FARM_PLOTS = 8

  // 씨앗 심기
  const plantSeed = (plotIndex: number) => {
    if (!selectedSeed || plantedCrops.find(crop => crop.id === `plot_${plotIndex}`)) return
    
    const crop = CROPS.find(c => c.id === selectedSeed)
    if (!crop) return

    const newCrop: PlantedCrop = {
      id: `plot_${plotIndex}`,
      cropId: selectedSeed,
      plantedAt: currentTime,
      lastWatered: currentTime,
      waterCount: 1, // 심을 때 자동으로 첫 물주기
      requiredWater: Math.ceil(crop.growthTime / crop.waterInterval),
      harvestReady: false
    }

    setPlantedCrops(prev => [...prev, newCrop])
    setSelectedSeed(null)
    
    // 씨앗 심기 후 게임 저장
    saveGame()
  }

  // 물주기
  const waterCrop = (plotId: string) => {
    setPlantedCrops(prev => prev.map(crop => {
      if (crop.id === plotId) {
        const now = currentTime
        const timeSinceLastWater = now - crop.lastWatered
        const cropData = CROPS.find(c => c.id === crop.cropId)
        
        if (cropData && timeSinceLastWater >= cropData.waterInterval) {
          return {
            ...crop,
            lastWatered: now,
            waterCount: crop.waterCount + 1
          }
        }
      }
      return crop
    }))
    
    // 물주기 후 게임 저장
    saveGame()
  }

  // 수확하기
  const harvestCrop = (plotId: string) => {
    const crop = plantedCrops.find(c => c.id === plotId)
    if (!crop || !isCropReady(crop)) return

    const cropData = CROPS.find(c => c.id === crop.cropId)
    if (cropData) {
      // 보상을 인벤토리에 직접 추가 (onComplete 호출하지 않음)
      // TODO: 실제 보상 지급 로직 구현
      
      // 작물 제거
      setPlantedCrops(prev => prev.filter(c => c.id !== plotId))
      
      // 수확 후 게임 저장
      saveGame()
      
      console.log(`${cropData.name} 수확 완료!`, cropData.harvestReward)
    }
  }

  // 작물 성장 상태 확인
  const getCropStatus = (crop: PlantedCrop) => {
    const cropData = CROPS.find(c => c.id === crop.cropId)
    if (!cropData) return { stage: 'unknown', progress: 0, needsWater: false, canHarvest: false }

    const timeSincePlanted = currentTime - crop.plantedAt
    const timeSinceLastWater = currentTime - crop.lastWatered
    const growthProgress = Math.min(timeSincePlanted / cropData.growthTime, 1)
    
    const needsWater = timeSinceLastWater >= cropData.waterInterval && crop.waterCount < crop.requiredWater
    const hasEnoughWater = crop.waterCount >= crop.requiredWater
    const canHarvest = growthProgress >= 1 && hasEnoughWater

    let stage = 'seed'
    if (growthProgress >= 0.25) stage = 'sprout'
    if (growthProgress >= 0.5) stage = 'growing'
    if (growthProgress >= 0.75) stage = 'mature'
    if (canHarvest) stage = 'ready'

    return { stage, progress: growthProgress * 100, needsWater, canHarvest }
  }

  const isCropReady = (crop: PlantedCrop) => {
    return getCropStatus(crop).canHarvest
  }

  // 시간 포맷팅
  const formatTime = (milliseconds: number) => {
    const seconds = Math.ceil(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${remainingSeconds}초`
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sprout className="text-green-400" size={24} />
            농사 시스템
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 씨앗 선택 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">씨앗 선택</h3>
            <div className="grid grid-cols-3 gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedSeed(selectedSeed === crop.id ? null : crop.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSeed === crop.id
                      ? 'border-green-400 bg-green-900/30'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{crop.emoji}</div>
                  <div className="text-xs text-white font-medium">{crop.seedName}</div>
                  <div className="text-xs text-gray-400">성장: {formatTime(crop.growthTime)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 농장 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">농장 (4x2)</h3>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: FARM_PLOTS }, (_, index) => {
                const plotId = `plot_${index}`
                const crop = plantedCrops.find(c => c.id === plotId)
                const cropData = crop ? CROPS.find(c => c.id === crop.cropId) : null
                const status = crop ? getCropStatus(crop) : null

                return (
                  <div
                    key={plotId}
                    className="aspect-square bg-amber-900 rounded-lg border-2 border-amber-700 p-2 flex flex-col items-center justify-center relative cursor-pointer hover:border-amber-600 transition-colors"
                    onClick={() => {
                      if (!crop && selectedSeed) {
                        plantSeed(index)
                      }
                    }}
                  >
                    {crop && cropData && status ? (
                      <>
                        {/* 작물 표시 */}
                        <div className="text-2xl mb-1">
                          {status.stage === 'seed' && '🌱'}
                          {status.stage === 'sprout' && '🌿'}
                          {status.stage === 'growing' && '🌾'}
                          {status.stage === 'mature' && cropData.emoji}
                          {status.stage === 'ready' && `✨${cropData.emoji}`}
                        </div>
                        
                        {/* 진행도 바 */}
                        <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                          <div
                            className="h-1 rounded-full bg-green-500 transition-all duration-1000"
                            style={{ width: `${status.progress}%` }}
                          />
                        </div>
                        
                        {/* 상태 표시 */}
                        <div className="text-xs text-center">
                          {status.canHarvest ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                harvestCrop(plotId)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            >
                              <Scissors size={12} className="inline mr-1" />
                              수확
                            </button>
                          ) : status.needsWater ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                waterCrop(plotId)
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                            >
                              <Droplets size={12} className="inline mr-1" />
                              물주기
                            </button>
                          ) : (
                            <div className="text-gray-400 flex items-center gap-1">
                              <Clock size={10} />
                              <span>성장중</span>
                            </div>
                          )}
                        </div>
                        
                        {/* 물주기 상태 */}
                        <div className="absolute top-1 right-1 text-xs">
                          {'💧'.repeat(crop.waterCount)} 
                          {'⭕'.repeat(Math.max(0, crop.requiredWater - crop.waterCount))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 빈 농장 */}
                                                 <Plus size={24} className="text-amber-600 mb-1" />
                        <div className="text-xs text-amber-400">
                          {selectedSeed ? '클릭하여 심기' : '씨앗을 선택하세요'}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 안내 */}
          <div className="text-center text-gray-400">
            <p className="text-sm mb-2">
              🌱 씨앗을 선택하고 빈 농장에 클릭하여 심으세요
            </p>
            <p className="text-xs">
              💧 정기적으로 물을 주고 시간이 지나면 수확할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmingSystem 