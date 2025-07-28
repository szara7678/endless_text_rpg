# UPDATE.md

## 최신 업데이트 내역

### 턴제 RPG 시스템 완전 구현 - 2024년 12월 19일

**목표**: 기존의 배치 처리 방식 전투를 개별 턴 기반 실시간 전투 시스템으로 변경

**주요 변경사항**:

1. **타입 시스템 확장** (`src/types/index.ts`)
   - `CombatPhase` enum 추가: `PLAYER_TURN`, `MONSTER_TURN`, `COMPLETE`, `WAITING`
   - `CombatState` interface 추가: 전투 상태 관리
   - `TowerState`에 `combatState` 필드 추가

2. **전투 엔진 재설계** (`src/utils/combatEngine.ts`)
   - `processPlayerTurn()`: 플레이어 턴만 처리
   - `processMonsterTurn()`: 몬스터 턴만 처리
   - `determineFirstAttacker()`: 선공 결정 함수
   - 기존 `processAutoCombatTurn()` 유지 (하위 호환성)

3. **스토어 시스템 대폭 수정** (`src/stores/index.ts`)
   - `performCombatAction()`: 턴제 전투 로직으로 완전 재작성
   - `startAutoCombat()`: 턴 대기 상태 체크 로직 추가
   - `handleMonsterDeath()`, `handlePlayerDeath()`: 전투 상태 초기화 추가

4. **UI 개선** (`src/components/layout/MainView.tsx`)
   - 전투 상태 시각화 추가
   - 턴별 상태 표시 (플레이어 턴/몬스터 턴/대기 중)
   - 색상별 상태 구분 (파란색: 플레이어, 빨간색: 몬스터, 회색: 대기)

**기술적 특징**:
- **개별 턴 처리**: 플레이어 턴과 몬스터 턴이 분리되어 처리
- **실시간 로그**: 각 턴마다 개별적으로 로그가 출력
- **자동 진행**: `setTimeout`을 사용한 턴 간 지연 시간
- **상태 관리**: `CombatState`로 전투 진행 상태 추적
- **속도 조절**: 전투 속도에 따른 턴 간 지연 시간 조절

**결과**:
- 전투가 더 역동적이고 자연스럽게 진행
- 각 턴이 개별적으로 표시되어 전투 진행 상황을 명확히 파악 가능
- 실제 턴제 RPG와 유사한 게임플레이 경험 제공

---

### 장비 착용 시 HP/MP NaN 문제 완전 해결 - 2024년 12월 19일

**문제**: 장비를 착용할 때 플레이어의 HP, MP가 NaN이 되는 문제가 발생했습니다.

**원인**: 
- `initialPlayerState`에서 `baseMaxHp`와 `baseMaxMp`가 정의되지 않음
- `recalculatePlayerStats`에서 `newPlayer.maxHp = newPlayer.baseMaxHp`를 할 때 `undefined`가 할당되어 NaN 발생
- 기존 저장된 게임 데이터에서도 `baseMaxHp`, `baseMaxMp` 필드가 없어서 문제 발생

**해결 방법**:
1. `src/stores/playerSlice.ts`의 `initialPlayerState`에 `baseMaxHp: 100`, `baseMaxMp: 50` 추가
2. `src/stores/index.ts`의 `startNewGame` 함수에서 `baseMaxHp`, `baseMaxMp` 기본값 설정
3. `src/stores/index.ts`의 `continueGame` 함수에서 기존 저장 데이터에 `baseMaxHp`, `baseMaxMp`가 없는 경우 기본값으로 설정

**수정된 파일**:
- `src/stores/playerSlice.ts`: `initialPlayerState`에 `baseMaxHp`, `baseMaxMp` 추가
- `src/stores/index.ts`: `startNewGame`과 `continueGame`에서 `baseMaxHp`, `baseMaxMp` 기본값 처리

**결과**: 
- 장비 착용/해제 시 HP, MP가 정상적으로 계산됨
- 기존 저장된 게임 데이터와 새로운 게임 모두에서 정상 작동
- NaN 문제 완전 해결

---

### 단일 인터벌 사용으로 중복 실행 문제 완전 해결 - 2024년 12월 19일

**문제**: 여전히 `setTimeout`과 `setInterval`이 동시에 사용되어 중복 실행과 순서 꼬임 문제가 발생했습니다.

