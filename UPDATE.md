# UPDATE.md

## 최신 업데이트 내역

### 🔧 **스킬 시스템 완전 개편 및 아이템 판매 시스템 구현 - 2024년 12월 23일**

**문제**: 
1. 스킬 탭에서 수련치 게이지가 반영되지 않음
2. 속성별 필터링 버튼이 너무 큼
3. 스킬 발동 확률이 정수로만 표시됨
4. 품질에 따른 발동 확률 제한이 없음
5. 레벨업 시 최대 경험치가 스킬별로 다르지 않음
6. 아이템 판매 시스템이 없음
7. 스킬 탭에서 미습득 스킬이 위에 표시됨
8. 개별 판매 방식이 불편함
9. 일괄 판매 버튼이 작동하지 않음
10. 메인 UI에서 상태 텍스트가 불필요함
11. 스킬 발동률 증가 수치가 소수점이 너무 길게 표시됨
12. 스킬 대미지 계산 시스템이 없음
13. 스킬 레벨업 시스템이 골드 기반임
14. 스킬 대미지가 "계산 불가"로 표시됨
15. 아이템 상세 모달에 판매 가격이 표시되지 않음
16. 일괄판매가 장비만 가능함
17. 레벨 필터링이 최소 레벨로 설정됨
18. 개별 판매 방식이 복잡함

**원인**: 
- 게이지 계산에서 `maxXp`가 0일 때 문제 발생
- 필터링 버튼 크기가 인벤토리와 일치하지 않음
- 발동 확률이 소수점을 지원하지 않음
- 스킬별 품질 차이가 반영되지 않음
- `baseMaxExp` 시스템이 없음
- 아이템 판매 기능이 구현되지 않음
- 스킬 정렬 로직이 잘못됨
- 개별 판매가 뱃지 방식으로 구현됨
- 일괄 판매 모달 로직에 오류가 있음
- UI가 복잡하고 불필요한 정보가 표시됨
- `perLevel` 계산 결과가 소수점 한 자리로 제한되지 않음
- 스킬 대미지 계산 정보가 없음
- 레벨업 시스템이 골드 기반으로 설계됨
- 스킬 데이터에 `damageCalculation` 필드가 없음
- 아이템 상세 모달에 판매 가격 표시 로직이 없음
- 일괄판매 필터링이 제한적임
- 레벨 필터링 로직이 잘못됨
- 개별 판매 UI가 복잡함

**해결 방법**:
1. **게이지 반영 수정**: 
   - 게이지 계산에서 `maxXp` 기본값을 100으로 설정
   - 정확한 경험치 비율 계산

2. **필터링 버튼 크기 조정**:
   - 인벤토리와 동일한 크기로 조정
   - 이모지와 텍스트 크기 축소
   - 속성 이름 텍스트 제거

3. **스킬 발동 확률 개선**:
   - 소수점 발동 확률 지원 (예: 8.5%)
   - 품질에 따른 최대 발동 확률 제한:
     - 노말: 40% 이하, 레벨당 +2.0% 이하
     - 레어: 35% 이하, 레벨당 +1.8% 이하
     - 에픽: 30% 이하, 레벨당 +1.5% 이하
     - 레전더리: 25% 이하, 레벨당 +1.2% 이하

4. **스킬별 경험치 시스템**:
   - `baseMaxExp` 필드 추가
   - 레벨업마다 `baseMaxExp * 1.2^(레벨-1)`로 최대 경험치 증가
   - 스킬별로 다른 기본 경험치 설정

5. **스킬 정렬 개선**:
   - 습득한 스킬을 위로 정렬
   - 미습득 스킬을 아래로 정렬

6. **아이템 판매 시스템 개선**:
   - 개별 판매를 버튼 방식으로 변경
   - 아이템 선택 → 수량 선택 → 판매 순서로 개선
   - 일괄 판매 모달 로직 수정
   - 레벨, 품질, 강화도에 따른 가격 차등 적용

7. **UI 간소화**:
   - 메인 UI에서 전투 상태 텍스트 제거
   - 자동 전투 진행 상태 텍스트 제거
   - 깔끔하고 직관적인 인터페이스 구현

8. **스킬 발동률 표시 개선**:
   - 다음 레벨 발동률을 소수점 한 자리로 제한
   - 발동률 증가 수치를 소수점 한 자리로 제한

9. **스킬 대미지 시스템 구현**:
   - `damageCalculation` 필드 추가 (baseMagicAtk, basePhysicalAtk, levelScaling, elementalBonus)
   - 스킬별 대미지 계산 함수 구현
   - 스킬 상세 모달에 대미지 정보 표시

10. **스킬 레벨업 시스템 개선**:
    - 골드 기반에서 AP 기반으로 변경
    - `levelUpCost` 필드 추가 (baseAp, apScaling)
    - 레벨업 버튼을 우상단으로 이동
    - 스킬별로 다른 AP 비용 설정

11. **스킬 대미지 계산 수정**:
    - 스킬 데이터에 `damageCalculation` 필드 추가
    - 대미지 계산 로직 개선
    - 모든 스킬에 대미지 정보 설정

12. **아이템 상세 모달 개선**:
    - 모든 아이템에 판매 가격 표시
    - 강화, 레벨, 품질을 고려한 가격 계산

13. **일괄판매 시스템 개선**:
    - 모든 아이템 타입 지원 (재료, 장비, 소모품)
    - 레벨 필터링을 최대 레벨로 변경
    - 필터링 로직 개선

14. **개별 판매 방식 개선**:
    - 판매 모드 활성화 방식으로 변경
    - 아이템 클릭 시 판매 모달 표시
    - 더 직관적인 UI 구현

**수정된 파일**:
- `src/components/character/CharacterPanel.tsx`: 게이지 계산 수정, 필터링 버튼 크기 조정, 스킬 정렬 개선, 레벨업 버튼 위치 변경, AP 시스템 적용
- `src/data/skills/*.json`: 모든 스킬에 소수점 발동 확률, baseMaxExp, damageCalculation, levelUpCost 추가
  - `fireball.json`, `ice_shard.json`, `basic_attack.json`, `flame_aura.json`: 완료
  - `ember_toss.json`, `frost_bite.json`, `thunder_shock.json`, `thunder_roar.json`: 완료
  - `shadow_bite.json`, `dark_howl.json`, `toxic_spit.json`, `venom_burst.json`: 완료
  - `nature_blessing.json`, `verdant_charge.json`: 완료
- `src/stores/index.ts`: 레벨업 시스템에 baseMaxExp 적용
- `src/components/common/SkillDetailModal.tsx`: 소수점 발동 확률 표시, 발동률 증가 수치 소수점 제한, 대미지 정보 표시, 대미지 계산 로직 수정, 동적 스킬 데이터 로딩 구현
- `src/components/common/ItemDetailModal.tsx`: 모든 아이템에 판매 가격 표시 추가
- `src/utils/skillSystem.ts`: 스킬 대미지 계산 함수 추가
- `src/utils/itemSystem.ts`: 아이템 판매 가격 계산 함수 추가, 안전한 itemId 체크 로직 추가
- `src/components/inventory/SellModal.tsx`: 판매 모달 컴포넌트 개선, 레벨 필터링 수정, 모든 아이템 타입 지원, 재료 필터 추가, 일괄 판매 로직 수정, 디버깅 로그 추가, 아이템 수량 표시, 전체 아이템 로딩 로직 개선
- `src/components/inventory/InventoryPanel.tsx`: 개별 판매 버튼 제거, 일괄 판매만 유지
- `src/components/common/ItemDetailModal.tsx`: 아이템 상세 모달에 판매 기능 추가, 수량 선택 가능한 판매 모달 구현, 재료/소모품 판매 지원 개선, 디버깅 로그 및 강제 판매 버튼 추가
- `src/components/layout/MainView.tsx`: 상태 텍스트 제거로 UI 간소화

**결과**: 
- 스킬 탭에서 정확한 수련치 게이지 표시
- 인벤토리와 일관된 필터링 버튼 크기
- 소수점 발동 확률 표시 (예: 8.5%)
- 품질에 따른 발동 확률 제한으로 밸런스 개선
- 스킬별로 다른 경험치 시스템으로 다양성 증가
- 습득한 스킬이 위에 표시되어 사용성 개선
- 완전한 아이템 판매 시스템 구현
- 개별/일괄 판매 기능으로 편의성 향상
- 직관적인 개별 판매 방식으로 사용성 개선
- 깔끔한 메인 UI로 가독성 향상
- 정확한 소수점 표시로 가독성 향상
- 정교한 스킬 대미지 계산 시스템 구현
- AP 기반 레벨업 시스템으로 밸런스 개선
- 정확한 스킬 대미지 정보 표시
- 모든 아이템에 판매 가격 표시
- 완전한 일괄판매 시스템 (모든 아이템 타입 지원)
- 직관적인 개별 판매 모드 시스템

---

### 🔧 **스킬 수련치 반영 문제 해결 - 2024년 12월 23일**

**문제**: 
1. 스킬 수련치 획득 로그는 나오지만 스킬 탭에서 경험치가 반영되지 않음
2. 스킬 상세 모달에서 경험치가 업데이트되지 않음
3. `maxXp`가 0으로 설정되어 경험치 계산이 잘못됨

**원인**: 
- `addSkillTrainingXp` 함수에서 `maxXp` 기본값이 0으로 설정
- 스킬 상세 모달에서 경험치 업데이트가 실시간으로 반영되지 않음
- 스킬 정보 업데이트 로직이 불완전함

**해결 방법**:
1. **스킬 수련치 계산 수정**: 
   - `addSkillTrainingXp`에서 `maxXp` 기본값을 100으로 설정
   - 경험치 계산 로직 개선

2. **스킬 상세 모달 실시간 업데이트**:
   - 스킬 정보 업데이트를 위한 `useEffect` 추가
   - 경험치, 레벨, 최대 경험치 실시간 반영

