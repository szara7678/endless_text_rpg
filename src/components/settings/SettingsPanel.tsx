import React, { useState } from 'react'
import { X, Settings, Home, Zap, Heart, Droplets } from 'lucide-react'
import { useGameStore } from '../../stores'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updatePotionSettings, resetToMenu } = useGameStore()
  const [activeTab, setActiveTab] = useState<'general' | 'potion'>('general')

  if (!isOpen) return null

  const handlePotionSettingChange = (key: string, value: any) => {
    updatePotionSettings({ [key]: value })
  }

  const handleResetToMenu = () => {
    if (confirm('정말로 메인 메뉴로 돌아가시겠습니까? 현재 진행 상황이 저장되지 않을 수 있습니다.')) {
      resetToMenu()
    }
  }

  return (
    <>
      <div 
        className="fixed inset-x-0 bg-gray-800 border-t border-gray-700 z-20 flex flex-col"
        style={{ top: '64px', bottom: '64px' }}
      >
        {/* 패널 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">⚙️ 설정</h2>
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
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'general' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings size={16} />
              <span>일반</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('potion')}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'potion' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap size={16} />
              <span>물약</span>
            </div>
          </button>
        </div>

        {/* 패널 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          <div className="pb-32">
            {activeTab === 'general' && (
              <div className="p-4 space-y-6">
                {/* 메인 메뉴로 돌아가기 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-red-400">🏠 게임 메뉴</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleResetToMenu}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Home size={20} />
                      <span>메인 메뉴로 돌아가기</span>
                    </button>
                    <div className="text-sm text-gray-400 text-center">
                      ⚠️ 현재 진행 상황이 저장되지 않을 수 있습니다
                    </div>
                  </div>
                </div>

                {/* 게임 정보 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-blue-400">ℹ️ 게임 정보</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>게임 버전: 1.0.0</div>
                    <div>개발자: Endless Text RPG Team</div>
                    <div>최종 업데이트: 2024년 12월</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'potion' && (
              <div className="p-4 space-y-6">
                {/* 자동 물약 사용 설정 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-green-400">🧪 자동 물약 사용</h3>
                  <div className="space-y-4">
                    {/* 자동 사용 활성화 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" />
                        <span className="text-gray-300">자동 물약 사용</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.potionSettings.autoUseEnabled}
                          onChange={(e) => handlePotionSettingChange('autoUseEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* HP 임계값 설정 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="text-red-400" />
                        <span className="text-gray-300">HP 자동 사용 임계값</span>
                        <span className="text-blue-400 font-mono">{settings.potionSettings.hpThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={settings.potionSettings.hpThreshold}
                        onChange={(e) => handlePotionSettingChange('hpThreshold', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        disabled={!settings.potionSettings.autoUseEnabled}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    {/* MP 임계값 설정 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplets size={16} className="text-blue-400" />
                        <span className="text-gray-300">MP 자동 사용 임계값</span>
                        <span className="text-blue-400 font-mono">{settings.potionSettings.mpThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={settings.potionSettings.mpThreshold}
                        onChange={(e) => handlePotionSettingChange('mpThreshold', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        disabled={!settings.potionSettings.autoUseEnabled}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    {/* 물약 사용 순서 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">높은 레벨 물약 우선 사용</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.potionSettings.useHighestFirst}
                          onChange={(e) => handlePotionSettingChange('useHighestFirst', e.target.checked)}
                          className="sr-only peer"
                          disabled={!settings.potionSettings.autoUseEnabled}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 물약 사용 규칙 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-3 text-yellow-400">📋 물약 사용 규칙</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>각 층에서 HP 물약과 MP 물약은 각각 한 번만 사용 가능합니다</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>자동 사용이 활성화되면 설정된 임계값에 도달하면 자동으로 사용됩니다</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>물약의 회복량은 아이템 레벨에 따라 증가합니다 (레벨당 20% 증가)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>높은 레벨 우선 사용이 활성화되면 가장 높은 레벨의 물약부터 사용됩니다</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPanel 