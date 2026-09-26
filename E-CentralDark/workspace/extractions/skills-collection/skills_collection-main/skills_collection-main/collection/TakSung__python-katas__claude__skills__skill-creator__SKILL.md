---
name: skill-creator
description: Claude 스킬을 생성하고 작성하는 것을 도와줍니다. 새로운 스킬 만들기, 스킬 작성 가이드, 베스트 프랙티스 적용 등의 키워드에 반응합니다.
allowed-tools: Write, Read, Bash, Glob
---

# Skill Creator - Claude 스킬 생성 도우미

새로운 Claude 스킬을 생성하고 베스트 프랙티스에 맞게 작성하는 것을 도와주는 스킬입니다.

## 주요 기능

### 1. 스킬 구조 선택

새 스킬을 만들 때 다음 두 가지 패턴 중 선택합니다:

#### 패턴 A: 헬퍼 스크립트 기반 스킬 (권장)

복잡한 로직이나 반복 작업이 필요한 경우:

```
.claude/skills/[skill-name]/
└── SKILL.md

platforms/linux/scripts/
└── [skill-name]-helper.sh

platforms/windows/scripts/
└── [skill-name]-helper.bat
```

**생성 명령어:**
```bash
mkdir -p .claude/skills/[스킬-이름]
mkdir -p platforms/linux/scripts platforms/windows/scripts
touch platforms/linux/scripts/[스킬-이름]-helper.sh
touch platforms/windows/scripts/[스킬-이름]-helper.bat
chmod +x platforms/linux/scripts/[스킬-이름]-helper.sh
```

**사용 예시:** `catchup`, `python-runner`, `study-note`

#### 패턴 B: 단순 스킬

간단한 Bash 명령어만 사용하는 경우:

```
.claude/skills/[skill-name]/
└── SKILL.md
```

### 2. SKILL.md 작성 가이드

기본 구조:

```markdown
---
name: skill-name
description: 무엇을 하는지 + 언제 사용하는지 + 트리거 키워드
allowed-tools: Tool1, Tool2, Tool3
---

# 스킬 제목

간단한 소개

## 주요 기능
(기능 설명)

## 사용 예시
(구체적인 사용 케이스)

## 주의사항
(제약사항이나 요구사항)
```

**헬퍼 스크립트 호출 예시:**

```markdown
| 작업 | 명령어 | 설명 |
|---|---|---|
| **상태 확인** | `./scripts/스킬이름-helper.sh status` | 현재 상태 출력 |
```

### 3. 헬퍼 스크립트 작성

템플릿 파일을 참조하세요:
- Linux: [helper-script-template.sh](helper-script-template.sh)
- Windows: [helper-script-template.bat](helper-script-template.bat)

**필수 요소:**
1. UTF-8 인코딩 설정 (`export LC_ALL=C.UTF-8`)
2. 프로젝트 루트 경로 설정
3. `.katarc` 로드
4. 에러 핸들링 함수
5. 커맨드 디스패처 (case/goto)

### 4. setup-platform.py 연동

헬퍼 스크립트 작성 후:

```bash
python setup-platform.py
```

이 명령어가 하는 일:
- `platforms/{platform}/scripts/` → `scripts/` 복사
- `.katarc`에 플랫폼 설정 추가

### 5. 베스트 프랙티스 적용

#### Description 작성 원칙
- **구체적으로**: "문서 처리" ❌ → "PDF 파일에서 텍스트와 표 추출" ✅
- **트리거 포함**: 사용자가 언급할 키워드 포함
- **사용 시점 명시**: "Use when..." 형태

#### 스킬 범위
- 하나의 스킬 = 하나의 명확한 목적
- 너무 광범위하면 분리

#### 도구 제한 (allowed-tools)
- **읽기 전용**: `Read, Grep, Glob`
- **생성**: `Read, Write, Bash`
- **전체 액세스**: `Read, Write, Edit, Bash, Grep, Glob`

#### 출력 최적화
- 요약 우선, 상세 내용은 선택적
- 컨텍스트 최소화

#### 한글 지원
- Bash: `export LC_ALL=C.UTF-8`
- Git: `git -c core.quotepath=false`

#### 스킬 참조 패턴 (IMPORTANT)

에이전트 파일에서 스킬 참조 시 **@ 기호를 사용하지 마세요**.

❌ **잘못된 패턴:**
# AVAILABLE SKILLS
```
(at)../../.claude/skills/catchup/SKILL.md
(at)../../.claude/skills/skill-creator/SKILL.md
```
→ @ 기호로 인해 스킬 파일 전체가 즉시 프롬프트에 로드되어 컨텍스트 낭비

Note: (at)을 @로 바꿔서 사용하면 안 됩니다!

✅ **올바른 패턴:**
```text
../../.claude/skills/catchup/SKILL.md
```

**이유**: `@` 기호는 파일 내용을 즉시 로드하여 컨텍스트 낭비

**적용 원칙:**
- 에이전트 파일: 경로만 작성 (링크 불필요)
- 스킬 파일 내부: 마크다운 링크 형식 `[text](file.md)` 사용

### 6. 스킬 검증 체크리스트