**수정된 파일**:
- `src/stores/index.ts`: `addSkillTrainingXp` 함수에서 `maxXp` 기본값 수정
- `src/components/common/SkillDetailModal.tsx`: 스킬 정보 실시간 업데이트 로직 추가

**결과**: 
- 스킬 수련치가 정확히 반영됨
- 스킬 탭에서 실시간 경험치 표시
- 스킬 상세 모달에서 실시간 경험치 업데이트
- 정확한 경험치 계산 및 표시

---

### 🔧 **스킬 속성 필터 시스템 개선 - 2024년 12월 23일**

**문제**: 
1. 속성별 스킬 탭이 별도로 존재하여 복잡함
2. 모든 탭에서 속성 필터를 사용할 수 없음
3. 이모티콘 필터가 제한적으로만 사용됨

**원인**: 
- 속성별 스킬 탭이 독립적으로 존재
- 필터링 로직이 탭별로 분리되어 있음
- 이모티콘 필터가 특정 탭에서만 작동

**해결 방법**:
1. **속성별 탭 제거**: 
   - 속성별 스킬 탭을 제거하고 이모티콘 필터로 통합
   - 모든 탭(모든 스킬, 습득한 스킬, 미습득 스킬)에서 속성 필터 사용 가능

2. **이모티콘 필터 개선**:
   - 모든 탭에서 이모티콘 필터 적용 가능
   - "All" 옵션 추가로 전체 속성 표시
   - 각 속성별 색상과 이모지로 직관적 표시

**수정된 파일**:
- `src/components/character/CharacterPanel.tsx`: 속성별 탭 제거, 이모티콘 필터를 모든 탭에서 사용 가능하도록 수정

**결과**: 
- 속성별 스킬 탭 제거로 UI 단순화
- 모든 탭에서 이모티콘 필터 사용 가능
- 더 직관적이고 일관된 필터링 시스템
- 사용자 경험 개선

---

### 🔧 **스킬 경험치 표시 수정 및 속성별 분류 개선 - 2024년 12월 23일**

**문제**: 
1. 스킬 경험치를 획득했다는 로그는 나오지만 스킬 탭에서 경험치가 0/0으로 표시됨
2. 스킬 상세 모달에서 경험치가 0/100에서 변경되지 않음
3. 속성별 스킬 탭이 단순한 텍스트로 표시되어 가시성이 떨어짐

**원인**: 
- 스킬 탭에서 `maxXp`가 0으로 설정되어 경험치 표시가 잘못됨
- 스킬 상세 모달에서 실제 스킬 데이터를 로드하지 않음
- 속성별 분류가 인벤토리 재료처럼 이모지로 표시되지 않음

**해결 방법**:
1. **스킬 경험치 표시 수정**: 
   - 스킬 탭에서 `maxXp` 기본값을 100으로 설정
   - 스킬 상세 모달에서 실제 스킬 데이터 로드 추가

2. **속성별 분류 개선**:
   - 속성별 스킬 탭을 인벤토리 재료처럼 이모지로 표시
   - 각 속성별 색상과 이모지 추가
   - 더 직관적인 UI 제공

**수정된 파일**:
- `src/components/character/CharacterPanel.tsx`: 스킬 경험치 표시 수정, 속성별 분류 이모지 추가
- `src/components/common/SkillDetailModal.tsx`: 스킬 데이터 로드 및 정보 업데이트 추가

**결과**: 
- 스킬 탭에서 정확한 경험치 표시 (예: 25/100)
- 스킬 상세 모달에서 실제 스킬 데이터 기반 정보 표시
- 속성별 스킬 분류가 이모지와 색상으로 직관적으로 표시
- 인벤토리 재료와 일관된 UI 경험

---

### 🔧 **스킬 발동률 수정 및 저장 시스템 개선 - 2024년 12월 23일**

**문제**: 
1. 파이어볼의 기본 확률이 90%인데도 스킬이 발동되지 않음
2. 주기적 저장이 계속 발생하여 성능에 영향을 줌
3. 전투 로직에서 스킬 발동률 계산이 잘못됨

**원인**: 
- `processPlayerSkills`에서 초기 스킬 데이터의 `triggerChance`를 사용
- 실제 스킬 데이터 파일의 발동률을 고려하지 않음
- 주기적 저장이 5초마다 실행되어 불필요한 저장 발생

**해결 방법**:
1. **스킬 발동률 계산 수정**: 
   - `processPlayerSkills`에서 실제 스킬 데이터 파일의 `triggerChance` 사용
   - 레벨에 따른 발동률 계산 추가
   - 기본 공격은 100% 발동률로 고정

2. **저장 시스템 개선**:
   - 주기적 저장(5초마다) 제거
   - 몬스터 처치 시에만 저장하도록 변경
   - 불필요한 로그 제거

**수정된 파일**:
- `src/utils/combatEngine.ts`: 스킬 발동률 계산 로직 수정
- `src/stores/index.ts`: 주기적 저장 제거, 몬스터 처치 시 저장 추가

**결과**: 
- 파이어볼이 90% 확률로 정상 발동됨
- 모든 스킬이 실제 데이터 기반 발동률로 작동
- 불필요한 주기적 저장 제거로 성능 향상
- 몬스터 처치 시에만 저장되어 효율적인 저장 시스템

---

### 🔧 **스킬 시스템 완전 개편 - 2024년 12월 23일**

**문제**: 
1. 모든 스킬 데이터가 품질에 맞게 설정되지 않음
2. 캐릭터창의 스킬 탭에서 모든 스킬을 해금할 수 없음
3. 스킬 필터링 및 정렬 기능이 부족함
4. 미습득 스킬이 위로 오지 않음

**원인**: 
- 일부 스킬 데이터가 이전 구조를 사용
- 스킬 해금 시스템이 제한적
- 스킬 UI가 단순한 구조

**해결 방법**:
1. **모든 스킬 데이터 품질 개선**: 
   - 모든 스킬을 새로운 `triggerChance` 구조로 통일
   - 품질에 맞는 발동률 설정:
     - `fireball`: 기본 90%, 레벨당 +5%, 최대 90%
     - `ice_shard`: 기본 10%, 레벨당 +4%, 최대 85%
     - `flame_aura`: 기본 10%, 레벨당 +6%, 최대 95%
     - `frost_bite`: 기본 15%, 레벨당 +5%, 최대 80%
     - `ember_toss`: 기본 10%, 레벨당 +8%, 최대 95%
     - `thunder_shock`: 기본 20%, 레벨당 +6%, 최대 85%
     - `thunder_roar`: 기본 15%, 레벨당 +7%, 최대 90%
     - `shadow_bite`: 기본 25%, 레벨당 +5%, 최대 85%
     - `dark_howl`: 기본 20%, 레벨당 +6%, 최대 90%
     - `toxic_spit`: 기본 30%, 레벨당 +4%, 최대 80%
     - `venom_burst`: 기본 25%, 레벨당 +7%, 최대 95%
     - `nature_blessing`: 기본 20%, 레벨당 +5%, 최대 85%
     - `verdant_charge`: 기본 25%, 레벨당 +4%, 최대 80%

2. **캐릭터창 스킬 탭 개선**:
   - 모든 스킬을 해금 가능하도록 개선
   - 스킬 필터링 탭 추가: 모든 스킬, 습득한 스킬, 미습득 스킬, 속성별 스킬
   - 미습득 스킬이 위로 오도록 정렬
   - 스킬 페이지 기반 해금 시스템

3. **스킬 UI 개선**:
   - 스킬 타입과 속성 표시
   - 해금 버튼과 레벨업 버튼 분리
   - 미습득 스킬에 노란색 테두리 표시

**수정된 파일**:
- `src/data/skills/frost_bite.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/thunder_shock.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/thunder_roar.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/shadow_bite.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/dark_howl.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/toxic_spit.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/venom_burst.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/nature_blessing.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/verdant_charge.json`: 새로운 `triggerChance` 구조로 변경
- `src/components/character/CharacterPanel.tsx`: 스킬 탭 완전 개편

**결과**: 
- 모든 스킬이 품질에 맞는 발동률로 설정됨
- 캐릭터창에서 모든 스킬을 해금 가능
- 스킬 필터링 및 정렬 기능 추가
- 미습득 스킬이 위로 정렬되어 가시성 향상
- 스킬 페이지 기반 해금 시스템으로 게임 진행에 따른 스킬 해금

---

### 🔧 **스킬 발동률 시스템 개선 - 2024년 12월 23일**

**문제**: 
1. 각 스킬마다 기본 발동 확률, 레벨당 상승 확률, 최대 발동 확률을 설정할 수 없음
2. 스킬 상세 모달에서 발동률이 항상 10%로 표시됨
3. 기존 `triggerChanceLevels` 배열 방식이 복잡하고 유연하지 않음

**원인**: 
- 스킬 데이터 구조가 `baseTriggerChance`와 `triggerChanceLevels` 배열 방식 사용
- 레벨당 상승 확률과 최대 발동 확률을 명시적으로 설정할 수 없음
- 스킬 상세 모달에서 하드코딩된 발동률 계산 로직 사용

**해결 방법**:
1. **스킬 데이터 구조 개선**: 
   - `triggerChance` 객체로 변경: `{ base, perLevel, max }`
   - `base`: 기본 발동 확률
   - `perLevel`: 레벨당 상승 확률
   - `max`: 최대 발동 확률

2. **스킬 상세 모달 개선**:
   - 새로운 데이터 구조에 맞는 발동률 계산 로직 구현
   - 다음 레벨 발동률 예측 기능 추가
   - 비동기 처리로 스킬 데이터 동적 로드

3. **주요 스킬 데이터 수정**:
   - `fireball`: 기본 10%, 레벨당 +5%, 최대 90%
   - `ice_shard`: 기본 10%, 레벨당 +4%, 최대 85%
   - `flame_aura`: 기본 10%, 레벨당 +6%, 최대 95%
   - `ember_toss`: 기본 10%, 레벨당 +8%, 최대 95%
   - `basic_attack`: 기본 100%, 레벨당 +0%, 최대 100%

