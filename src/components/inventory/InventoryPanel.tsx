import React from 'react'
import { useGameStore } from '../../stores'

interface InventoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, onClose }) => {
  const { player, inventory } = useGameStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full bg-gray-800 rounded-t-lg max-h-[80vh] overflow-hidden slide-up">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">📦 인벤토리</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* 내용 */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* 소지품 현황 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card">
              <div className="text-sm text-gray-400">골드</div>
              <div className="text-lg font-bold text-yellow-400">
                {player.gold.toLocaleString()} G
            </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-400">젠</div>
              <div className="text-lg font-bold text-purple-400">
                {player.gem.toLocaleString()} 젠
              </div>
            </div>
          </div>

          {/* 장비 섹션 */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-3 flex items-center">
              ⚔️ 장착 중인 장비
            </h3>
            <div className="space-y-2">
              {Object.entries(player.equipment).map(([slot, item]) => (
                <div key={slot} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 capitalize w-16">
                      {slot}
                    </span>
                    <span className="font-medium">
                      {item ? `${item.name} +${item.enhancement}` : '없음'}
            </span>
          </div>
                  {item && (
                    <span className="text-xs text-blue-400">
                      Lv.{item.level}
                    </span>
                  )}
          </div>
              ))}
            </div>
        </div>
        
          {/* 아이템 인벤토리 */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-3 flex items-center justify-between">
              🎒 아이템 ({inventory.items.length}/100)
            </h3>
            {inventory.items.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                아이템이 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {inventory.items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-400">{item.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">x{item.count}</div>
                      <button className="text-xs text-blue-400 hover:text-blue-300">
                        사용
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>

          {/* 스킬 페이지 섹션 */}
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center justify-between">
              📜 스킬 페이지 ({inventory.skillPages.length})
            </h3>
            {inventory.skillPages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                스킬 페이지가 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {inventory.skillPages.map((page, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📜</span>
                      <div>
                        <div className="font-medium">{page.skillName}</div>
                        <div className="text-sm text-gray-400">
                          {page.count}장 보유 (해금 필요: 3장)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {page.count >= 3 ? (
                        <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                          해금
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {page.count}/3
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryPanel 