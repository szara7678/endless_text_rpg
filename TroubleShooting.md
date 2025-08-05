# TroubleShooting.md

## 디버깅 및 트러블슈팅 기록

### 🔧 **10층 클리어 후 다음 층 진행 문제 - 2024년 12월 23일**

**문제 상황**:
- 10층 보스를 처치한 후 다음 층(11층)이 나타나지 않음
- 전투 로그에 "10층에 도착했습니다!" 메시지가 보스 처치 후에 나타남
- 층 진행이 멈춰서 게임이 진행되지 않음

**원인 분석**:
- `proceedToNextFloor` 함수에서 `player.highestFloor + 1`로 다음 층을 계산
- `player.highestFloor`는 플레이어가 도달한 최고 층을 기록하는 용도
- 실제 층 진행은 `tower.currentFloor`를 기준으로 해야 함
- 잘못된 계산으로 인해 같은 층이 반복됨

**해결 방법**:
```typescript
// 수정 전
const nextFloor = player.highestFloor + 1

// 수정 후  
const nextFloor = tower.currentFloor + 1
```

**수정된 파일**:
- `src/stores/index.ts`: `proceedToNextFloor` 함수의 층 계산 로직 수정

**결과**:
- 10층 클리어 후 정상적으로 11층으로 진행
- 모든 층에서 올바른 다음 층으로 진행
- 층 진행 시스템 정상 작동

**교훈**:
- 층 진행 로직에서 `player.highestFloor`와 `tower.currentFloor`의 역할을 명확히 구분
- `player.highestFloor`는 최고 기록용, `tower.currentFloor`는 현재 층용
- 층 진행 시에는 항상 `tower.currentFloor`를 기준으로 계산

---

### 🔧 **JSON 파일 직접 import 오류 - 2024년 12월 23일**

**문제 상황**:
- Vite 개발 서버에서 `[plugin:vite:json] Failed to parse JSON file` 오류 발생
- `src/data/initial/inventory.json` 파일 파싱 실패
- 브라우저에서 500 Internal Server Error 발생
- 게임이 로드되지 않음

**원인 분석**:
- `src/stores/index.ts`에서 JSON 파일을 직접 import하고 있었음
- Vite에서 JSON 파일을 직접 import할 때 파싱 오류가 발생할 수 있음
- 동적 import 대신 정적 import를 사용하여 문제 발생

**해결 방법**:
```typescript
// 수정 전
import characterData from '../data/initial/character.json'
import inventoryData from '../data/initial/inventory.json'
import skillsData from '../data/initial/skills.json'
import towerData from '../data/initial/tower.json'

// 수정 후
import { loadInitialCharacter, loadInitialInventory, loadInitialSkills, loadInitialTower } from '../utils/dataLoader'

// 사용 시
const initialCharacter = await loadInitialCharacter()
const initialInventory = await loadInitialInventory()
const initialSkills = await loadInitialSkills()
const initialTower = await loadInitialTower()
```

**수정된 파일**:
- `src/stores/index.ts`: JSON 파일 직접 import 제거, dataLoader 함수 사용으로 변경

**결과**:
- JSON 파싱 오류 해결
- Vite 개발 서버 정상 작동
- 게임 로드 정상화

**교훈**:
- Vite에서 JSON 파일을 로드할 때는 동적 import를 사용하는 것이 안전
- dataLoader 유틸리티를 통해 중앙화된 데이터 로딩 관리
- 정적 import보다는 동적 import가 더 안정적

---

### 🔧 **미니게임 JSON 파일 404 에러 - 2024년 12월 23일**

**문제 상황**:
- 광산 게임에서 `GET https://szara7678.github.io/src/data/drops/mining_rewards.json 404 (Not Found)` 오류 발생
- 채집 게임에서도 동일한 문제 발생
- `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` 오류 발생
- 미니게임 보상 시스템이 작동하지 않음

**원인 분석**:
- `fetch('/src/data/drops/mining_rewards.json')` 방식 사용
- 프로덕션 환경에서 상대 경로가 올바르게 해석되지 않음
- 빌드된 파일에서 JSON 파일 경로가 달라짐
- 404 에러로 인해 HTML 페이지가 반환되어 JSON 파싱 실패

**해결 방법**:
```typescript
// 수정 전
fetch('/src/data/drops/mining_rewards.json')
  .then(response => response.json())
  .then(data => {
    setDropTable(data.drops || [])
  })

// 수정 후
import { loadDropTable } from '../../utils/dataLoader'

const dropData = await loadDropTable('mining_rewards')
if (dropData && dropData.drops) {
  setDropTable(dropData.drops)
}
```

**수정된 파일**:
- `src/components/life/MiningMinigame.tsx`: fetch 방식에서 loadDropTable 함수 사용으로 변경
- `src/components/life/HerbalismMinigame.tsx`: fetch 방식에서 loadDropTable 함수 사용으로 변경

**결과**:
- 404 에러 해결
- 미니게임 보상 시스템 정상 작동
- 프로덕션 환경에서도 안정적으로 JSON 파일 로딩

**교훈**:
- 프로덕션 환경에서는 `fetch` 방식보다 동적 import가 안전
- dataLoader 유틸리티를 통한 일관된 데이터 로딩 방식 사용
- 빌드 환경에서의 파일 경로 차이를 고려한 로딩 방식 선택

--- 