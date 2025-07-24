import React from 'react'
import { X } from 'lucide-react'

interface LifePanelProps {
  isOpen: boolean
  onClose: () => void
}

const LifePanel: React.FC<LifePanelProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`panel-slide-up ${isOpen ? 'open' : ''} fixed inset-x-0 bottom-16 h-[calc(100vh-80px-64px)] bg-dark-800 border-t border-gray-700 z-30`}>
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">생활 스킬</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* 패널 내용 - 스크롤 가능 영역 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px - 64px - 80px)' }}>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 제작 */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-orange-400 mb-2">제작 (Smithing)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 5 (245/500 XP)</p>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors">
                장비 제작
              </button>
            </div>
            
            {/* 연금술 */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-purple-400 mb-2">연금술 (Alchemy)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 3 (89/200 XP)</p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors">
                포션 제작
              </button>
            </div>
            
            {/* 낚시 */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-blue-400 mb-2">낚시 (Fishing)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 7 (156/800 XP)</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                낚시하기
              </button>
            </div>
            
            {/* 농사 */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-green-400 mb-2">농사 (Farming)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 4 (301/400 XP)</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors">
                작물 재배
              </button>
            </div>
            
            {/* 채집 */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-yellow-400 mb-2">채집 (Herbalism)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 6 (445/600 XP)</p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors">
                허브 채집
              </button>
            </div>
            
            {/* 광산 */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-gray-400 mb-2">광산 (Mining)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 8 (124/900 XP)</p>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
                광물 채굴
              </button>
            </div>

            {/* 추가 생활 스킬들 (스크롤 테스트용) */}
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-cyan-400 mb-2">요리 (Cooking)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 2 (67/150 XP)</p>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded transition-colors">
                요리하기
              </button>
            </div>

            <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-md font-semibold text-pink-400 mb-2">보석 세공 (Jeweling)</h3>
              <p className="text-sm text-gray-400 mb-3">Lv. 1 (12/100 XP)</p>
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded transition-colors">
                보석 세공
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LifePanel 