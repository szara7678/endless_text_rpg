# UPDATE.md

## 2024-12-23

### 🐛 **몬스터 데이터 구조 통일 및 슬롯머신 버그 수정**
- **문제**: 
  - `fire_sprite.json`의 구조가 다른 몬스터들과 달라서 오류 발생
  - 품질 미니게임의 룰렛이 돌아가지 않음
- **해결**: 
  - `fire_sprite.json`에 누락된 필드들 추가 (`maxHp`, `level`, `speed`, `goldReward`, `xpReward`, `skills`)
  - 다른 몬스터들과 일치하는 구조로 통일
  - `executeCraft` 함수에서 `setIsCrafting(true)` 제거하여 슬롯머신이 정상 작동하도록 수정
- **파일**: 
  - `src/data/monsters/fire_sprite.json`
  - `src/components/life/CraftingModal.tsx`
- **결과**: 이제 몬스터 데이터가 일관되게 작동하고 슬롯머신 미니게임이 정상적으로 돌아감

### 🎯 **UI/UX 시스템 완전 개선**
- **문제**: 
  - 장비 강화 모달이 외부 클릭으로 닫히지 않음
  - 강화 비용 표시와 실제 차감 비용이 다름
  - 생활 탭과 상점 탭이 모달 형태로 표시됨
  - ShopPanel에서 JSX 구조 오류 발생
  - LifePanel에서 JSX 구조 오류 발생
- **해결**: 
  - 강화 모달에 외부 클릭으로 닫기 기능 추가
  - 강화 비용 계산을 `equipmentSystem`의 `calculateEnhancementCost`와 일치하도록 수정
  - 생활 탭과 상점 탭을 하단 패널로 변경하여 캐릭터, 인벤토리 탭과 일관성 유지
  - 탭 클릭 시 토글 기능 (같은 탭 재클릭 시 닫기, 다른 탭 클릭 시 변경)
  - ShopPanel의 JSX 구조를 완전히 재작성하여 오류 해결
  - LifePanel의 JSX 구조를 React Fragment(`<>`)로 감싸서 오류 해결
- **파일**: 
  - `src/components/common/ItemDetailModal.tsx`
  - `src/components/shop/ShopPanel.tsx`
  - `src/components/life/LifePanel.tsx`
- **결과**: 이제 모든 탭이 일관된 UI/UX를 제공하고 사용자 편의성이 크게 향상됨

### 🎰 **슬롯머신 미니게임 완전 수정**
- **문제**: 제작 슬롯머신이 "돌리는 중..." 상태에서 멈춤
- **원인**: 슬롯 스핀 후 자동으로 완료 함수가 호출되어 사용자 제어 불가
- **해결**: 
  - 슬롯 스핀 후 자동 완료 제거
  - 사용자가 직접 "제작 완료" 버튼을 눌러야 완료되도록 수정
  - 슬롯 심볼을 올바르게 표시하도록 수정
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: 이제 슬롯머신이 정상적으로 작동하고 사용자가 제어 가능

### 🎰 **슬롯머신 로직 완전 개선**
- **문제**: 
  - 슬롯머신이 자동으로 시작되어 사용자 제어 불가
  - "더 만들기" 버튼이 모달을 닫지 않고 연속 제작을 시도
  - 제작 완료 후 모달이 닫히지 않음
- **해결**: 
  - `executeCraft`에서 자동 슬롯 시작 제거
  - "더 만들기" 버튼을 "제작하기" 버튼으로 변경
  - "제작하기" 버튼 클릭 시 재료 소모 후 룰렛 시작
  - 룰렛 결과에 따른 품질 보너스 계산
  - 제작 완료 시 모달 자동 닫기
  - `completeSlotGame`에서 `setShowSlotGame(false)` 추가
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: 사용자가 제작하기 버튼을 눌러야 룰렛이 돌고, 제작 완료 시 모달이 닫힘

### 🎰 **슬롯머신 자동 시작 및 더 만들기 기능**
- **문제**: 
  - 슬롯머신이 자동으로 시작되지 않음
  - "슬롯 돌리기" 버튼이 "더 만들기" 버튼으로 변경 필요
  - 더 만들기 버튼 클릭 시 모달이 닫힘
- **해결**: 
  - `executeCraft` 함수에서 슬롯머신 자동 시작 로직 추가
  - "슬롯 돌리기" 버튼을 "더 만들기" 버튼으로 변경
  - `makeMore` 함수 추가하여 모달을 닫지 않고 새로운 제작 시작
  - `completeSlotGame`에서 모달 닫기 로직 제거
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: 제작 시작 시 자동으로 슬롯이 돌아가고, 더 만들기 버튼으로 연속 제작 가능