**원인**: 
- `setTimeout`으로 즉시 시작하는 로직과 `setInterval`로 주기적 체크하는 로직이 동시에 실행
- 턴 전환 시 `setTimeout`으로 다음 턴을 시작하는 것이 `setInterval`과 충돌
- 여러 타이머가 동시에 실행되어 전투 순서가 꼬임

**해결 방법**:
1. **단일 인터벌 사용**: `setTimeout` 완전 제거하고 `setInterval`만 사용
2. **게임 속도 연동**: `baseInterval / speed`로 게임 속도에 따른 인터벌 계산
3. **상태 기반 제어**: `setInterval`에서 상태를 체크하여 적절한 시점에 전투 실행
4. **순차적 처리**: 모든 전투 로직을 `setInterval` 내에서 순차적으로 처리

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`, `performCombatAction`, `proceedToNextFloor` 함수에서 `setTimeout` 제거

**결과**: 
- 중복 실행 문제 완전 해결
- 전투 순서 꼬임 문제 해결
- 게임 속도와 완벽하게 연동된 전투 시스템
- 안정적인 단일 타이머 기반 전투 시스템

---

### 전투 중복 실행 문제 해결 - 2024년 12월 19일

**문제**: 몬스터가 일반 공격을 3번 하는 경우가 발생하고, 턴 사이 인터벌과 즉시 시작이 충돌하여 전투 순서가 꼬이는 문제가 발생했습니다.

**원인**: 
- `setTimeout`과 `setInterval`이 동시에 실행되어 중복 실행 발생
- `setInterval`에서 `'waiting'` 상태를 체크할 때 이미 `setTimeout`으로 실행 중인 경우가 있음
- 여러 개의 `performCombatAction`이 동시에 호출되어 전투 순서가 꼬임

**해결 방법**:
1. **중복 실행 방지 로직 추가**: `performCombatAction`에서 이미 턴이 진행 중이면 리턴
2. **상태 체크 강화**: `setInterval`에서 전투 진행 상태를 더 정확히 체크
3. **안전한 턴 전환**: `setTimeout`에서 현재 상태를 다시 확인 후 실행
4. **플래그 기반 제어**: `playerTurnComplete`, `monsterTurnComplete` 플래그로 중복 실행 방지

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`과 `performCombatAction` 함수에 중복 실행 방지 로직 추가

**결과**: 
- 몬스터가 3번 공격하는 문제 해결
- 전투 순서가 꼬이는 문제 해결
- 턴 사이 인터벌과 즉시 시작의 충돌 해결
- 안정적인 턴제 전투 시스템 구현

---

### 턴 교차 시 전투 진행 문제 해결 - 2024년 12월 19일

**문제**: 턴이 교차로 진행되거나 플레이어 턴으로 전환될 때 공격이 진행되지 않는 문제가 발생했습니다.

**원인**: 
- 몬스터 턴이 끝나면 `phase`를 `'waiting'`으로 설정
- `'waiting'` 상태에서는 `setInterval`에서만 다음 턴을 시작할 수 있음
- `setInterval`이 다음 주기까지 기다려야 하므로 전투가 멈춰 보임

**해결 방법**:
1. 플레이어 턴이 끝날 때 다음 턴을 위해 상태 초기화 추가
2. 몬스터 턴이 끝날 때 다음 턴을 위해 상태 초기화 추가
3. `currentTurn` 카운터 증가로 턴 추적 개선
4. `playerTurnComplete`, `monsterTurnComplete` 플래그 초기화

**수정된 파일**:
- `src/stores/index.ts`: `performCombatAction` 함수의 턴 전환 로직 수정

**결과**: 
- 턴 교차 시 전투가 자연스럽게 계속 진행됨
- 전투 멈춤 현상 해결
- 턴 카운터로 전투 진행 상황 추적 가능

---

### 자동 전투 즉시 시작 기능 추가 - 2024년 12월 19일

**목표**: 몬스터가 이미 있을 때 자동 전투가 활성화되면 즉시 선공 턴을 시작하도록 개선

**문제**: 
- 자동 전투 버튼을 눌러도 기존 몬스터가 있으면 전투가 즉시 시작되지 않음
- `setInterval`이 다음 주기까지 기다려야 전투가 시작됨

