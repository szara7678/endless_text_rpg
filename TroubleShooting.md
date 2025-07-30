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