### ⚔️ **장비 능력치 전투 스탯 반영**
- **문제**: 
  - 장비의 능력치가 실제 전투 스탯에 반영되지 않음
- **해결**: 
  - `getBaseEquipmentStats` 함수에 모든 장비들의 상세 스탯 추가
  - 무기: `flame_sword`, `frost_sword`, `shadow_sword`, `flame_staff`, `toxic_staff`, `thunder_staff`
  - 방어구: `flame_armor`, `toxic_armor`, `verdant_armor`
  - 각 장비별로 `physicalAttack`, `magicalAttack`, `physicalDefense`, `magicalDefense`, `hp`, `mp`, `speed` 스탯 정의
- **파일**: `src/utils/equipmentSystem.ts`
- **결과**: 장비 착용 시 실제 전투 능력이 향상됨

### 🎣 **생활 아이템 인벤토리 반영**
- **문제**: 
  - 생활 스킬로 얻은 아이템들이 실제 인벤토리에 반영되지 않음
- **해결**: 
  - `LifePanel`에서 `useGameStore`의 `addLifeSkillXp`, `addItem`, `addCombatLog` 함수 import
  - 각 생활 스킬 완료 시 실제 아이템과 경험치 추가:
    - 낚시: `raw_meat` (퍼펙트: 2개, 일반: 1개)
    - 농사: `vegetable` (3개)
    - 광산: `iron_ore` (퍼펙트: 2개, 일반: 1개)
    - 채집: `healing_herb` (퍼펙트: 2개, 일반: 1개)
  - 전투 로그에 획득 아이템 정보 표시
- **파일**: `src/components/life/LifePanel.tsx`
- **결과**: 생활 스킬로 얻은 아이템들이 실제 인벤토리에 추가되어 제작에 사용 가능

### ⚡ **장비 강화 시스템 완전 개선**
- **문제**: 강화 버튼이 별도 모달 없이 바로 실행됨
- **해결**: 
  - 별도의 강화 모달 컴포넌트 생성
  - 강화 확률, 소모 재화, 연속 강화 기능 추가
  - 강화 세션별 횟수 추적 기능
  - 실시간 골드 확인 및 비용 표시
- **파일**: `src/components/common/ItemDetailModal.tsx`
- **결과**: 이제 강화 시스템이 직관적이고 편리하게 작동

### 🎮 **낚시 미니게임 시간 문제 해결**
- **문제**: 낚시 미니게임에서 리듬 완료 시 자동으로 끝남
- **해결**: 시퀀스 완료 후에도 자동 종료되지 않도록 수정
- **파일**: `src/components/life/FishingMinigame.tsx`
- **결과**: 이제 사용자가 직접 완료 버튼을 눌러야 종료됨

### ⏰ **생활 스킬 쿨다운 완전 제거**
- **문제**: 생활 스킬에 쿨다운이 있어 연속 사용 불가
- **해결**: 
  - 모든 쿨다운 관련 코드 제거
  - 언제든지 사용 가능하도록 수정
  - UI에서 "언제든지 사용 가능" 표시
- **파일**: `src/components/life/LifePanel.tsx`
- **결과**: 이제 생활 스킬을 제한 없이 사용 가능

### 🎁 **생활 스킬 보상 시스템 구현**
- **문제**: 생활 스킬 완료 시 경험치와 아이템 보상이 없음
- **해결**: 
  - 각 미니게임 완료 시 경험치 보상 추가
  - 퍼펙트 성공 시 추가 보상 시스템
  - 관련 아이템 자동 획득 로직 준비
- **파일**: `src/components/life/LifePanel.tsx`
- **결과**: 이제 생활 스킬 완료 시 적절한 보상 제공

### 🔧 **장비 장착 상태 확인 버그 수정**
- **문제**: 장착되지 않은 장비에 "장착해제" 버튼이 표시됨
- **원인**: `isEquipped` 함수에서 `uniqueId`와 `itemId` 둘 다 확인하여 잘못된 판단
- **해결**: 
  - `uniqueId`가 있으면 `uniqueId`로만 비교
  - `uniqueId`가 없으면 `itemId`로만 비교
  - 정확한 장착 상태 확인 로직 구현
- **파일**: `src/components/common/ItemDetailModal.tsx`
- **결과**: 이제 장착 상태가 정확하게 표시됨