**해결 방법**:
1. `startAutoCombat` 함수에서 몬스터 존재 여부를 즉시 체크
2. 몬스터가 있고 전투 중이면 `setTimeout`으로 0.1초 후 즉시 첫 턴 시작
3. `combatState`가 없거나 `'waiting'` 상태일 때만 시작하도록 조건 추가

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat` 함수에 즉시 턴 시작 로직 추가

**결과**: 
- 자동 전투 버튼을 누르면 몬스터가 있을 때 즉시 전투 시작
- 기존 몬스터에 대한 반응성 향상
- 사용자 경험 개선

---

### 턴제 시스템 전투 시작 문제 해결 - 2024년 12월 19일

**문제**: 턴제 시스템으로 변경 후 몬스터가 생성되어도 전투가 시작되지 않는 문제가 발생했습니다.

**원인**: 
- 몬스터 생성 시 `combatState.phase`가 `'waiting'`으로 설정됨
- `performCombatAction`이 `'waiting'` 상태에서 호출되지 않아 전투가 시작되지 않음
- `proceedToNextFloor` 함수에서도 `combatState` 설정이 누락됨

**해결 방법**:
1. `startAutoCombat` 함수에서 몬스터 생성 후 `setTimeout`으로 0.5초 후 첫 턴 시작
2. `proceedToNextFloor` 함수에서도 `combatState` 설정 및 첫 턴 시작 로직 추가
3. 몬스터 생성 직후 자동으로 전투가 시작되도록 수정

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`과 `proceedToNextFloor` 함수 수정

**결과**: 
- 몬스터 생성 후 자동으로 전투가 시작됨
- 턴제 시스템이 정상적으로 작동함
- 전투 시작 지연 문제 완전 해결

---

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

### 📦 **제작 아이템 인벤토리 반영 문제 수정**
- **문제**: 
  - 룰렛 완료 후 아이템이 실제로 인벤토리에 반영되지 않음
  - 제작 완료 로그가 표시되지 않아 확인 불가
- **해결**: 
  - `completeSlotGame` 함수에서 `addCombatLog` 활성화
  - `useGameStore.getState()`를 사용하여 전투 로그에 제작 완료 메시지 추가
  - 콘솔 로그 추가로 아이템 추가 과정 추적 가능
  - 소모품과 장비 구분하여 적절한 함수 호출
- **파일**: `src/components/life/CraftingModal.tsx`
- **결과**: 룰렛 완료 후 아이템이 실제로 인벤토리에 추가되고 전투 로그에 표시됨

### ⚔️ **장비 스탯 불일치 문제 수정**
- **문제**: 
  - 장비의 상세 정보에 표시되는 스탯과 실제 전투에 적용되는 스탯이 다름
  - JSON 파일의 `baseStats`와 `equipmentSystem.ts`의 `getBaseEquipmentStats` 값이 불일치
- **원인**: 
  - `flame_sword.json`: `physicalAttack: 20`, `elementalAttack: { flame: 15 }`, `speed: 2`
  - `equipmentSystem.ts`: `physicalAttack: 25`, `magicalAttack: 10`, `speed: 3`
- **해결**: 
  - `equipmentSystem.ts`의 `getBaseEquipmentStats` 값을 JSON 파일과 일치하도록 수정
  - `flame_sword`: `physicalAttack: 20`, `magicalAttack: 15`, `speed: 2`
  - `frost_sword`: `physicalAttack: 18`, `magicalAttack: 17`, `speed: 3`
  - `elementalAttack` 값을 `magicalAttack`으로 변환하여 통일
- **파일**: `src/utils/equipmentSystem.ts`
- **결과**: 장비 상세 정보의 스탯과 실제 전투 적용 스탯이 일치함

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

### 🐛 **장비 해제 시 HP/MP 스탯 차감 문제 수정**
- **문제**: 장비를 해제해도 HP, MP 등 스탯이 정상적으로 차감되지 않음
- **원인**: recalculatePlayerStats 함수에서 maxHp, maxMp를 기본값으로 초기화하지 않고 누적만 했기 때문
- **해결**: recalculatePlayerStats에서 maxHp, maxMp를 각각 100, 50으로 초기화 후 장비 스탯을 누적하도록 수정
- **파일**: `src/utils/equipmentSystem.ts`
- **결과**: 장비 해제 시 HP, MP 등 스탯이 정상적으로 차감되어 실제 캐릭터 스탯에 반영됨