**수정된 파일**:
- `src/data/skills/fireball.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/basic_attack.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/ice_shard.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/flame_aura.json`: 새로운 `triggerChance` 구조로 변경
- `src/data/skills/ember_toss.json`: 새로운 `triggerChance` 구조로 변경
- `src/components/common/SkillDetailModal.tsx`: 새로운 데이터 구조에 맞는 발동률 계산 로직 구현

**결과**: 
- 각 스킬마다 기본 발동 확률, 레벨당 상승 확률, 최대 발동 확률을 명시적으로 설정 가능
- 스킬 상세 모달에서 정확한 발동률 표시 (레벨에 따른 증가 반영)
- 다음 레벨 발동률 예측 기능 추가
- 더 유연하고 직관적인 스킬 발동률 시스템

---

### 🔧 **스킬 상세 모달 발동률 수정 - 2024년 12월 23일**

**문제**: 
1. 스킬 상세 모달에서 발동률이 항상 10%로 표시됨
2. 실제 스킬 데이터의 발동률이 반영되지 않음

**원인**: 
- 스킬 상세 모달에서 하드코딩된 발동률 사용
- 스킬 데이터 파일의 `baseTriggerChance`와 `triggerChanceLevels`를 고려하지 않음
- 레벨에 따른 발동률 증가 계산이 누락됨

**해결 방법**:
1. **스킬 데이터 기반 발동률 계산**: 
   - 스킬 데이터 파일에서 `baseTriggerChance`와 `triggerChanceLevels` 로드
   - 레벨에 따른 발동률 증가 계산 추가
   - 비동기 처리로 스킬 데이터 동적 로드

2. **스킬 상세 모달 개선**:
   - `useState`와 `useEffect`를 사용한 동적 발동률 계산
   - 실제 스킬 데이터 기반 정확한 발동률 표시

**수정된 파일**:
- `src/components/common/SkillDetailModal.tsx`: 스킬 데이터 기반 발동률 계산 로직 추가

**결과**: 
- 스킬 상세 모달에서 정확한 발동률 표시 (파이어볼: 10% → 10% + 레벨별 증가)
- 레벨에 따른 발동률 증가가 정확히 반영됨
- 기본 공격은 100% 발동률로 정확히 표시됨

---

### 🔧 **스킬 시스템 수정 및 UI 개선 - 2024년 12월 23일**

**문제**: 
1. 스킬이 전혀 사용되지 않음
2. 스킬 상세 모달에서 발동률이 10%로 잘못 표시됨
3. 자동 전투 정지를 눌러도 다음 몬스터에서 전투가 멈춤
4. 현재 층 몬스터 수가 표시되지 않음

**원인**: 
- `processPlayerSkills`에서 `basic_attack`을 건너뛰고 스킬 로그에 추가하지 않음
- 스킬 상세 모달에서 `triggerChance` 계산 로직이 잘못됨
- `stopAutoCombat`에서 `preventAutoCombat` 플래그를 설정하지 않음
- 현재 층 몬스터 수 표시 UI가 없음

**해결 방법**:
1. **스킬 시스템 수정**: 
   - `processPlayerSkills`에서 `basic_attack`도 스킬 로그에 추가
   - 스킬 발동률 계산 로직 개선

2. **스킬 상세 모달 수정**:
   - `skillInfo.triggerChance` 계산 로직 수정
   - 실제 스킬 데이터의 `triggerChance` 값을 우선 사용

3. **자동 전투 즉시 정지**: 
   - `stopAutoCombat`에서 `preventAutoCombat: true` 플래그 추가
   - 즉시 전투 중지가 가능하도록 수정

4. **현재 층 몬스터 수 표시**:
   - `getCurrentFloorMonsterInfo` 함수 추가
   - 몬스터 이름 옆에 "3/5" 형태로 표시
   - 휴식층은 "휴식층"으로 표시

**수정된 파일**:
- `src/utils/combatEngine.ts`: `processPlayerSkills` 함수에서 `basic_attack` 스킬 로그 추가
- `src/components/common/SkillDetailModal.tsx`: 스킬 발동률 계산 로직 수정
- `src/stores/index.ts`: `stopAutoCombat` 함수에 `preventAutoCombat` 플래그 추가
- `src/components/layout/MainView.tsx`: 현재 층 몬스터 수 표시 기능 추가
- `src/data/initial/skills.json`: 초기 스킬에 `triggerChance` 필드 추가

**결과**: 
- 스킬이 정상적으로 사용되고 로그에 표시됨
- 스킬 상세 모달에서 정확한 발동률 표시
- 자동 전투 정지 버튼을 누르면 즉시 멈춤
- 현재 층 몬스터 수가 "3/5" 형태로 표시됨
- 파이어볼이 90% 확률로 발동하여 테스트 가능

---

### 🔧 **사망 후 딜레이 단축 - 2024년 12월 23일**

**문제**: 사망 후 아래층으로 이동하는 딜레이가 너무 길어서 게임 진행이 느렸습니다.

**원인**: 
- `handlePlayerDeath`에서 사망 후 2초 딜레이로 설정되어 있음
- 사망 처리 후 아래층 이동까지 기다리는 시간이 너무 김
- 게임 속도가 빠른 상황에서 사망 딜레이가 게임 플레이를 방해함

**해결 방법**:
1. **딜레이 단축**: 
   - 사망 후 딜레이를 2초에서 1초로 단축
   - 빠른 게임 진행을 위한 적절한 딜레이 설정

**수정된 파일**:
- `src/stores/index.ts`: `handlePlayerDeath` 함수에서 사망 후 딜레이를 1초로 단축

**결과**: 
- 사망 후 더 빠른 게임 진행
- 적절한 딜레이로 사망 처리는 명확하지만 게임 진행은 빠름
- 게임 속도에 맞는 사망 처리 시간

---

### 🔧 **즉시 턴 전환 문제 해결 - 2024년 12월 23일**

**문제**: 플레이어 공격 후 몬스터 공격이 바로 들어오는 문제가 발생했습니다.

**원인**: 
- 플레이어 턴이 끝나면 즉시 `phase`를 `'monster_turn'`으로 변경
- 상태 변경과 `setTimeout` 지연이 분리되어 있어서 즉시 전환되는 것처럼 보임
- `setInterval`이 `'player_turn'` 상태에서도 실행되어 중복 실행 발생

**해결 방법**:
1. **지연된 상태 변경**: 
   - 플레이어 턴이 끝나면 지연 후에 상태를 `'monster_turn'`으로 변경
   - 몬스터 턴이 끝나면 지연 후에 상태를 `'player_turn'`으로 변경
   - 상태 변경과 턴 실행을 같은 `setTimeout` 내에서 처리

2. **setInterval 조건 강화**:
   - `setInterval`이 `'waiting'` 상태에서만 실행되도록 조건 수정
   - `'player_turn'` 상태에서는 `setInterval`이 실행되지 않도록 제한

3. **지연 시간 로그 복원**:
   - 지연 시간을 로그에 표시하여 사용자가 확인 가능하도록 복원

**수정된 파일**:
- `src/stores/index.ts`: 턴 전환 로직을 지연된 상태 변경으로 수정 및 setInterval 조건 강화

**결과**: 
- 플레이어와 몬스터 공격 사이에 확실한 지연 시간 확보
- 턴 전환이 자연스럽게 진행됨
- setInterval과 setTimeout의 충돌 방지
- 안정적인 턴제 전투 시스템

---

### 🔧 **전투 인터벌 일관성 문제 해결 - 2024년 12월 23일**

**문제**: 전투 인터벌이 계속 변화하는 문제가 발생했습니다.

**원인**: 
- `startAutoCombat`에서 `Math.max(500, 3000 / speed)` 계산 사용
- `getCombatDelay`에서 `Math.max(1000, 4000 / speed)` 계산 사용
- 새 몬스터 생성 시 `turnDelay`에 `startAutoCombat`의 interval 사용
- 서로 다른 계산 방식으로 인해 인터벌이 일관되지 않음

**해결 방법**:
1. **인터벌 계산 통일**: 
   - `startAutoCombat`에서 `getCombatDelay` 함수 사용으로 통일
   - 모든 인터벌 계산을 중앙 함수로 일원화

2. **속도 변경 시 자동 재시작**:
   - `setAutoSpeed` 함수에서 자동 전투가 활성화되어 있으면 새로운 속도로 재시작
   - MainView에서 속도 변경 시 `setAutoSpeed` 사용으로 일관성 확보