### ⚛️ **React Hooks 순서 오류 해결**
- **문제**: `CraftingModal`에서 "Rendered more hooks than during the previous render" 오류 발생
- **원인**: 조건부 return 이후에 `useEffect` Hook이 호출되어 Hook 순서가 변경됨
- **해결**: 모든 Hook들을 조건부 return 이전에 호출하도록 수정
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: React Hooks 규칙을 준수하여 오류 완전 해결

### 🛠️ **생활 스킬 시스템 GameStore 통합 완료**
- **문제**: 생활 탭에서 제작 버튼 클릭시 `Cannot read properties of undefined (reading 'skills')` 오류 발생
- **해결**: 
  - `lifeSlice`를 `GameStore`에 완전 통합
  - `CraftingModal`에서 `lifeSlice` 구조에 맞게 skills 접근 방식 수정
  - 생활 스킬 관련 함수들(`addLifeSkillXp`, `startCooldown` 등)을 GameStore에 추가
  - 초기 상태에 life 상태 추가
- **파일**: 
  - `src/stores/index.ts`
  - `src/components/life/CraftingModal.tsx`
- **결과**: 이제 생활 탭의 모든 기능이 정상 작동합니다!

### 💀 **플레이어 사망 처리 시스템 개선**
- **문제**: 플레이어가 죽으면 1층으로 돌아가고 몬스터가 나타나지 않음
- **해결**: 
  - `handlePlayerDeath` 함수를 수정하여 3층 전으로 돌아가도록 변경
  - 사망 후 해당 층에 맞는 몬스터 자동 생성
  - 최고 층 기록도 함께 조정하여 일관성 유지
  - 함수를 async로 변경하여 몬스터 생성 로직 통합
- **파일**: `src/stores/index.ts`

### 🔧 **자동 전투 시스템 완전 수정**
- **문제**: 첫 전투 후 다음 몬스터가 나타나지 않고 자동 전투가 멈춤
- **해결**: 
  - `handleMonsterDeath` 함수에 몬스터 제거 및 다음 몬스터 생성 로직 추가
  - `startAutoCombat` 함수에서 `isInCombat` 조건 제거하여 전투가 끝나도 자동 전투 계속 진행
  - 몬스터가 없을 때 자동으로 새 몬스터 생성하도록 개선
- **파일**: `src/stores/index.ts`

### 🎒 **장비 UI 시스템 완전 개선**
- **문제**: 장비 장착 후 인벤토리에서 테두리 변경 및 E 뱃지가 표시되지 않음
- **해결**:
  - `equipItem` 함수에서 `uniqueId` 처리 로직 추가
  - `ItemDetailModal`에서 `uniqueId` 기반 장착 상태 확인
  - 인벤토리 패널에서 장착된 장비 시각적 구분 (노란색 테두리 + E 뱃지)
  - 장비 고유 관리 시스템으로 각 장비를 개별적으로 관리
- **파일**: 
  - `src/stores/index.ts`
  - `src/utils/equipmentSystem.ts`
  - `src/components/common/ItemDetailModal.tsx`
  - `src/components/inventory/InventoryPanel.tsx`

### 📦 **재료 로드 오류 해결**
- **문제**: 재료 클릭시 "알 수 없는 아이템" 오류 발생
- **해결**: `loadItem` 함수에 `materials` 폴더 검색 로직 추가
- **파일**: `src/utils/dataLoader.ts`

### 🎮 **게임 플레이 개선**
- 자동 전투가 연속적으로 진행되어 끊김 없는 게임 경험 제공
- 장비 장착 상태를 직관적으로 확인 가능
- 각 장비가 고유한 특성을 가져 MMO 스타일의 장비 시스템 구현
- 사망 시 적절한 페널티와 함께 게임 재시작 가능
- 생활 스킬 시스템이 완전히 통합되어 모든 기능 정상 작동
- React Hooks 규칙을 준수하여 안정적인 컴포넌트 렌더링
- 슬롯머신 미니게임이 사용자 제어 가능하게 작동
- 강화 시스템이 직관적이고 편리하게 개선됨
- 모든 생활 스킬이 쿨다운 없이 자유롭게 사용 가능
- 생활 스킬 완료 시 적절한 보상 시스템 제공
- **모든 탭이 일관된 UI/UX를 제공하여 사용자 경험 향상**
- **강화 비용이 정확하게 계산되고 표시됨**
- **외부 클릭으로 모달을 닫을 수 있어 편의성 증대**

### 🐛 **life.skills.find 오류 수정**
- **문제**: 
  - `life.skills.find is not a function` 오류 발생
  - 생활 스킬 경험치 추가 시 오류로 인해 게임 중단
- **원인**: 
  - `life.skills`가 배열이 아닌 객체 구조로 되어 있어 `.find()` 메서드 사용 불가
- **해결**: 
  - `life.skills.find(s => s.skillType === skillType)` → `life.skills[skillType]`로 변경
  - `addLifeSkillXp`, `levelUpLifeSkill`, `startCooldown`, `startMinigame` 함수 모두 수정
- **파일**: `src/stores/index.ts`
- **결과**: 생활 스킬 경험치 추가가 정상적으로 작동

### 🔧 **removeMaterial 함수 구현 및 제작 로직 완전 개선**
- **문제**: 
  - `removeMaterial` 함수가 구현되지 않아 재료 소모가 작동하지 않음
  - 제작하기 버튼 클릭 시 룰렛 완료 후 아이템이 생성되지 않음
  - 제작 완료 버튼이 모달을 닫지 않고 아이템을 다시 제작함
- **해결**: 
  - `removeMaterial` 함수 구현: 재료 수량 감소 및 0개 시 제거
  - 제작하기 버튼 클릭 시 재료 소모 → 품질 보너스 초기화 → 슬롯머신 → 자동 아이템 제작
  - 제작 완료 버튼은 모달만 닫도록 수정
  - 제작 결과를 UI에 표시하는 `craftedItem` 상태 추가
- **파일**: `src/stores/index.ts`, `src/components/life/CraftingModal.tsx`
- **결과**: 재료 소모 → 슬롯머신 → 아이템 제작 → 모달 닫기 순서로 정상 작동

### 🎮 **미니게임 완료 후 게임 시작 패널로 진입**
- **문제**: 
  - 미니게임 완료 후 다시 미니게임을 들어가면 완료 버튼이 나옴
- **해결**: 
  - 모든 미니게임의 완료 버튼 클릭 시 게임 상태를 `ready`로 초기화
  - `FishingMinigame`, `MiningMinigame`, `HerbalismMinigame` 모두 수정
  - 게임 관련 상태들(점수, 진행도, 그리드 등) 모두 리셋
- **파일**: `src/components/life/FishingMinigame.tsx`, `src/components/life/MiningMinigame.tsx`, `src/components/life/HerbalismMinigame.tsx`
- **결과**: 미니게임 완료 후 다시 들어가면 게임 시작 패널이 표시됨

### 📈 **생활 스킬 레벨업 시스템 수정**
- **문제**: 
  - 생활 스킬이 레벨 2 이상으로 올라가지 않음
- **원인**: 
  - `addLifeSkillXp` 함수에서 스토어 상태를 실제로 업데이트하지 않음
  - 레벨업 로직이 단순한 계산만 하고 실제 상태 변경을 하지 않음
- **해결**: 
  - `addLifeSkillXp` 함수에서 `set()`을 사용하여 스토어 상태 업데이트
  - 레벨업 시 `maxXp` 증가 로직 추가 (`Math.floor(100 * Math.pow(1.5, newLevel - 1))`)
  - 경험치가 `maxXp`를 초과할 때 자동 레벨업 로직 구현
- **파일**: `src/stores/index.ts`
- **결과**: 생활 스킬 경험치 획득 시 실제로 레벨이 올라가고 UI에 반영됨

### 🎰 **제작하기 버튼 로직 완전 개선**
- **문제**: 
  - 제작하기 버튼 클릭 시 재료 소모, 품질 보너스 초기화, 슬롯머신 완료 후 아이템 제작이 제대로 작동하지 않음
- **해결**: 
  - `spinSlots` 함수에 재료 소모 확인 및 처리 로직 추가
  - 품질 보너스 초기화 (`setQualityBonus(0)`) 추가
  - 슬롯머신 완료 후 1초 뒤 자동으로 `completeSlotGame` 호출
  - 재료 부족 시 제작 중단 로직 추가
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: 제작하기 → 재료 소모 → 슬롯머신 → 품질 계산 → 아이템 제작 순서로 정상 작동

### 🐟 **날고기 분류를 물고기로 변경**
- **문제**: 
  - `raw_meat`가 `cooking` 카테고리로 분류되어 있음
- **해결**: 
  - `src/data/materials/raw_meat.json`에서 `category`를 `"cooking"`에서 `"fishing"`으로 변경