### 🐛 **장비 HP/MP/속도 등 스탯 일치 문제 완전 해결**
- **문제**: 장비의 속도, HP, MP 등 일부 스탯이 상세 패널, 캐릭터 패널, 실제 전투 스탯에서 일치하지 않음
- **원인**: 기본값(100, 50, 5 등)을 하드코딩하거나, baseSpeed 등과 실제 기본값이 다르게 관리됨
- **해결**:
  - PlayerState에 baseMaxHp, baseMaxMp를 추가하여 모든 스탯의 기준값을 명확히 관리
  - recalculatePlayerStats에서 maxHp, maxMp, speed를 각각 baseMaxHp, baseMaxMp, baseSpeed로 초기화 후 장비 스탯 누적
  - 캐릭터 패널에서 '장비 HP', '장비 MP', '장비 속도'를 각각 player.maxHp - player.baseMaxHp, player.maxMp - player.baseMaxMp, player.speed - player.baseSpeed로 계산
- **파일**: `src/types/index.ts`, `src/utils/equipmentSystem.ts`, `src/components/character/CharacterPanel.tsx`
- **결과**: 장비의 모든 스탯(공격력, 속도, HP, MP 등)이 상세 패널, 캐릭터 패널, 실제 전투 스탯에서 완전히 일치

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

---

## 2024-12-23 (추가)

### 🎯 **UI/UX 시스템 완전 개선 - 2차**
- **문제**: 
  - 장비 상세 모달에 불필요한 강화 정보와 요구사항 표시
  - 캐릭터 장비 패널에 속성별 스탯 정보 부족
  - 기본공격 발동률이 10%로 표시됨
  - 플레이어 스킬이 전투 중 발동되지 않음
  - 로그가 너무 길고 복잡함
  - 상단 컨트롤 패널이 불필요함
  - 장비 장착 시 모달이 닫히지 않음
  - 장착하지 않은 장비에 강화 버튼 없음
- **해결**: 
  - 장비 상세 모달에서 강화 정보와 요구사항 섹션 완전 제거
  - 캐릭터 장비 패널에 HP, MP, 속도, 속성별 공격/저항 스탯 추가
  - 기본공격 발동률을 100%로 수정 (스킬 상세 모달)
  - 전투 엔진에서 플레이어 스킬 발동 로직 구현
  - 로그 메시지를 간결하게 수정 ("플레이어 기본 공격! 대미지 24" 형태)
  - 상단 컨트롤 패널 완전 제거
  - 파이어볼을 기본 스킬로 추가 (초기 스킬 설정)
  - 장비 장착 시 자동으로 모달 닫기 기능 추가
  - 장착하지 않은 장비에도 강화 버튼 표시
- **파일**: 
  - `src/components/common/ItemDetailModal.tsx`
  - `src/components/character/CharacterPanel.tsx`
  - `src/components/common/SkillDetailModal.tsx`
  - `src/utils/combatEngine.ts`
  - `src/stores/index.ts`
  - `src/components/layout/MainView.tsx`
  - `src/data/initial/skills.json`
- **결과**: 
  - 장비 상세 모달이 더 깔끔하고 직관적으로 개선됨
  - 캐릭터 장비 패널에서 모든 스탯 정보를 한눈에 확인 가능
  - 기본공격이 정확한 발동률로 표시됨
  - 플레이어 스킬이 전투 중 정상적으로 발동됨
  - 로그가 간결하고 읽기 쉬워짐
  - UI가 더 깔끔하고 사용자 친화적으로 개선됨
  - 장비 장착/강화 시스템이 더 편리해짐

### 🎯 **전투 시스템 완전 개선 - 3차**
- **문제**: 
  - 로그에서 스킬을 쓰는 주체가 명확하지 않음
  - 스킬 사용 시 수련치가 데이터에 정의된 조건에 따라 얻어지지 않음
  - 전투 로그에 불필요한 상성 효과 로그가 표시됨
- **해결**: 
  - 스킬 로그에 주체 명시 ("플레이어 화염구 공격! 대미지 24" 형태)
  - 스킬 사용 시 'cast' 조건으로 수련치 추가
  - 몬스터 처치 시 'kill' 조건으로 수련치 추가
  - 전투 로그에서 상성 효과 로그 제거
  - CombatResult 타입에 skillsUsed 필드 추가
- **파일**: 
  - `src/utils/combatEngine.ts`
  - `src/stores/index.ts`
  - `src/types/index.ts`
- **결과**: 
  - 스킬 로그가 더 명확하고 읽기 쉬워짐
  - 스킬 수련치가 정확한 조건에 따라 획득됨
  - 전투 로그가 깔끔하고 핵심적인 정보만 표시됨

