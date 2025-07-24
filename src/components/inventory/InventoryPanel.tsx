import React, { useState } from 'react'
import { X, Package, Wrench, Zap, Shirt } from 'lucide-react'
import { useGameStore } from '../../stores'

interface InventoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, onClose }) => {
  const { player, inventory } = useGameStore()
  const [activeTab, setActiveTab] = useState<'items' | 'materials' | 'equipment' | 'consumables'>('items')

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-x-0 bg-gray-800 border-t border-gray-700 z-20 flex flex-col"
      style={{ top: '64px', bottom: '64px' }}
    >
      {/* 패널 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">📦 인벤토리</h2>
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
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'items' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Package size={16} />
            <span>아이템</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'materials' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Wrench size={16} />
            <span>재료</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'equipment' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Shirt size={16} />
            <span>장비</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('consumables')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'consumables' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap size={16} />
            <span>소모품</span>
          </div>
        </button>
      </div>

      {/* 패널 내용 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-32">
          {activeTab === 'items' && (
            <div className="p-4 space-y-6">
              {/* 스킬 페이지 */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-purple-400">📜 스킬 페이지</h3>
                {inventory.skillPages && inventory.skillPages.length > 0 ? (
                  <div className="space-y-2">
                    {inventory.skillPages.map((page: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-gray-800 rounded p-3">
                        <div>
                          <div className="font-medium text-white capitalize">
                            {page.skillId.replace('_', ' ')} 페이지
                          </div>
                          <div className="text-sm text-gray-400">
                            {page.count >= 3 ? '✅ 스킬 해금 가능' : `${3 - page.count}장 더 필요`}
                          </div>
                        </div>
                        <div className="text-purple-400 font-bold">
                          {page.count}/3
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">스킬 페이지가 없습니다</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="p-4 space-y-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-green-400">🔥 재료</h3>
                {inventory.materials && inventory.materials.length > 0 ? (
                  <div className="space-y-2">
                    {inventory.materials.map((material: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-gray-800 rounded p-3">
                        <div>
                          <div className="font-medium text-white capitalize">
                            {material.name || material.materialId.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-400">레벨 {material.level}</div>
                        </div>
                        <div className="text-green-400 font-bold">
                          {material.count}개
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">재료가 없습니다</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="p-4 space-y-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-orange-400">⚔️ 장비 목록</h3>
                
                {/* 무기 */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 text-red-400">🗡️ 무기</h4>
                  {player.equipment.weapon ? (
                    <div className="bg-gray-800 rounded p-3 border-l-4 border-red-400">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{player.equipment.weapon.itemId}</div>
                          <div className="text-sm text-gray-400">
                            레벨 {player.equipment.weapon.level} | +{player.equipment.weapon.enhancement}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-semibold">✅ 착용 중</div>
                          <div className="text-red-400 text-sm">공격력 +{player.equipment.weapon.physicalAttack || 10}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4 bg-gray-800 rounded">착용 중인 무기가 없습니다</div>
                  )}
                </div>

                {/* 방어구 */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 text-blue-400">🛡️ 방어구</h4>
                  {player.equipment.armor ? (
                    <div className="bg-gray-800 rounded p-3 border-l-4 border-blue-400">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{player.equipment.armor.itemId}</div>
                          <div className="text-sm text-gray-400">
                            레벨 {player.equipment.armor.level} | +{player.equipment.armor.enhancement}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-semibold">✅ 착용 중</div>
                          <div className="text-blue-400 text-sm">방어력 +{player.equipment.armor.physicalDefense || 5}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4 bg-gray-800 rounded">착용 중인 방어구가 없습니다</div>
                  )}
                </div>

                {/* 액세서리 */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 text-purple-400">💍 액세서리</h4>
                  {player.equipment.accessory ? (
                    <div className="bg-gray-800 rounded p-3 border-l-4 border-purple-400">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{player.equipment.accessory.itemId}</div>
                          <div className="text-sm text-gray-400">
                            레벨 {player.equipment.accessory.level} | +{player.equipment.accessory.enhancement}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-semibold">✅ 착용 중</div>
                          <div className="text-purple-400 text-sm">특수 효과</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4 bg-gray-800 rounded">착용 중인 액세서리가 없습니다</div>
                  )}
                </div>

                {/* 보관된 장비 */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-400">📦 보관된 장비</h4>
                  <div className="text-gray-500 text-center py-8 bg-gray-800 rounded">
                    보관된 장비가 없습니다
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consumables' && (
            <div className="p-4 space-y-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-blue-400">🧪 소모품</h3>
                {inventory.items && inventory.items.length > 0 ? (
                  <div className="space-y-2">
                    {inventory.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-gray-800 rounded p-3">
                        <div>
                          <div className="font-medium text-white capitalize">
                            {item.itemId.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-400">레벨 {item.level || 1}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-blue-400 font-bold">
                            {item.quantity}개
                          </div>
                          <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            사용
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">소모품이 없습니다</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryPanel 