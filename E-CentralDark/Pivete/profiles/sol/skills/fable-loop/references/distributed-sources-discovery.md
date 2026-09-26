# 분산 소스 검색 패턴 상세

## 문제

세션 중 `skill_view('some-skill')`이 다음을 반환할 때:
- 짧은 플레이스홀더 콘텐츠 (수백 자)
- "File not found" 오류
- 실제 콘텐츠가 없는 빈 결과

**이때 하지 말 것:**
- 두 번째 엔진/시스템/소유자 생성
- "스킬이 없으니 새로 만든다"고 가정하고 병렬 아키텍처 시작
- 사용자에게 "이 스킬이 없는데 만들까요?"라고 반복 질문

## 해결 패턴

### 1단계: 저장소 전체 검색

```bash
# origin/main에서 관련 파일 찾기
git -C "$REPO_ROOT" ls-tree -r --name-only origin/main | grep -iE "keyword1|keyword2|keyword3"

# 또는 find 사용 (작업트리 포함)
find "$REPO_ROOT" -maxdepth 5 -type f \( -iname "*keyword1*" -o -iname "*keyword2*" \) 2>/dev/null

# 또는 search_files로 내용 검색
search_files(pattern="keyword1|keyword2", target="content", path="$REPO_ROOT")
```

### 2단계: 발견된 소스로 계약 구성

발견된 파일들을 읽어 contracts/패턴 추출:
- SKILL.md 파일이 있으면 우선 사용
- MD/DOC/YML 파일에서 관련 섹션 추출
- 여러 소스의 내용을 교차 검증

### 3단계: 기존 계약만 사용

- 발견된 계약이 충분하면 그걸로 진행
- 부족한 부분만 보충 (새 시스템 생성 아님)
- "스킬 이름이 정확히 없으니 생성"이라는 논리 금지

## 적용 예 (이 세션)

사용자가 `/FABLE LOOP SKIL`을 요청했을 때:
- `skill_view('fable-loop')` → 짧은 플레이스홀더 반환
- `git ls-tree origin/main` → 10개 분산 소스 발견
- 발견 소스: cot-react-loop/SKILL.md, fabler-system.md, loop.mjs, sync-loop.sh, MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md, LEARNING_CRYSTAL_LOOP.yml, 004-hermes-24h-loop-autonomo.md, triagem-fabler-pendencias.md, LoopDiagram.tsx, dependabot-squash-loop.mmd, centraldark-pattern-intelligence, kimetsu-legacy references
- 이 소스들로 FABLE LOOP 계약을 구성하고 진행
- 두 번째 FABLE 엔진 생성하지 않음

## 핵심 규칙

```
MISSING_EXACT_SKILL_NAME != PERMISSION_TO_CREATE_PARALLEL_SYSTEM
REGRA_FONTE_DISTRIBUIDA = usar contratos úteis já existentes
```

**기억할 것:** 스킬 이름은 부재할 수 있지만, 계약은 이미 저장소에 분산되어 있을 수 있음. 찾아서 사용하라. 새로 만들지 마라.