### 🎯 **스킬 수련치 시스템 완전 개선**
- **문제**: 
  - 사용한 스킬 외의 모든 스킬에 수련치가 올라가는 문제
  - 스킬 사용 시 'cast' 수련치가 올라가지 않는 문제
  - 몬스터 처치 시 상성 체크가 없는 문제
  - 마지막으로 사용된 스킬 추적이 안 되는 문제
- **해결**: 
  - 스킬 사용 시 해당 스킬만 'cast' 수련치 추가
  - 몬스터 처치 시 마지막으로 사용된 스킬만 'kill' 수련치 추가
  - 상성 몬스터 처치 시 'killWeak' 수련치 추가
  - CombatResult와 TowerState에 lastUsedSkill 필드 추가
  - 상성 체크 함수 구현 (checkMonsterWeakness)
- **파일**: 
  - `src/utils/combatEngine.ts`
  - `src/stores/index.ts`
  - `src/types/index.ts`
- **결과**: 
  - 스킬 수련치가 정확한 조건에 따라 올바르게 획득됨
  - 상성 시스템이 스킬 수련에 반영됨
  - 마지막 사용 스킬 추적으로 정확한 kill 수련치 제공

### 🎯 **스킬 수련치 수치 시스템 완전 구현**
- **문제**: 
  - 스킬 수련치가 무조건 1씩만 추가되는 문제
  - 스킬 데이터에 정의된 수치가 반영되지 않는 문제
- **해결**: 
  - 스킬 데이터에서 trainingRules의 xpGain 수치를 동적으로 가져오는 함수 구현
  - cast, kill, killWeak 조건별로 정확한 수치만큼 수련치 추가
  - 스킬 데이터 로드 실패 시 안전한 처리 (0 반환)
- **파일**: 
  - `src/stores/index.ts`
- **결과**: 
  - fireball: cast(2), kill(8), killWeak(25) 수치만큼 정확히 수련치 획득
  - basic_attack: cast(1), kill(5), killWeak(20) 수치만큼 정확히 수련치 획득
  - 모든 스킬이 데이터에 정의된 수치에 따라 정확한 수련치 획득

### 🎯 **장비 스탯 일치 시스템 완전 구현**
- **문제**: 
  - 장비 상세 모달에 표시되는 스탯과 실제 캐릭터에 반영되는 스탯이 다른 문제
  - JSON 파일의 baseStats와 equipmentSystem의 getBaseEquipmentStats 값이 불일치
- **해결**: 
  - 장비 상세 모달에서 JSON 파일의 baseStats 대신 getBaseEquipmentStats 함수 사용
  - equipmentSystem의 장비 스탯을 JSON 파일과 일치하도록 수정
  - HP, MP 스탯도 장비 상세 모달에 표시하도록 추가
- **수정된 장비 스탯**:
  - flame_armor: physicalDefense(15), magicalDefense(10), hp(50)
  - toxic_armor: physicalDefense(12), magicalDefense(18), speed(5)
  - verdant_armor: physicalDefense(25), magicalDefense(30), hp(80)
  - flame_staff: magicalAttack(25), mp(30)
  - toxic_staff: magicalAttack(23), mp(25)
  - thunder_staff: magicalAttack(40), mp(40), speed(5)
- **파일**: 
  - `src/components/common/ItemDetailModal.tsx`
  - `src/utils/equipmentSystem.ts`
- **결과**: 
  - 장비 상세 모달의 스탯과 실제 캐릭터 스탯이 완전히 일치
  - 사용자가 장비의 실제 효과를 정확히 확인 가능
  - HP, MP 스탯도 장비 상세 모달에서 확인 가능 

### 🎯 **장비 상세 모달 UX 및 스탯 일치 개선**
- **문제**: 
  - 장비를 장착/해제해도 상세 모달이 닫히지 않음
  - 미장착 장비의 상세 모달에 강화 버튼이 없음
  - 상세 모달의 스탯(특히 속도 등)이 캐릭터 패널/실제 전투 스탯과 일치하지 않음
- **해결**: 
  - 장착/해제 시 항상 상세 모달이 자동으로 닫히도록 수정
  - 미장착 장비에도 강화 버튼이 항상 노출되도록 조건 수정
  - 상세 모달에서 장착된 인스턴스가 있으면 강화 수치까지 반영된 스탯을, 아니면 기본 스탯을 표시하도록 수정