```bash
# 1. 파일 확인
ls -la .claude/skills/[스킬-이름]/SKILL.md
ls -la platforms/linux/scripts/[스킬-이름]-helper.sh
ls -la platforms/windows/scripts/[스킬-이름]-helper.bat

# 2. setup-platform.py 실행
python setup-platform.py

# 3. 스크립트 실행 확인
./scripts/[스킬-이름]-helper.sh help

# 4. YAML 검증
head -n 10 .claude/skills/[스킬-이름]/SKILL.md
```

**검증 항목:**
- [ ] name이 kebab-case인가?
- [ ] description이 구체적이고 트리거 키워드를 포함하는가?
- [ ] allowed-tools가 필요한 최소한의 도구만 포함하는가?
- [ ] YAML 문법이 올바른가?
- [ ] 헬퍼 스크립트가 Linux/Windows 둘 다 존재하는가?
- [ ] UTF-8 인코딩을 지원하는가?
- [ ] setup-platform.py로 배포 후 scripts/에 복사되었는가?

## 인터뷰 프로세스

### 1단계: 스킬 패턴 결정

"이 스킬은 헬퍼 스크립트가 필요한 복잡한 작업인가요, 아니면 간단한 명령어만 실행하나요?"

- **패턴 A**: 복잡한 로직, 반복 작업, 여러 명령어 조합
- **패턴 B**: 단일 명령어, 간단한 조회

### 2단계: 기본 정보 수집

1. **스킬 이름** (kebab-case, 최대 64자)
2. **스킬 설명** (무엇을 + 언제)
3. **트리거 키워드**
4. **필요한 도구** (Bash, Read, Write, Grep, Glob 등)
5. **사용 예시**

### 3단계: 헬퍼 스크립트 설계 (패턴 A인 경우)

1. 헬퍼 스크립트가 제공할 명령어들
2. .katarc에서 필요한 설정 값
3. 각 명령어의 입력 인자

### 4단계: 파일 생성

1. 스킬 디렉토리 및 SKILL.md 생성
2. (패턴 A) 헬퍼 스크립트 생성 (Linux + Windows)
3. setup-platform.py 실행
4. 검증 체크리스트 실행

## 템플릿 및 참고 자료

### 템플릿
- SKILL.md: [template.md](template.md)
- Linux 헬퍼 스크립트: [helper-script-template.sh](helper-script-template.sh)
- Windows 헬퍼 스크립트: [helper-script-template.bat](helper-script-template.bat)

### 상세 가이드
- 베스트 프랙티스: [best-practices.md](best-practices.md)
  - 섹션 4: 헬퍼 스크립트 패턴 상세
  - 섹션 5: setup-platform.py 연동 상세
  - 섹션 6: 출력 최적화 가이드
  - 섹션 7: 한글 지원 상세
  - 섹션 8: YAML 문법 주의사항
  - 섹션 9: 스킬 테스트 가이드
  - 섹션 10: 버전 관리 및 배포
  - 섹션 11: 일반적인 실수

### 예시 스킬
- [catchup](./../catchup/SKILL.md): Git 변경사항 추적
- [python-runner](./../python-runner/SKILL.md): Python 프로젝트 실행
- [study-note](./../study-note/SKILL.md): 학습 노트 기록

### 헬퍼 스크립트 예시
- [platforms/linux/scripts/](../../platforms/linux/scripts/)
- [platforms/windows/scripts/](../../platforms/windows/scripts/)

## 사용 예시

**예시 1: 헬퍼 스크립트 기반 스킬 생성**
> "테스트 커버리지를 측정하고 보고서를 생성하는 스킬을 만들고 싶어"

→ 패턴 A 선택 → coverage-reporter 스킬 + 헬퍼 스크립트 생성

**예시 2: 단순 스킬 생성**
> "프로젝트 디렉토리 구조를 tree 명령어로 보여주는 스킬"

→ 패턴 B 선택 → tree-viewer 스킬만 생성 (SKILL.md만)

**예시 3: 기존 스킬 개선**
> "catchup 스킬의 description을 더 구체적으로 만들어줘"

→ 스킬 파일 읽고, 베스트 프랙티스 적용하여 개선

**예시 4: 스킬 검증**
> "방금 만든 스킬이 제대로 작성되었는지 확인해줘"

→ 검증 체크리스트 실행

## 주의사항

1. **스킬 이름 규칙**: 소문자, 숫자, 하이픈만 사용 (최대 64자)
2. **Description 중요성**: Claude가 스킬을 발견하는 유일한 방법
3. **도구 최소화**: 필요한 최소한의 도구만 허용
4. **헬퍼 스크립트 위치**: `platforms/{linux|windows}/scripts/`에 생성
5. **setup-platform.py 필수**: 헬퍼 스크립트를 `scripts/`로 복사
6. **플랫폼 독립성**: Linux/Windows 둘 다 구현
7. **UTF-8 인코딩**: 한글 지원 필수
8. **테스트 필수**: 스킬 생성 후 반드시 Claude Code 재시작 후 테스트

## 참고 자료

- Claude Code 공식 문서: https://code.claude.com/docs/en/agent-skills
- 프로젝트 스킬 예시: `.claude/skills/` 디렉토리
- 헬퍼 스크립트 예시: `platforms/{linux|windows}/scripts/` 디렉토리