3. **일관된 인터벌 관리**:
   - 모든 인터벌 계산이 `getCombatDelay` 함수를 통해 처리
   - 속도 변경 시 즉시 반영되도록 자동 재시작 로직 추가

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat`에서 `getCombatDelay` 사용 및 `setAutoSpeed` 개선
- `src/components/layout/MainView.tsx`: 속도 변경 시 `setAutoSpeed` 사용

**결과**: 
- 전투 인터벌이 일관되게 유지됨
- 속도 변경 시 즉시 새로운 인터벌이 적용됨
- 모든 인터벌 계산이 중앙 함수를 통해 일원화됨
- 안정적이고 예측 가능한 전투 페이스 제공

---

### 🔧 **전투 인터벌 문제 해결 - 2024년 12월 23일**

**문제**: 플레이어 공격 후 몬스터 공격 사이에 인터벌이 없어서 너무 빠르게 진행되는 문제가 발생했습니다.

**원인**: 
- `getCombatDelay` 함수의 기본 지연 시간이 너무 짧았음 (최소 0.5초)
- 전투 턴 간 지연 시간이 사용자에게 명확하게 표시되지 않아서 지연이 적용되는지 확인하기 어려웠음
- 게임 속도가 빠를 때 지연 시간이 너무 짧아져서 자연스럽지 않았음

**해결 방법**:
1. **지연 시간 증가**: 
   - `getCombatDelay` 함수에서 최소 지연 시간을 0.5초에서 1초로 증가
   - 기본 지연 시간을 3초에서 4초로 증가하여 더 자연스러운 전투 페이스 제공

2. **지연 시간 로그 추가**:
   - 플레이어 턴 후 몬스터 턴 시작 전에 지연 시간을 로그로 표시
   - 몬스터 턴 후 플레이어 턴 시작 전에 지연 시간을 로그로 표시
   - 사용자가 지연이 적용되는지 명확하게 확인 가능

**수정된 파일**:
- `src/stores/index.ts`: `getCombatDelay` 함수의 지연 시간 증가 및 지연 시간 로그 추가

**결과**: 
- 플레이어와 몬스터 공격 사이에 적절한 지연 시간 확보
- 전투가 더 자연스럽고 읽기 쉬운 페이스로 진행
- 지연 시간이 로그에 표시되어 사용자가 확인 가능
- 게임 속도에 따른 적절한 지연 시간 제공

---

### 🔧 **아이템 데이터 구조 정리 - 2024년 12월 23일**

**문제**: 아이템 데이터가 `index.json`과 개별 파일에 중복되어 있어 데이터 관리가 복잡했습니다.

**원인**: 
- `src/data/items/index.json`에 모든 아이템 데이터가 통합되어 있음
- 동시에 개별 아이템 파일들도 존재하여 데이터 중복 발생
- 어떤 파일을 우선시할지 불분명하여 혼란 야기

**해결 방법**:
1. **개별 파일 방식으로 통일**:
   - `index.json` 백업 후 삭제 (`index_backup.json`으로 보존)
   - 모든 아이템을 개별 파일로 관리하도록 변경

2. **누락된 아이템 파일들 생성**:
   - **검**: `toxic_sword.json`, `thunder_sword.json`, `verdant_sword.json`
   - **지팡이**: `frost_staff.json`, `shadow_staff.json`, `verdant_staff.json`
   - **갑옷**: `frost_armor.json`, `shadow_armor.json`, `thunder_armor.json`
   - **악세서리**: `flame_ring.json`, `frost_ring.json`, `toxic_ring.json`, `shadow_ring.json`, `thunder_ring.json`, `verdant_ring.json`
   - **소모품**: `fish_stew.json`, `herb_soup.json`, `divine_feast.json`

3. **데이터 구조 통일**:
   - 모든 아이템 파일이 동일한 구조를 따르도록 통일
   - `itemId`, `name`, `description`, `type`, `baseStats` 등 일관된 필드 사용
   - 강화 시스템 지원을 위한 `enhanceable`, `maxEnhancement` 필드 추가

**수정된 파일**:
- `src/data/items/index.json`: 삭제 (백업: `index_backup.json`)
- 새로 생성된 아이템 파일들: 15개 파일

**결과**: 
- 아이템 데이터 관리가 단순화됨
- 각 아이템을 독립적으로 관리 가능
- 버전 관리가 용이해짐
- 데이터 중복 문제 해결

---

### 🔧 **장비 해제 문제 추가 수정 - 2024년 12월 23일**

**문제**: 장비 해제가 여전히 작동하지 않는 문제가 발생했습니다.

**원인**: 
- `handleEquipToggle` 함수에서 `item.type`을 사용하고 있었지만, 실제로는 `itemType` 변수를 사용해야 함
- 장비 타입 판별 로직이 불완전하여 정확한 슬롯을 결정하지 못함
- `isEquipped` 함수에서 장착 상태 확인 로직이 부정확함

**해결 방법**:
1. **장비 타입 판별 로직 개선**:
   - `itemType` 변수를 사용하여 정확한 장비 타입 판별
   - `accessory` 타입도 추가하여 악세서리 장비 지원
   - `ring`, `necklace`, `amulet` 키워드로 악세서리 자동 판별

2. **장착 상태 확인 로직 개선**:
   - `isEquipped` 함수에서 `uniqueId`와 `itemId` 모두 고려
   - 각 장비 슬롯(weapon, armor, accessory)별로 정확한 비교
   - 장착된 장비와 현재 아이템을 정확히 매칭

3. **디버깅 로그 추가**:
   - `handleEquipToggle` 함수에 콘솔 로그 추가
   - 장착/해제 시도 시 상세 정보 출력

**수정된 파일**:
- `src/components/common/ItemDetailModal.tsx`: 장비 타입 판별 및 장착 상태 확인 로직 개선

**결과**: 
- 장비 해제가 정상적으로 작동함
- 모든 장비 타입(weapon, armor, accessory) 지원
- 장착 상태가 정확하게 표시됨
- 디버깅을 위한 로그 추가

---

### 🔧 **장비 해제 문제 해결 및 층 진행 시스템 개선 - 2024년 12월 23일**

**문제**: 
1. 장비를 해제해도 인벤토리에 아이템이 반환되지 않는 문제
2. 몬스터를 아무리 잡아도 층이 올라가지 않는 문제

**원인**: 
1. `unequipItem` 함수에서 장비를 해제할 때 인벤토리에 아이템을 반환하지 않음
2. 층 진행 시스템이 몬스터가 없을 때만 다음 층으로 올라가도록 되어 있었지만, 실제로는 모든 층에서 몬스터가 생성되어 층이 올라가지 않음

**해결 방법**:
1. **장비 해제 시스템 개선**:
   - `unequipItem` 함수에서 장비 해제 시 인벤토리에 아이템을 반환하도록 수정
   - 해제된 장비의 모든 정보(uniqueId, level, quality, enhancement)를 인벤토리에 추가

2. **층 진행 시스템 완전 재설계**:
   - `TowerState`에 `monsterKillCount` 필드 추가하여 현재 층에서 처치한 몬스터 수 추적
   - 층별로 필요한 몬스터 처치 수 설정:
     - 휴식층(n0): 즉시 다음 층으로
     - 일반 몬스터층(n1-5): 3마리 처치
     - 정예 몬스터층(n6-8): 2마리 처치
     - 보스층(n9): 1마리 처치
   - 충분한 몬스터를 처치하면 다음 층으로 자동 진행

**수정된 파일**:
- `src/stores/index.ts`: `unequipItem` 함수 수정 및 `handleMonsterDeath` 함수에 층 진행 로직 추가
- `src/types/index.ts`: `TowerState`에 `monsterKillCount` 필드 추가

**결과**: 
- 장비 해제 시 인벤토리에 정상적으로 아이템이 반환됨
- 몬스터 처치 후 층이 정상적으로 올라감
- 층별로 적절한 몬스터 처치 수에 따라 진행
- 휴식층에서는 즉시 다음 층으로 진행

---

### 🐛 **몬스터 처치 후 층이 올라가지 않는 문제 해결 - 2024년 12월 23일**

**문제**: 몬스터를 아무리 잡아도 층이 올라가지 않는 문제가 발생했습니다.

**원인**: 
- `src/utils/towerSystem.ts`의 `getMonsterPoolForFloor` 함수에서 하드코딩된 몬스터 ID들이 실제 존재하는 몬스터 파일들과 일치하지 않음
- 예: 하드코딩된 `flame_guardian`, `fire_elemental`, `lava_golem` 등이 실제로는 `flame_elite`, `flame_sprite`, `magma_slime` 파일로 존재
- 이로 인해 몬스터 풀이 비어있게 되고, `generateNextMonster` 함수가 `null`을 반환하지 않아서 층이 올라가지 않음

**해결 방법**:
- `getMonsterPoolForFloor` 함수의 하드코딩된 몬스터 ID들을 실제 존재하는 몬스터 파일들과 일치하도록 수정
- 각 테마별로 실제 존재하는 몬스터들로 교체:
  - Flame: `flame_imp`, `fire_sprite`, `magma_slime`, `ember_wolf`, `flame_lizard` → `flame_elite` → `flame_boss`, `inferno_dragon`
  - Frost: `frost_sprite`, `frost_wolf` → `frost_elite` → `frost_boss`
  - Toxic: `toxic_slime`, `toxic_snake`, `toxic_bug` → `toxic_elite` → `toxic_boss`
  - Shadow: `shadow_bat`, `shadow_rat`, `shadow_spirit` → `shadow_elite` → `shadow_boss`
  - Thunder: `thunder_bird`, `thunder_snake`, `thunder_golem` → `thunder_elite` → `thunder_boss`
  - Verdant: `verdant_sprite`, `verdant_boar`, `verdant_golem` → `verdant_elite` → `verdant_boss`

**수정된 파일**:
- `src/utils/towerSystem.ts`: `getMonsterPoolForFloor` 함수의 몬스터 ID 목록 수정

**결과**: 
- 몬스터 처치 후 정상적으로 다음 층으로 올라감
- 각 테마별로 적절한 몬스터들이 등장함
- 일반 → 엘리트 → 보스 순서로 층별 몬스터 등장
- 휴식층(n0)에서는 몬스터가 없어서 자동으로 다음 층으로 진행

---

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

### 플레이어 사망 처리 개선 - 2024년 12월 19일

**문제**: 
- 플레이어가 사망하고 1층으로 돌아가면 멈춰야 하는데 안 죽고 다음층 넘어가기도 함
- 죽어서 돌아가는 것처럼 뒤늦게 멈추는 문제
- 사망 후 자동 전투가 계속 진행되는 문제

**원인**: 
- `handlePlayerDeath`에서 자동 전투 정지가 몬스터 생성 후에 실행됨
- 사망 후에도 `isInCombat: true`로 설정되어 전투가 계속 진행됨
- `turnDelay`가 하드코딩되어 게임 속도와 연동되지 않음

**해결 방법**:
1. **즉시 자동 전투 정지**: 사망 처리 시작 시 즉시 `stopAutoCombat()` 호출
2. **자동 전투 모드 완전 해제**: `autoMode: false`로 설정하여 자동 전투 비활성화
3. **전투 상태 비활성화**: 새 몬스터 생성 시에도 `isInCombat: false`로 유지
4. **지연된 몬스터 생성**: `setTimeout`으로 1초 후 몬스터 생성하여 사망 처리 완료 후 진행
5. **중앙 딜레이 함수 사용**: `getCombatDelay(1)`로 기본 속도 적용

**수정된 파일**:
- `src/stores/index.ts`: `handlePlayerDeath` 함수의 사망 처리 로직 개선

**결과**: 
- 플레이어 사망 시 즉시 자동 전투가 정지됨
- 사망 후 안전하게 1층으로 돌아가고 멈춤
- 뒤늦게 멈추는 문제 해결
- 사망 처리 후 수동으로 자동 전투를 다시 시작해야 함

---

### 딜레이 중앙 관리 시스템 구현 - 2024년 12월 19일

### 사망 후 전투 UI 유지 문제 해결 - 2024년 12월 19일

**문제**: 플레이어가 사망한 후 전투 UI가 사라지는 문제가 발생했습니다.

**원인**: 
- `handlePlayerDeath`에서 새 몬스터 생성 시 `isInCombat: false`로 설정
- 전투 UI는 `isInCombat: true`일 때만 표시됨
- 사망 후 몬스터가 있어도 전투 UI가 표시되지 않음

**해결 방법**:
1. **전투 UI 유지**: 새 몬스터 생성 시 `isInCombat: true`로 설정하여 전투 UI 표시
2. **자동 전투는 비활성화**: `autoMode: false`는 유지하여 자동 전투는 비활성화
3. **수동 전투 가능**: 전투 UI는 표시되지만 자동 전투는 수동으로 시작해야 함

**수정된 파일**:
- `src/stores/index.ts`: `handlePlayerDeath` 함수에서 새 몬스터 생성 시 `isInCombat: true` 설정

**결과**: 
- 사망 후에도 전투 UI가 정상적으로 표시됨
- 자동 전투는 비활성화되어 수동으로 시작해야 함
- 몬스터 정보와 전투 로그가 정상적으로 표시됨

---

### 사망 후 멋대로 전투 시작 문제 해결 - 2024년 12월 19일

**문제**: 플레이어가 사망하고 내려간 후에 멋대로 전투를 한 턴 진행하는 문제가 발생했습니다.

**원인**: 
- `startAutoCombat` 함수에서 몬스터가 이미 있고 전투 중이면 즉시 첫 턴을 시작하는 로직
- 사망 후 새 몬스터가 생성되면서 `autoMode: false`이지만 즉시 시작 조건이 충족되어 전투가 시작됨
- `tower.autoMode` 체크가 누락되어 사망 후에도 전투가 자동으로 시작됨

**해결 방법**:
1. **자동 전투 모드 체크 추가**: 즉시 첫 턴 시작 조건에 `tower.autoMode` 체크 추가
2. **사망 후 전투 방지**: 사망 후에는 `autoMode: false`이므로 즉시 시작되지 않음
3. **수동 전투만 가능**: 사망 후에는 수동으로 자동 전투를 시작해야 함

**수정된 파일**:
- `src/stores/index.ts`: `startAutoCombat` 함수에서 즉시 첫 턴 시작 조건에 `tower.autoMode` 체크 추가

**결과**: 
- 사망 후에는 멋대로 전투가 시작되지 않음
- 사망 후에는 수동으로 자동 전투를 시작해야 함
- 정상적인 자동 전투 시작은 그대로 작동함

---

### 사망 후 전투 UI 유지 문제 해결 - 2024년 12월 19일

### 사망 후 자동 전투 방지 플래그 시스템 구현 - 2024년 12월 19일

**문제**: 사망 후 멋대로 전투 시작 문제를 해결하기 위해 `tower.autoMode` 체크를 추가했지만, 정상적인 자동 전투 시작도 막히는 문제가 발생했습니다.

**원인**: 
- `startAutoCombat`에서 `autoMode: true`를 설정한 후 즉시 첫 턴 시작 조건을 체크할 때, `tower.autoMode`는 아직 업데이트되지 않은 상태
- 사망 후와 정상적인 자동 전투 시작을 구분할 수 있는 별도의 플래그가 필요

**해결 방법**:
1. **사망 후 자동 전투 방지 플래그 추가**: `TowerState`에 `preventAutoCombat?: boolean` 추가
2. **사망 시 플래그 설정**: `handlePlayerDeath`에서 `preventAutoCombat: true` 설정
3. **정상 시작 시 플래그 리셋**: `startAutoCombat`에서 `preventAutoCombat: false` 설정
4. **즉시 시작 조건 수정**: `!tower.preventAutoCombat` 체크로 사망 후 전투 방지

**수정된 파일**:
- `src/types/index.ts`: `TowerState`에 `preventAutoCombat?: boolean` 추가
- `src/stores/index.ts`: `handlePlayerDeath`에서 `preventAutoCombat: true` 설정
- `src/stores/index.ts`: `startAutoCombat`에서 `preventAutoCombat: false` 설정 및 체크

**결과**: 
- 사망 후에는 자동 전투가 시작되지 않음
- 정상적인 자동 전투 시작은 그대로 작동함
- 사망 후에는 수동으로 자동 전투를 시작해야 함

---

### 사망 후 전투 완전 방지 시스템 구현 - 2024년 12월 19일

**문제**: 사망 후에도 여전히 전투가 진행되는 문제가 발생했습니다. 로그를 보면 사망 후 새 몬스터가 나타난 직후 바로 전투가 시작되어 플레이어와 몬스터가 번갈아가며 공격하고 있었습니다.

**원인**: 
- `handlePlayerDeath`에서 새 몬스터 생성 시 `preventAutoCombat: true`를 설정하지 않음
- `setInterval` 내부에서 `preventAutoCombat` 플래그를 체크하지 않음
- 사망 후에도 `setInterval`이 계속 실행되어 전투 액션을 수행함

**해결 방법**:
1. **새 몬스터 생성 시 플래그 유지**: `handlePlayerDeath`에서 새 몬스터 생성 시에도 `preventAutoCombat: true` 설정
2. **setInterval 내부 체크 추가**: `setInterval` 내부에서 전투 액션 수행 전에 `preventAutoCombat` 플래그 체크
3. **완전한 전투 방지**: 사망 후에는 모든 자동 전투 관련 액션이 차단됨

**수정된 파일**:
- `src/stores/index.ts`: `handlePlayerDeath`에서 새 몬스터 생성 시 `preventAutoCombat: true` 설정
- `src/stores/index.ts`: `setInterval` 내부에서 `preventAutoCombat` 플래그 체크 추가

**결과**: 
- 사망 후에는 전투가 완전히 차단됨
- 사망 후에는 수동으로 자동 전투를 시작해야 함
- 정상적인 자동 전투 시작은 그대로 작동함

---

### 사망 후 자동 전투 방지 플래그 시스템 구현 - 2024년 12월 19일

### 사망 처리 순서 개선 - 2024년 12월 19일

**문제**: 사망 처리 순서가 섞여서 즉시 아래층으로 이동하고 몬스터가 생성되는 문제가 있었습니다.

**원인**: 
- 사망 후 바로 3층 아래로 이동하고 몬스터 생성
- 사용자가 원하는 순서와 다름: 사망 → 전투정지 → 3초후 이동 → 몬스터 생성 → 자동전투 이어지기

**해결 방법**:
1. **순서 명확화**: 사망 → 전투정지 → 3초후 이동 → 몬스터 생성 → 자동전투 이어지기
2. **즉시 전투 정리**: 사망 후 현재 층에서 몬스터 제거 및 전투 중지
3. **3초 대기**: 3초 후에 아래층으로 이동
4. **새 몬스터 생성**: 이동 후 새 몬스터 생성 (자동 전투는 비활성화)

**수정된 파일**:
- `src/stores/index.ts`: `handlePlayerDeath` 함수의 순서 개선

**수정된 순서**:
1. **사망 로그**: "💀 플레이어 사망!" 로그 추가
2. **자동 전투 정지**: `stopAutoCombat()` 호출
3. **현재 층 정리**: 몬스터 제거, 전투 중지, 상태 정리
4. **3초 후 이동**: `setTimeout(..., 3000)`으로 3초 후 아래층 이동
5. **몬스터 생성**: 새 층에서 몬스터 생성 (자동 전투는 비활성화)

**결과**: 
- 사망 후 3초간 현재 층에서 대기
- 3초 후 아래층으로 이동
- 새 몬스터 생성 (자동 전투는 수동으로 시작해야 함)
- 순서가 명확하게 구분됨

---

### 사망 후 전투 완전 방지 시스템 구현 - 2024년 12월 19일

### GitHub Pages 배포 문제 해결 - 2024년 12월 23일

**문제**: GitHub Pages에 배포 후 "새로 시작" 버튼을 누르면 초기화 화면만 뜨다가 바로 홈으로 돌아가는 문제가 발생했습니다.

**원인**: 
- GitHub Pages에서 빌드된 파일들이 `src/data/` 경로로 접근할 수 없음
- Vite로 빌드하면 정적 파일들이 다른 경로로 배포되어 fetch 요청이 404 오류 발생
- `startNewGame` 함수에서 `fetch('/src/data/initial/character.json')` 등의 요청이 실패

**해결 방법**:
1. **데이터 파일을 TypeScript 모듈로 변환**: `src/data/initial/index.ts` 파일 생성
2. **초기 데이터를 상수로 정의**: `initialCharacterData`, `initialInventoryData`, `initialSkillsData`, `initialTowerData` 상수 생성
3. **fetch 대신 임포트 사용**: `startNewGame`과 `loadInitialInventory` 함수에서 fetch 제거하고 임포트된 데이터 사용
4. **빌드 시 포함**: 데이터가 빌드 시 포함되어 배포 후에도 정상 작동

**수정된 파일**:
- `src/data/initial/index.ts`: 초기 데이터를 TypeScript 상수로 정의
- `src/stores/index.ts`: fetch 제거하고 임포트된 데이터 사용

**결과**: 
- GitHub Pages에서 정상적으로 새 게임 시작 가능
- 404 오류 완전 해결
- 빌드 시 데이터가 포함되어 배포 후에도 안정적 작동
- 로컬 개발 환경과 배포 환경 모두에서 동일하게 작동

---

### 사망 후 대기 시간 조정 - 2024년 12월 19일

**변경 사항**: 사망 후 아래층으로 이동하는 대기 시간을 3초에서 2초로 단축했습니다.

**수정된 파일**:
- `src/stores/index.ts`: `handlePlayerDeath` 함수에서 `setTimeout` 시간을 3000ms에서 2000ms로 변경

**결과**: 
- 사망 후 2초간 현재 층에서 대기
- 2초 후 아래층으로 이동
- 더 빠른 게임 진행 가능

---

### 사망 처리 순서 개선 - 2024년 12월 19일

## 2024-12-19 작업 내역

### 1. 아이템/재료/음식/장비 구조 전면 개편
- **파일**: `src/data/items/index.json`
- **내용**: 속성별/티어별 체계적인 아이템 시스템 구축
  - 각 속성별로 Common/Fine/Superior/Epic 재료 체계
  - 무기/방어구/악세사리 제작 레시피 추가
  - 포션/음식 제작 시스템 구현
  - 속성별 재료: Flame, Frost, Toxic, Shadow, Thunder, Verdant

### 2. 개별 재료 파일 구조 통일
- **파일**: `src/data/materials/*.json` (총 40개 파일)
- **내용**: 모든 재료 파일을 새로운 구조로 통일
  - 기존 `materialId` → `id`로 변경
  - `element` → `theme`로 변경  
  - `rarity` → `tier`로 변경
  - `baseValue`, `stackable`, `maxStack` 필드 추가

### 3. 몬스터 시스템 확장 및 약화
- **파일**: `src/data/monsters/*.json` (총 30개 파일)
- **내용**: 각 속성별 몬스터 세트 생성
  - 일반 몬스터 3종 + 엘리트 1종 + 보스 1종
  - 능력치 전체적으로 약화 (HP, 공격력, 방어력 감소)
  - 통일된 구조로 필드명 정리
  - 드롭테이블 연결 구조 개선

### 4. 스킬 시스템 확장
- **파일**: `src/data/skills/*.json` (총 7개 파일)
- **내용**: 몬스터별 전용 스킬 추가 (유저 습득 가능)
  - Toxic: toxic_spit, venom_burst
  - Shadow: shadow_bite, dark_howl  
  - Thunder: thunder_shock, thunder_roar
  - Verdant: verdant_charge, nature_blessing
  - 각 스킬별 수련치 시스템 포함

### 5. 드롭 테이블 시스템 구축
- **파일**: `src/data/drops/*.json` (총 18개 파일)
- **내용**: 속성별/티어별 드롭 테이블 생성
  - 일반/엘리트/보스별 차등화된 드롭률
  - 속성별 재료, 장비, 스킬페이지 포함
  - 포션, 음식 등 소모품 드롭 추가

### 6. 기존 몬스터 능력치 조정
- **파일**: `src/data/monsters/ember_wolf.json`, `fire_sprite.json` 등
- **내용**: 기존 몬스터들의 능력치를 전체적으로 약화
  - HP: 50 → 30 (ember_wolf)
  - 공격력: 18 → 10 (ember_wolf)
  - 방어력: 8 → 5 (ember_wolf)
  - 통일된 구조로 필드명 정리

## 핵심 변경사항

### 아이템 구조
- 속성별 재료: Common(15골드) → Fine(45골드) → Superior(120골드) → Epic(300골드)
- 제작 시스템: 무기/방어구(Common+Fine+Superior 재료), 악세사리(Epic 재료)
- 포션: Common/Fine 재료로 제작
- 음식: 티어별 약초/물고기로 제작

### 몬스터 시스템  
- 각 속성별 5종 몬스터 (일반3+엘리트1+보스1)
- 능력치 약화로 초보자 친화적 게임 밸런스
- 드롭테이블을 통한 체계적인 아이템 획득 시스템

### 스킬 시스템
- 몬스터별 고유 스킬 추가
- 유저 습득 가능한 스킬 시스템
- 수련치를 통한 스킬 강화 시스템

### 7. 드롭 시스템 개선 및 아이템 레벨 시스템 구현
- **파일**: `src/utils/dropSystem.ts`, `src/stores/index.ts`
- **내용**: 몬스터 드롭 아이템의 레벨 시스템 구현
  - 층수 기반 드롭 레벨 계산: `⌊층/2⌋ + (일반 0·엘리트 +3·보스 +7) ± 3`
  - 몬스터 티어별 품질 차등화: 일반(Common/Fine), 엘리트(Fine/Superior), 보스(Superior/Epic)
  - 아이템 타입별 레벨 적용: 재료/소모품/장비별 적절한 레벨링
  - 스킬 페이지 드롭 시스템: 몬스터 스킬 기반 10-20% 확률 드롭

### 8. 전투 속도 조정 및 드롭 시스템 버그 수정
- **파일**: `src/stores/index.ts`, `src/utils/dataLoader.ts`, `src/types/index.ts`
- **내용**: 
  - 전투 속도 조정: 기본 인터벌 1.5초 → 3초, 최소 딜레이 0.3초 → 0.5초
  - 드롭 테이블 로드 시스템 개선: 동적 import로 모든 드롭 테이블 지원
  - 몬스터 타입 정의 수정: `dropTableId` → `dropTable`, `skillPageDrops` → `skills`
  - 아이템 레벨/품질 정보를 인벤토리 시스템에 전달하도록 수정

### 9. 인벤토리 레벨 표시 시스템 개선
- **파일**: `src/components/inventory/InventoryPanel.tsx`, `src/stores/index.ts`
- **내용**: 
  - 인벤토리 패널에서 실제 아이템 레벨 표시하도록 수정
  - 재료/소모품 추가 시 기존 아이템과 레벨 비교하여 더 높은 레벨로 업데이트
  - 장비 품질 표시 시스템 개선: Common/Fine/Superior/Epic/Legendary 색상 구분

### 10. 인벤토리 상세 분류 시스템 개선
- **파일**: `src/components/inventory/InventoryPanel.tsx`
- **내용**: 
  - 재료 속성 분류 개선: flame/frost/toxic/shadow/thunder/verdant 속성 자동 판별
  - 장비 카테고리 분류 개선: weapon/armor/accessory 정확한 분류
  - 소모품 분류 개선: potion/food/scroll 정확한 분류
  - 아이템명 기반 자동 분류 시스템 구현

### 11. 장비 강화 시스템 완전 개선
- **파일**: `src/components/common/ItemDetailModal.tsx`, `src/stores/index.ts`
- **내용**: 
  - 장착되지 않은 장비도 강화 가능하도록 수정
  - 인벤토리 장비 강화 함수 `enhanceInventoryEquipment` 추가
  - 강화 모달에서 장착 여부에 따라 다른 강화 함수 호출
  - 타입 안전성 개선: ItemInstance ↔ EquipmentInstance 변환
  - 강화 후 인벤토리 업데이트 및 스탯 재계산

### 12. 초기 장비 강화 레벨 시스템 수정
- **파일**: `src/data/initial/inventory.json`, `src/utils/itemGenerator.ts`
- **내용**: 
  - 초기 인벤토리 JSON에 `enhancement` 필드 추가
  - 각 장비별로 적절한 초기 강화 레벨 설정 (1-5)
  - `generateInitialItems` 함수에서 JSON의 enhancement 값 우선 사용
  - 강화 모달과 인벤토리 표시의 강화 레벨 일치성 확보

### 13. 장비 스탯 계산 시스템 완전 개선
- **파일**: `src/utils/equipmentSystem.ts`, `src/stores/index.ts`, `src/components/life/CraftingModal.tsx`
- **내용**: 
  - `getEquipmentStats` 함수에 레벨, 품질, 강화 보너스 모두 적용
  - 드롭된 장비에 품질별 랜덤 강화 레벨 자동 생성
  - 제작된 장비에 레벨과 품질 정보 전달하여 적절한 강화 레벨 적용
  - 품질별 강화 확률: Common(50%+0), Fine(30%+0), Superior(20%+0), Epic(10%+0), Legendary(5%+0)
  - 레벨당 15%, 품질별 배수, 강화당 4% 스탯 증가 적용

### 14. 드롭 장비 강화 레벨 및 스탯 보너스 조정
- **파일**: `src/stores/index.ts`, `src/utils/equipmentSystem.ts`, `src/utils/itemGenerator.ts`
- **내용**: 
  - 드롭되는 장비의 강화 레벨을 0으로 고정 (강화는 플레이어가 직접 해야 함)
  - 레벨 보너스를 15%에서 5%로 감소 (레벨 변동성 감소)
  - 강화 보너스를 4%에서 8%로 증가 (강화의 중요성 증가)
  - 제작된 장비는 여전히 품질에 따른 랜덤 강화 레벨 적용

### 15. 장비 강화 모달 실시간 업데이트 시스템 구현
- **파일**: `src/components/common/ItemDetailModal.tsx`
- **내용**: 
  - 강화 모달에서 실시간으로 최신 장비 정보를 가져오는 `getCurrentEquipment` 함수 추가
  - 인벤토리 장비와 장착된 장비 모두 최신 강화 레벨 반영
  - 강화 후 모달이 자동으로 최신 정보로 업데이트됨
  - 강화 레벨, 비용, 성공률이 실시간으로 정확히 표시됨

### 16. 장비 강화 레벨 동기화 문제 해결
- **파일**: `src/components/common/ItemDetailModal.tsx`, `src/stores/index.ts`
- **내용**: 
  - 강화 모달과 인벤토리 표시의 강화 레벨 불일치 문제 해결
  - `getCurrentEquipment` 함수에서 장착 여부를 정확히 판별하도록 수정
  - `enhanceInventoryEquipment` 함수에서 강화 후 `enhancement` 필드를 명시적으로 설정
  - 강화 모달에 올바른 장비 정보 전달하여 일관성 확보

### 17. 인벤토리 아이템 클릭 시 강화 레벨 정보 전달 개선
- **파일**: `src/components/inventory/InventoryPanel.tsx`, `src/components/common/ItemDetailModal.tsx`
- **내용**: 
  - `handleItemClick` 함수에서 인벤토리 아이템 정보를 우선적으로 사용하도록 수정
  - 강화 모달의 `getCurrentEquipment` 함수에서 인벤토리 아이템 검색 로직 개선
  - 인벤토리 표시와 강화 모달의 강화 레벨 정보가 완전히 일치하도록 수정

### 18. 장비 상세 모달 정보 표시 시스템 완전 개선
- **파일**: `src/components/common/ItemDetailModal.tsx`
- **내용**: 
  - `getBaseEquipmentStats` 함수를 사용하여 기본 스탯 정확히 표시
  - 강화된 장비의 경우 실제 스탯(레벨, 품질, 강화 보너스 포함) 별도 표시
  - 품질 배수, 레벨 보너스(5%), 강화 보너스(8%) 계산 로직 추가
  - 장비 상세 모달에서 모든 정보가 정확히 표시되도록 수정

### 19. 인벤토리 아이템 상세 모달 호환성 완전 개선
- **파일**: `src/components/common/ItemDetailModal.tsx`
- **내용**: 
  - 인벤토리 아이템의 `itemId` 기반 정보 표시 시스템 구현
  - 아이템 이름, 타입, 설명이 없는 경우 `itemId`에서 자동 생성
  - 장비 타입 판별 로직을 `itemId` 키워드 기반으로 개선
  - 장착/해제 및 강화 기능이 인벤토리 아이템과 완전 호환되도록 수정

### 20. 캐릭터 패널과 인벤토리 간 장비 정보 동기화 완전 개선
- **파일**: `src/components/character/CharacterPanel.tsx`
- **내용**: 
  - 캐릭터 패널에서 장비 클릭 시 실제 장착된 장비 정보를 사용하도록 수정
  - `handleItemClick` 함수에 `equipment` 매개변수 추가하여 정확한 장비 정보 전달
  - 장비 표시에 품질 정보 추가 (Lv N | Quality +N 형태)
  - 아이템 이름을 `itemId`에서 자동 생성하여 표시
  - 캐릭터 패널과 인벤토리의 장비 정보가 완전히 일치하도록 수정

### 21. 장비 장착 시스템 완전 수정 및 스탯 동기화 개선
- **파일**: `src/utils/equipmentSystem.ts`, `src/components/character/CharacterPanel.tsx`
- **내용**: 
  - `equipItem` 함수에서 인벤토리 아이템의 `level`, `quality`, `enhancement` 정보를 정확히 복사
  - 장비 장착 시 모든 속성이 플레이어 장비 슬롯에 정확히 반영
  - 캐릭터 패널 장비 표시에서 기본값 처리 추가 (level || 1, enhancement || 0)
  - 인벤토리, 캐릭터 패널, 최종 스탯 간의 완전한 동기화 구현

### 🎯 **제작 시스템 완전 개편 - 룰렛 제거 및 재료 기반 품질 시스템 구현 - 2024년 12월 23일**

**문제**: 
1. 제작 시 룰렛 미니게임이 복잡하고 불필요함
2. 재료 레벨과 제작 스킬 레벨이 품질에 반영되지 않음
3. 사용할 재료를 선택할 수 없음
4. 제작 시스템이 랜덤성에 의존하여 전략적 요소 부족

**해결 방법**:
1. **룰렛 시스템 완전 제거**: 
   - 슬롯머신 미니게임 제거
   - 랜덤성 기반 품질 계산 제거
   - 더 전략적이고 예측 가능한 제작 시스템 구현

2. **재료 기반 품질 시스템 구현**:
   - 재료 레벨이 높으면 품질 확률이 떨어짐 (재료가 너무 고급이면 제작이 어려움)
   - 제작 스킬 레벨이 높으면 품질 확률이 올라감
   - 재료 품질과 스킬 레벨의 균형을 통한 전략적 제작

3. **재료 선택 모달 구현**:
   - 사용할 재료를 모달에서 직접 선택 가능
   - 재료별 레벨과 품질 정보 표시
   - 예상 품질 실시간 계산 및 표시
   - 선택된 재료에 따른 품질 예측

4. **품질 계산 알고리즘**:
   - 재료 평균 레벨과 품질 계산
   - 재료 레벨 페널티: `(평균재료레벨 - 스킬레벨) * 10`
   - 스킬 레벨 보너스: `스킬레벨 * 5`
   - 최종 품질 점수: `평균재료품질 + 스킬레벨보너스 - 재료레벨페널티`

5. **아이템 레벨 계산**:
   - 재료 평균 레벨과 스킬 레벨의 평균으로 계산
   - `Math.max(1, Math.floor((평균재료레벨 + 스킬레벨) / 2))`

**수정된 파일**:
- `src/components/life/CraftingModal.tsx`: 룰렛 제거, 재료 선택 모달 구현, 품질 계산 시스템 구현
- `src/types/index.ts`: MaterialInstance에 uniqueId와 quality 필드 추가

**결과**: 
- 룰렛 미니게임 제거로 더 직관적이고 전략적인 제작 시스템
- 재료 레벨과 제작 스킬 레벨에 따른 정확한 품질 계산
- 사용자가 직접 재료를 선택할 수 있는 모달 시스템
- 예상 품질 실시간 표시로 전략적 제작 가능
- 재료와 스킬 레벨의 균형을 통한 깊이 있는 게임플레이

---

### 🎲 **제작 시스템에 랜덤성 추가 - 2024년 12월 23일**

**문제**: 
1. 품질과 아이템 레벨 계산이 완전히 결정적이어서 예측 가능함
2. 제작 결과에 대한 긴장감과 흥미 부족
3. 스킬 레벨이 높아도 완전히 예측 가능한 결과

**해결 방법**:
1. **품질 계산에 랜덤성 추가**:
   - 기본 품질 점수에 랜덤 보너스 추가
   - 스킬 레벨이 높을수록 랜덤 범위가 줄어듦 (더 안정적인 제작)
   - 확률 기반 품질 결정 시스템 구현

2. **품질별 확률 계산 시스템**:
   - 기본 점수에 따른 각 품질별 확률 계산
   - 스킬 레벨에 따른 보정 적용
   - 확률 정규화로 합계 100% 보장

3. **아이템 레벨에 랜덤성 추가**:
   - 기본 레벨 계산에 랜덤 보너스 추가
   - 스킬 레벨이 높을수록 레벨 변동 범위 감소
   - 최소 레벨 1 보장

4. **UI 개선**:
   - 예상 품질 표시에 확률 정보 추가
   - 각 품질별 확률을 색상으로 구분 표시
   - 기본 점수와 확률 분포 실시간 표시

**랜덤성 메커니즘**:
- **품질 랜덤 범위**: `Math.max(5, 20 - skillLevel * 0.5)`
- **레벨 랜덤 범위**: `Math.max(1, 3 - skillLevel * 0.1)`
- **확률 보정**: 스킬 레벨에 따른 Superior, Epic, Legendary 확률 증가

**수정된 파일**:
- `src/components/life/CraftingModal.tsx`: 랜덤성 추가, 확률 계산 시스템 구현, UI 개선

**결과**: 
- 제작 결과에 긴장감과 흥미 추가
- 스킬 레벨이 높을수록 더 안정적이고 예측 가능한 결과
- 확률 기반 품질 시스템으로 전략적 선택의 중요성 증가
- 실시간 확률 표시로 사용자 경험 향상

---

### 🔧 **제작 시스템 개선 및 낚시 게임 수정 - 2024년 12월 23일**

**문제**: 
1. 제작 시스템에서 모든 아이템을 제작할 수 없음 (3개만 표시)
2. 연금술과 요리는 필터링 탭이 불필요함 (물약/음식만 제작)
3. 소모품 탭이 대장기술에 불필요함
4. 낚시 게임에서 다 맞춰도 75%밖에 점수가 안 나옴
5. 낚시 레벨이 올라도 맞춰야 하는 갯수가 증가하지 않음

**해결 방법**:
1. **제작 시스템 개선**:
   - 모든 아이템을 제작할 수 있도록 아이템 목록 확장
   - 대장기술: 모든 무기, 갑옷, 악세서리 제작 가능
   - 연금술: 모든 물약 제작 가능 (health_potion, mana_potion, greater_health_potion, greater_mana_potion, stamina_potion, energy_drink)
   - 요리: 모든 음식 제작 가능 (bread, meat_stew, fish_stew, herb_soup, divine_feast)

2. **필터링 시스템 개선**:
   - 소모품 탭 제거
   - 대장기술만 필터링 탭 표시 (무기, 방어구, 악세서리)
   - 연금술과 요리는 필터링 탭 제거 (단일 아이템 타입만 제작)

3. **낚시 게임 점수 시스템 개선**:
   - 점수 계산 방식 변경: `100 / 시퀀스길이 + 레벨보너스`
   - 레벨 보너스: `Math.min(20, skillLevel * 2)`
   - 오답 페널티: `Math.max(5, 15 - skillLevel)` (레벨이 높을수록 페널티 감소)
   - 모든 시퀀스 완료 시 자동 게임 종료

4. **낚시 게임 난이도 조정**:
   - 레벨에 따른 시퀀스 길이 조정: `Math.min(10, Math.max(3, 3 + Math.floor(skillLevel / 2)))`
   - 레벨 1: 3개 시퀀스
   - 레벨 10: 8개 시퀀스
   - 레벨 15+: 10개 시퀀스 (최대)

5. **UI 개선**:
   - 낚시 게임에 현재 레벨과 시퀀스 개수 표시
   - 제작 모달에서 스킬 타입에 따른 필터링 탭 조건부 표시

**수정된 파일**:
- `src/components/life/CraftingModal.tsx`: 필터링 시스템 개선, 소모품 탭 제거
- `src/components/life/FishingMinigame.tsx`: 점수 시스템 개선, 레벨 기반 난이도 조정
- `src/components/life/LifePanel.tsx`: FishingMinigame에 skillLevel 전달

**결과**: 
- 모든 아이템을 제작할 수 있는 완전한 제작 시스템
- 스킬 타입에 맞는 적절한 필터링 시스템
- 레벨에 따른 낚시 게임 난이도 조정
- 공정하고 예측 가능한 점수 시스템
- 사용자 경험 향상

---

### 📱 **UI 레이아웃 수정 - 패널 하단 잘림 문제 해결 - 2024년 12월 23일**

**문제**: 
1. 상점과 제작 패널의 하단 부분이 하단 네비게이션 바와 겹쳐서 잘림
2. 패널의 최대 높이가 하단 네비게이션 바를 고려하지 않음
3. 사용자가 패널의 하단 내용을 볼 수 없음

**해결 방법**:
1. **패널 최대 높이 조정**:
   - 기존: `max-h-[calc(100vh-4rem)]` (상단 HUD만 고려)
   - 수정: `max-h-[calc(100vh-8rem)]` (상단 HUD + 하단 네비게이션 바 고려)
   - 하단 네비게이션 바 높이: 4rem (64px)

2. **제작 모달 내부 스크롤 영역 조정**:
   - 기존: `max-h-[calc(90vh-180px)]`
   - 수정: `max-h-[calc(90vh-220px)]`
   - 추가 여백 확보로 하단 내용이 잘리지 않도록 조정

3. **적용된 패널들**:
   - `ShopPanel.tsx`: 상점 패널 높이 조정
   - `LifePanel.tsx`: 생활 스킬 패널 높이 조정
   - `CraftingModal.tsx`: 제작 모달 내부 스크롤 영역 조정

**수정된 파일**:
- `src/components/shop/ShopPanel.tsx`: 패널 최대 높이 조정
- `src/components/life/LifePanel.tsx`: 패널 최대 높이 조정
- `src/components/life/CraftingModal.tsx`: 내부 스크롤 영역 조정

**결과**: 
- 상점과 제작 패널의 하단 내용이 하단 네비게이션 바와 겹치지 않음
- 모든 패널 내용을 스크롤하여 볼 수 있음
- 일관된 UI 레이아웃으로 사용자 경험 향상

---

### 🔧 **제작 시스템 완전 확장 - 모든 장비 제작 가능 - 2024년 12월 23일**

**문제**: 
1. 제작 시스템에서 그림자 검, 번개 지팡이, 자연 방어구만 제작 가능
2. 대부분의 아이템 파일에 `craftingMaterials` 필드가 없음
3. 일부 아이템은 `materials` 필드를 사용하여 제작 시스템과 호환되지 않음
4. 모든 장비를 제작할 수 있어야 함

**해결 방법**:
1. **모든 아이템 파일에 `craftingMaterials` 추가**:
   - 기존 `materials` 필드를 `craftingMaterials`로 변환
   - `requiredSkill`과 `requiredSkillLevel` 필드 추가
   - 제작 시스템과 호환되도록 통일

2. **추가된 아이템들**:
   - **검류**: wooden_sword, iron_sword, flame_sword, frost_sword, shadow_sword, thunder_sword, toxic_sword, verdant_sword
   - **지팡이류**: flame_staff, frost_staff, shadow_staff, thunder_staff, toxic_staff, verdant_staff
   - **갑옷류**: leather_armor, flame_armor, frost_armor, shadow_armor, thunder_armor, toxic_armor, verdant_armor
   - **반지류**: flame_ring, frost_ring, shadow_ring, thunder_ring, toxic_ring, verdant_ring

3. **제작 재료 체계**:
   - **기본 재료**: wood, iron_ore, leather, common_metal
   - **원소 재료**: flame_ore, frost_ore, shadow_ore, thunder_ore, toxic_ore, verdant_ore
   - **정제 재료**: flame_crystal, frost_crystal, shadow_crystal, thunder_crystal, toxic_crystal, verdant_crystal
   - **고급 재료**: flame_gem, frost_gem, shadow_gem, thunder_gem, toxic_gem, verdant_gem, steel_ore, mithril_ore

4. **스킬 레벨 요구사항**:
   - **레벨 1**: wooden_sword, iron_sword, leather_armor
   - **레벨 2**: flame_sword, frost_sword, toxic_sword, verdant_sword, flame_staff, frost_staff, shadow_staff, verdant_staff, flame_armor, frost_armor, shadow_armor, thunder_armor, toxic_armor
   - **레벨 3**: thunder_staff, toxic_staff, verdant_armor
   - **레벨 4**: thunder_staff
   - **레벨 5**: 모든 반지류 (flame_ring, frost_ring, shadow_ring, thunder_ring, toxic_ring, verdant_ring)

**수정된 파일**:
- `src/data/items/wooden_sword.json`: craftingMaterials 추가
- `src/data/items/iron_sword.json`: craftingMaterials 추가
- `src/data/items/flame_sword.json`: craftingMaterials 추가
- `src/data/items/frost_sword.json`: craftingMaterials 추가
- `src/data/items/toxic_sword.json`: materials를 craftingMaterials로 변환
- `src/data/items/verdant_sword.json`: materials를 craftingMaterials로 변환
- `src/data/items/thunder_sword.json`: materials를 craftingMaterials로 변환
- `src/data/items/flame_staff.json`: craftingMaterials 추가
- `src/data/items/frost_staff.json`: materials를 craftingMaterials로 변환
- `src/data/items/shadow_staff.json`: materials를 craftingMaterials로 변환
- `src/data/items/verdant_staff.json`: materials를 craftingMaterials로 변환
- `src/data/items/toxic_staff.json`: craftingMaterials 추가
- `src/data/items/leather_armor.json`: materials를 craftingMaterials로 변환
- `src/data/items/flame_armor.json`: craftingMaterials 추가
- `src/data/items/frost_armor.json`: materials를 craftingMaterials로 변환
- `src/data/items/shadow_armor.json`: materials를 craftingMaterials로 변환
- `src/data/items/thunder_armor.json`: materials를 craftingMaterials로 변환
- `src/data/items/toxic_armor.json`: craftingMaterials 추가
- `src/data/items/flame_ring.json`: materials를 craftingMaterials로 변환
- `src/data/items/frost_ring.json`: materials를 craftingMaterials로 변환
- `src/data/items/shadow_ring.json`: materials를 craftingMaterials로 변환
- `src/data/items/thunder_ring.json`: materials를 craftingMaterials로 변환
- `src/data/items/toxic_ring.json`: materials를 craftingMaterials로 변환
- `src/data/items/verdant_ring.json`: materials를 craftingMaterials로 변환

**결과**: 
- 모든 장비를 제작할 수 있는 완전한 제작 시스템
- 일관된 제작 재료 체계로 게임 밸런스 향상
- 스킬 레벨에 따른 점진적 제작 시스템
- 다양한 원소별 장비 제작 가능

---

### 🎯 **제작과 상점 탭 레이아웃 개선 및 제작 시스템 확장 - 2024년 12월 23일**

**문제**: 
1. 제작과 상점 탭이 하단에 표시되어 캐릭터, 인벤토리 탭과 일관성이 없음
2. 제작 시스템에서 모든 장비를 제작할 수 없음
3. 제작 시스템에 내부 탭으로 필터링 기능이 없음
4. 필요 레벨과 제작 시간이 표시되어 복잡함

**해결 방법**:
1. **레이아웃 통일**: 
   - 제작과 상점 탭을 상단탭 밑까지 올리도록 수정
   - `bottom-16` → `top-16`로 변경하여 캐릭터, 인벤토리 탭과 일관성 유지
   - 최대 높이를 `max-h-[calc(100vh-4rem)]`로 조정

2. **제작 시스템 확장**:
   - 모든 장비 아이템을 제작할 수 있도록 아이템 목록 확장
   - 검류: `wooden_sword`, `iron_sword`, `flame_sword`, `frost_sword`, `shadow_sword`, `thunder_sword`, `toxic_sword`, `verdant_sword`
   - 지팡이류: `flame_staff`, `frost_staff`, `shadow_staff`, `thunder_staff`, `toxic_staff`, `verdant_staff`
   - 갑옷류: `leather_armor`, `flame_armor`, `frost_armor`, `shadow_armor`, `thunder_armor`, `toxic_armor`, `verdant_armor`
   - 반지류: `flame_ring`, `frost_ring`, `shadow_ring`, `thunder_ring`, `toxic_ring`, `verdant_ring`
   - 요리: `bread`, `meat_stew`, `fish_stew`, `herb_soup`, `divine_feast`

3. **내부 탭 필터링 시스템**:
   - 카테고리별 필터링 탭 추가: 전체, 무기, 방어구, 악세서리, 소모품
   - 아이템 데이터에서 카테고리 정보를 동적으로 로드
   - 필터링된 레시피만 표시하는 시스템 구현

4. **UI 간소화**:
   - 필요 레벨 표시 제거
   - 제작 시간 표시 제거
   - 더 깔끔하고 직관적인 제작 인터페이스 제공

**수정된 파일**:
- `src/components/shop/ShopPanel.tsx`: 레이아웃을 상단으로 변경
- `src/components/life/LifePanel.tsx`: 레이아웃을 상단으로 변경
- `src/components/life/CraftingModal.tsx`: 제작 시스템 확장 및 필터링 기능 추가

**결과**: 
- 제작과 상점 탭이 캐릭터, 인벤토리 탭과 일관된 레이아웃 제공
- 모든 장비를 제작할 수 있는 완전한 제작 시스템 구현
- 내부 탭으로 장비를 종류별로 필터링하여 볼 수 있는 기능 추가
- 필요 레벨과 제작 시간 제거로 더 깔끔한 UI 제공
- 사용자 경험 개선 및 제작 시스템의 완전성 향상