- **파일**: `src/components/common/ItemDetailModal.tsx`
- **결과**: 
  - 장비 장착/해제 시 상세 모달이 자동으로 닫힘
  - 인벤토리 내 미장착 장비도 강화 가능
  - 상세 모달의 모든 스탯(공격력, 속도 등)이 캐릭터 패널/전투 스탯과 완전히 일치 

### 기존 몬스터가 있을 때 자동 전투 시작 문제 해결 - 2024년 12월 19일

**문제**: 몬스터가 이미 있고 턴 대기 중일 때 자동 전투를 시작해도 전투가 진행되지 않았습니다.

**원인**: 
- `setInterval`이 시작되기 전에 기존 몬스터가 있는 상태에서 자동 전투를 시작하면
- `setInterval` 내부의 조건문이 실행되지 않아 전투가 시작되지 않음
- 몬스터가 이미 있는 상태에서 즉시 첫 턴을 시작하는 로직이 없었음

**해결 방법**:
1. **즉시 시작 로직 추가**: `startAutoCombat`에서 몬스터가 이미 있는 경우 즉시 첫 턴 시작
2. **조건 체크**: `tower.currentMonster && tower.isInCombat` 조건 확인
3. **상태 체크**: `combatState`가 없거나 `waiting` 상태인지 확인
4. **setTimeout 사용**: 0.1초 후 즉시 `performCombatAction` 호출

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat` 함수에 기존 몬스터 즉시 시작 로직 추가

**결과**: 
- 기존 몬스터가 있을 때도 자동 전투가 즉시 시작됨
- 턴 대기 중인 상태에서도 정상적으로 전투 진행
- 모든 상황에서 자동 전투가 정상 작동

---

### 단일 인터벌 사용으로 중복 실행 문제 완전 해결 - 2024년 12월 19일

**문제**: 여전히 `setTimeout`과 `setInterval`이 동시에 사용되어 중복 실행과 순서 꼬임 문제가 발생했습니다.

**원인**: 
- `setTimeout`으로 즉시 시작하는 로직과 `setInterval`로 주기적 체크하는 로직이 동시에 실행
- 턴 전환 시 `setTimeout`으로 다음 턴을 시작하는 것이 `setInterval`과 충돌
- 여러 타이머가 동시에 실행되어 전투 순서가 꼬임

**해결 방법**:
1. **단일 인터벌 사용**: `setTimeout` 완전 제거하고 `setInterval`만 사용
2. **게임 속도 연동**: `baseInterval / speed`로 게임 속도에 따른 인터벌 계산
3. **상태 기반 제어**: `setInterval`에서 상태를 체크하여 적절한 시점에 전투 실행
4. **순차적 처리**: 모든 전투 로직을 `setInterval` 내에서 순차적으로 처리

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`, `performCombatAction`, `proceedToNextFloor` 함수에서 `setTimeout` 제거

**결과**: 
- 중복 실행 문제 완전 해결
- 전투 순서 꼬임 문제 해결
- 게임 속도와 완벽하게 연동된 전투 시스템
- 안정적인 단일 타이머 기반 전투 시스템

---

### 전투 중복 실행 문제 해결 - 2024년 12월 19일

**문제**: 몬스터가 일반 공격을 3번 하는 경우가 발생하고, 턴 사이 인터벌과 즉시 시작이 충돌하여 전투 순서가 꼬이는 문제가 발생했습니다.

**원인**: 
- `setTimeout`과 `setInterval`이 동시에 실행되어 중복 실행 발생
- `setInterval`에서 `'waiting'` 상태를 체크할 때 이미 `setTimeout`으로 실행 중인 경우가 있음
- 여러 개의 `performCombatAction`이 동시에 호출되어 전투 순서가 꼬임