- **파일**: `src/data/materials/raw_meat.json`
- **결과**: 낚시로 얻은 날고기가 물고기 카테고리로 올바르게 분류됨

### 📊 **생활 탭 경험치/레벨 반영 문제 수정**
- **문제**: 
  - 로그에서는 생활 레벨이 올라간다고 표시되지만 생활 탭에는 경험치 상승이나 레벨 상승이 반영되지 않음
- **원인**: 
  - `lifeSkills` 배열이 하드코딩되어 있어서 실제 스토어의 데이터를 반영하지 않음
- **해결**: 
  - `useGameStore`에서 `life` 상태 import 추가
  - 하드코딩된 `lifeSkills` 배열을 실제 스토어 데이터를 사용하도록 수정
  - 각 스킬의 `level`, `xp`, `maxXp`를 `life?.skills?.[skillId]?.`로 동적 접근
- **파일**: `src/components/life/LifePanel.tsx`
- **결과**: 생활 스킬 경험치와 레벨이 실시간으로 UI에 반영됨

### 🎰 **슬롯머신 모달 이벤트 전파 문제 수정**
- **문제**: 
  - "제작하기" 버튼 클릭 시 슬롯머신이 돌아가지 않고 모달이 닫힘
- **원인**: 
  - 슬롯머신 모달이 메인 모달의 `onClick={onClose}` 이벤트에 의해 닫힘
- **해결**: 
  - 슬롯머신 모달의 z-index를 60으로 높임
  - 슬롯머신 모달에 `onClick={(e) => e.stopPropagation()}` 추가
  - 이벤트 전파를 막아서 메인 모달의 닫기 이벤트가 실행되지 않도록 수정
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: 제작하기 버튼 클릭 시 슬롯머신이 정상적으로 돌아감

### 📦 **생활 아이템 인벤토리 반영 문제 수정**
- **문제**: 
  - 생활 스킬로 얻은 아이템들이 로그에는 표시되지만 실제 인벤토리에 반영되지 않음
- **원인**: 
  - `addItem` 함수는 `inventory.items`에 추가하지만, 생활 스킬 아이템들은 `inventory.materials`에 추가되어야 함
- **해결**: 
  - `addItem` 대신 `addMaterial` 함수 사용
  - `useGameStore`에서 `addMaterial` 함수 import 추가
  - 모든 생활 스킬 완료 시 `addMaterial`로 재료 추가
- **파일**: `src/components/life/LifePanel.tsx`
- **결과**: 생활 스킬로 얻은 재료들이 실제 인벤토리의 materials에 추가되어 제작에 사용 가능

---

## 2024-12-22

### 🐛 **초기 오류 수정**
- **문제**: "Unknown Item" 오류로 인한 자동 전투 시작 실패
- **해결**: `src/data/items/index.json`에 누락된 장비 아이템들 추가
- **추가된 아이템**: `wooden_sword`, `iron_sword`, `frost_sword`, `shadow_sword`, `flame_staff`, `toxic_staff`, `thunder_staff`, `leather_armor`, `toxic_armor`, `verdant_armor`, `greater_health_potion`, `greater_mana_potion`, `bread`, `meat_stew`

### 🎨 **UI 개선**
- **문제**: 캐릭터 탭의 장비 패널에서 강화 시스템 패널이 삭제되지 않음
- **해결**: `src/components/character/CharacterPanel.tsx`에서 강화 시스템 섹션 완전 제거

### 🎮 **미니게임 모달 수정**
- **문제**: 생활 미니게임 결과 모달이 사용자 확인 없이 자동으로 닫힘
- **해결**: `src/components/life/` 폴더의 모든 미니게임 컴포넌트에서 `onClick={onClose}` 제거
- **수정된 파일**: `FishingMinigame.tsx`, `MiningMinigame.tsx`, `HerbalismMinigame.tsx`, `FarmingSystem.tsx`

### ⚡ **자동 전투 시스템 수정**
- **문제**: `Uncaught ReferenceError: startAutoCombat is not defined`
- **해결**: `src/components/layout/MainView.tsx`에서 `setAutoMode` 함수 사용으로 변경
- **파일**: `src/components/layout/MainView.tsx`, `src/stores/index.ts`

### 📋 **프로젝트 구조**
- 모든 파일이 기존 분류대로 폴더별로 정리됨
- README.md 파일에 각 파일의 목적과 구조 명시
- TroubleShooting.md에 디버깅 및 수정 내역 기록 