**해결 방법**:
1. **중복 실행 방지 로직 추가**: `performCombatAction`에서 이미 턴이 진행 중이면 리턴
2. **상태 체크 강화**: `setInterval`에서 전투 진행 상태를 더 정확히 체크
3. **안전한 턴 전환**: `setTimeout`에서 현재 상태를 다시 확인 후 실행
4. **플래그 기반 제어**: `playerTurnComplete`, `monsterTurnComplete` 플래그로 중복 실행 방지

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`과 `performCombatAction` 함수에 중복 실행 방지 로직 추가

**결과**: 
- 몬스터가 3번 공격하는 문제 해결
- 전투 순서가 꼬이는 문제 해결
- 턴 사이 인터벌과 즉시 시작의 충돌 해결
- 안정적인 턴제 전투 시스템 구현

---

### 턴 교차 시 전투 진행 문제 해결 - 2024년 12월 19일

**문제**: 플레이어가 3번 연속 공격한 후 몬스터가 3번 연속 공격하는 등 턴이 교대로 진행되지 않고 한쪽만 연속 공격하는 문제가 발생했습니다.

**원인**: 
- `setInterval`이 너무 빠르게 실행되어 턴이 끝나기 전에 다음 턴이 시작됨
- 턴 간의 지연 시간이 없어서 연속 공격이 발생
- 중복 실행 방지 로직이 충분하지 않아서 여러 턴이 동시에 실행됨

**해결 방법**:
1. **더 엄격한 중복 실행 방지**: `performCombatAction`에서 턴 진행 중일 때 완전히 차단
2. **인터벌 주기 증가**: 기본 인터벌을 1초에서 2초로 증가, 최소 간격을 0.2초에서 0.5초로 증가
3. **턴 상태 체크 강화**: `player_turn` 또는 `monster_turn` 상태일 때 추가 액션 차단

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`과 `performCombatAction` 함수 수정

**결과**: 
- 턴이 교대로 진행됨 (플레이어 → 몬스터 → 플레이어 → 몬스터)
- 연속 공격 문제 해결
- 턴 간 적절한 지연 시간 확보
- 안정적인 턴제 전투 시스템

---

### 즉시 턴 전환으로 턴 교대 문제 완전 해결 - 2024년 12월 19일

**문제**: 여전히 턴이 교대로 진행되지 않고 한쪽만 연속 공격하는 문제가 발생했습니다.

**원인**: 
- 플레이어 턴이 끝나면 `phase`를 `'waiting'`으로 바꾸고 `setInterval`이 다음 주기까지 기다림
- 몬스터 턴이 즉시 시작되지 않아서 턴 전환이 지연됨
- `setInterval`의 주기 때문에 턴 간 불필요한 대기 시간 발생

**해결 방법**:
1. **즉시 턴 전환**: 플레이어 턴이 끝나면 즉시 `phase`를 `'monster_turn'`으로 변경
2. **즉시 턴 실행**: `setTimeout`으로 0.1초 후 즉시 다음 턴 실행
3. **연속 턴 처리**: 몬스터 턴이 끝나면 즉시 `phase`를 `'player_turn'`으로 변경
4. **순차적 진행**: 턴이 끝나면 즉시 다음 턴으로 전환하여 연속성 확보

**수정된 파일**:
- `src/stores/index.ts`: `performCombatAction` 함수의 턴 전환 로직 수정

**결과**: 
- 턴이 즉시 교대로 진행됨 (플레이어 → 몬스터 → 플레이어 → 몬스터)
- 턴 간 지연 시간 최소화
- 연속 공격 문제 완전 해결
- 자연스러운 턴제 전투 시스템

---

### 플레이어 턴에서 일반공격과 스킬 공격 처리 문제 해결 - 2024년 12월 19일

**문제**: 플레이어 턴에서 자동 전투가 활성화되어 있어도 일반공격과 스킬 공격이 처리되지 않고 몬스터 턴으로 전환되지 않았습니다.

**원인**: 
- `setInterval`에서 `performCombatAction`을 호출할 때 `'waiting'` 상태일 때만 실행되도록 제한
- 플레이어 턴이 진행 중일 때는 `setInterval`이 액션을 수행하지 않음
- 중복 실행 방지 로직이 너무 엄격하여 플레이어 턴 진행을 차단

**해결 방법**:
1. **setInterval 조건 수정**: `'waiting'` 또는 `'player_turn'` 상태일 때 액션 수행
2. **중복 실행 방지 조정**: 턴이 완료되었을 때만 차단하고, 진행 중일 때는 허용
3. **플레이어 턴 처리**: 플레이어 턴에서 일반공격과 스킬 공격을 모두 처리 후 몬스터 턴으로 전환

**수정된 파일**:
- `src/stores/index.ts`: `setInterval` 조건과 `performCombatAction` 중복 실행 방지 로직 수정

**결과**: 
- 플레이어 턴에서 일반공격과 스킬 공격이 정상적으로 처리됨
- 자동 전투가 활성화되어 있을 때 턴이 자연스럽게 진행됨
- 몬스터 턴으로 정상적으로 전환됨

---

### 즉시 턴 전환으로 턴 교대 문제 완전 해결 - 2024년 12월 19일

### 게임 속도와 연동된 인터벌 및 턴 간 지연 시간 추가 - 2024년 12월 19일

**문제**: 턴이 순차적으로 진행되지만 게임 속도와 연동된 인터벌이나 각 공격 이후의 지연 시간이 없어서 너무 빠르게 진행되었습니다.

**원인**: 
- 턴 전환 시 고정된 0.1초 지연만 사용
- 게임 속도 설정이 턴 간 지연에 반영되지 않음
- `setInterval` 주기가 게임 속도와 완전히 연동되지 않음

**해결 방법**:
1. **게임 속도 연동 지연**: 턴 전환 시 `Math.max(200, 1000 / autoSpeed)`로 게임 속도에 따른 지연 시간 계산
2. **setInterval 주기 조정**: 기본 인터벌을 1.5초로 조정하고 최소 간격을 0.3초로 설정
3. **동적 지연 시간**: 속도가 빠를수록 지연 시간이 짧아지고, 속도가 느릴수록 지연 시간이 길어짐

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`과 `performCombatAction` 함수의 지연 시간 로직 수정

**결과**: 
- 게임 속도에 따라 턴 간 지연 시간이 자동 조절됨
- 빠른 속도에서는 빠르게, 느린 속도에서는 천천히 진행
- 자연스러운 전투 페이스 제공

---

### 플레이어 턴에서 일반공격과 스킬 공격 처리 문제 해결 - 2024년 12월 19일

### 자동 전투 상태 유지 및 게임 속도 연동 문제 해결 - 2024년 12월 19일

**문제**: 
- 플레이어가 이기고 자동 전투가 켜져 있는데 갑자기 자동 전투가 꺼지는 문제
- 다음 전투부터 속도가 뒤죽박죽 변하는 문제
- 전투가 끝난 후 게임 속도 설정이 초기화되는 문제

**원인**: 
- `handleMonsterDeath`와 `proceedToNextFloor`에서 `turnDelay`를 하드코딩된 1000으로 설정
- 전투 상태 초기화 시 게임 속도와 연동되지 않음
- 자동 전투 상태가 전투 종료 후 유지되지 않는 경우 발생

**해결 방법**:
1. **게임 속도 연동**: `turnDelay`를 `Math.max(200, 2000 / autoSpeed)`로 계산하여 게임 속도와 연동
2. **자동 전투 상태 유지**: 전투 종료 후에도 자동 전투 상태가 유지되도록 수정
3. **일관된 속도 설정**: 모든 전투 상태 초기화에서 게임 속도를 고려하도록 수정

**수정된 파일**:
- `src/stores/index.ts`: `handleMonsterDeath`와 `proceedToNextFloor` 함수의 `turnDelay` 계산 로직 수정

**결과**: 
- 자동 전투가 전투 종료 후에도 계속 유지됨
- 게임 속도 설정이 모든 전투에서 일관되게 적용됨
- 속도가 뒤죽박죽 변하는 문제 해결

---

### 게임 속도와 연동된 인터벌 및 턴 간 지연 시간 추가 - 2024년 12월 19일

### 딜레이 중앙 관리 시스템 구현 - 2024년 12월 19일

**문제**: 딜레이 계산이 여러 곳에 분산되어 있어서 일관성과 유지보수가 어려웠습니다.

**원인**: 
- `Math.max(200, 2000 / speed)` 계산이 여러 함수에 중복되어 있음
- 딜레이 값을 변경할 때 모든 곳을 수정해야 함
- 일관성 없는 딜레이 계산으로 인한 버그 발생 가능성

**해결 방법**:
1. **중앙 관리 함수 생성**: `getCombatDelay(speed: number)` 함수로 딜레이 계산 통합
2. **일관된 딜레이 적용**: 모든 딜레이 계산을 중앙 함수 사용으로 변경
3. **타입 안전성 확보**: TypeScript 인터페이스에 함수 타입 추가

**수정된 파일**:
- `src/stores/index.ts`: `getCombatDelay` 함수 추가 및 모든 딜레이 계산을 중앙 함수 사용으로 변경

**결과**: 
- 딜레이 계산이 한 곳에서 관리되어 일관성 확보
- 딜레이 값 변경 시 한 곳만 수정하면 됨
- 유지보수성과 안정성 향상

---

### 자동 전투 상태 유지 및 게임 속도 연동 문제 해결 - 2024년 12월 19일