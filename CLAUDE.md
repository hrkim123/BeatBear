# CLAUDE.md — BeatBear 개발 인수인계 / AI 협업 규칙

> 이 파일은 Claude Code가 자동으로 읽는 진입점이다. **다른 로컬/다른 계정에서 이 저장소를 클론해 이어서 개발할 때, 먼저 이 문서를 읽고 시작한다.**

## ⭐ 새 로컬 / 새 Claude 계정에서 이어받기 (온보딩 퀵스타트)
GitHub 저장소 **`hrkim123/BeatBear`** 하나만 있으면 어디서든 이어서 개발 가능. GitHub 계정(hrkim123)은 동일, **로컬 PC·Claude 계정만 바뀜**.
1. `git clone https://github.com/hrkim123/BeatBear.git` → 폴더 진입
2. `npm install` — 네이티브 `uiohook-napi` 빌드/프리빌드 자동(Windows + 개발자 모드 권장, DISTRIBUTE.md §0)
3. (개발자 재화 해금) `setx BEATBEAR_DEV 1` 후 새 셸 · (릴리스 배포) `setx GH_TOKEN "<repo write PAT>"` 후 새 셸
4. `git config user.name/email` 설정 · `npm start` 로 오버레이 실행(멀티 필요 시 `npm run server`)
5. **읽는 순서**: 이 문서(§1~§7) → `SPEC.md`(회귀 금지) → `docs/`(battle-mode·menu-redesign·beatbear-overview) → 코드
- **현재 상태(2026-07)**: 앱=**BeatBear**(곰 단일 캐릭터), appId=`com.hrkim.beatbear`, 버전 `0.1.0`, publish=`hrkim123/BeatBear`. 햄버거 메뉴 대개편·곰 아트·꾸미기(외형/책상/키보드/마우스)·소환/컬렉션/미니게임(무기설정·덱·배틀신청·업적)·편의성·설정(옵션·단축키) 구현 완료. 서버 exe 런처(항상 최신 릴리스) 완비.
- **이름 규칙**: 코드/문서/UI 어디에도 이전 이름(HongGoCat)·"Bongo Cat/봉고캣" 흔적 없음(저작권). 새 기능 추가 시에도 BeatBear 유지. 내부 API=`window.beatbear`.

## 0. 이 프로젝트는

- **BeatBear** — **전체화면 투명·클릭통과 데스크톱 오버레이**(Electron). 키보드/마우스 입력에 맞춰 고양이가 연주하고, 방으로 친구와 멀티플레이(WS 릴레이), 상점·가챠, 그리고 **배틀 모드**(냥코대전쟁 스타일)를 제공한다.
- 스택: Electron(main) + Canvas 렌더 + `uiohook-napi`(전역 입력) + `ws`(릴레이 서버) + electron-builder/updater(GitHub Releases 자동 업데이트).

## 1. 먼저 읽을 문서 (권위 순)

- **[SPEC.md](SPEC.md)** — 확정 동작 + **회귀 금지 규칙**. 수정 전 반드시 §2를 읽고, 여기 확정된 동작을 깨지 않게 작업한다. 사소한 변경도 §2·§3에 갱신.
- **[docs/battle-mode.md](docs/battle-mode.md)** — 배틀 모드 전체 설계 + **N차 개발 이력**(가장 최근이 위). 배틀 관련 작업의 단일 진실원.
- **[docs/menu-redesign.md](docs/menu-redesign.md)** — 🚧 **진행 중: 햄버거 메뉴 대개편**(레퍼런스 스타일 팝업). 요구사항 16개 + **구현 진행 상황**(어디까지 됐는지) 단일 기준. 새 세션은 이 문서부터 읽고 이어서 작업. 새 팝업=`renderer/menu/menu-ui.js`, 연결=`renderer/app.js`(HGMenu.setBridges).- **[README.md](README.md)** — 실행·꾸미기·멀티 개요.
- **[DISTRIBUTE.md](DISTRIBUTE.md)** — 배포·자동 업데이트·GH_TOKEN·개발자 모드 세팅.

## 2. 환경 세팅 (새 머신 1회)

```bash
npm install                 # node_modules는 저장소에 없음. 네이티브 모듈 uiohook-napi 빌드/프리빌드 필요
```

- **릴리스 배포하려면** `GH_TOKEN` 환경변수 설정(레포 Contents write). `setx GH_TOKEN "..."` 후 새 셸.
- **개발자 기능 잠금해제**(가챠/재화 등): `setx BEATBEAR_DEV 1` 후 새 셸. (preload.js가 이 env로 `isDev` 판정 — 친구 배포본엔 없어 못 씀)
- **릴레이 서버 주소**: 클라이언트 기본값 `ws://localhost:8787`. 하드코딩 아님 — 설정 창에서 변경(localStorage `server`). 다른 호스트면 그 주소 입력.
- **모델2 = 서버가 곧 방** (2026-07-27~): **방 코드 개념 제거**. 접속 대상은 서버 IP로만 구분하고, 클라는 내부적으로 고정 방 `MAIN`에 입장한다(`FIXED_ROOM`). 서버 코드는 방 기반 그대로 유지(변경 최소화). 다른 그룹 = 서버를 하나 더 띄움.
- **버전 게이트**: 클라 `v`(앱 버전)가 서버 `SERVER_VERSION`과 정확히 일치해야 접속 허용(구/신 섞임 desync 방지). 서버 버전 우선순위 = `process.env.SERVER_VERSION` → `package.json`. **새 릴리스 배포 시 서버도 반드시 최신으로 재시작**(안 하면 서버가 옛 버전이라 최신 클라를 차단).
- git 사용자 설정: `git config user.name` / `user.email` (커밋이 "unknown"으로 찍히지 않게).
- Windows 개발자 모드 ON(빌드 시 심볼릭 링크) — DISTRIBUTE.md §0 참고.

## 3. 개발 워크플로

```bash
npm start                   # 오버레이 앱(개발). 패키징본과 별도 userData(-dev)·단일인스턴스 락 사용 → 배포본과 동시 실행 OK
npm run server              # 릴레이 서버 ws://<호스트IP>:8787 (멀티 필요할 때만)
npm run server:exe          # 단독 서버 exe 빌드(@yao-pkg/pkg) → dist-server/beatbear-server.exe. Node 없이 클릭 실행, 실행 시 GitHub 최신 릴리스 server.js·버전을 받아 뜸(server/launcher.js)
```

- **서버 exe(런처)**: `server/launcher.js`가 실행 시 GitHub `hrkim123/BeatBear` 최신 릴리스 태그(=버전)+`server/server.js`를 받아, 번들 `ws`를 주입해 그 버전으로 실행(`SERVER_VERSION` env 주입). 실패 시 캐시(`%LOCALAPPDATA%\beatbear-server-cache`)→exe 내장 순 폴백. **exe 자체는 재빌드 없이 항상 최신 버전 서버로 뜸** → 릴리스마다 exe 재배포 불필요(단, 릴리스에 gate 포함된 server.js가 올라가 있어야 게이트가 작동).

- **dev 앱은 `beatbear-dev` userData를 씀**(main.js: `!app.isPackaged` → userData+`-dev`). 배포본 데이터(가챠·덱·설정)를 건드리지 않는다.
- dev 재시작 시, 이전 인스턴스의 단일인스턴스 락이 늦게 풀려 새 인스턴스가 즉시 종료될 수 있다 → 남은 `electron.exe`(node_modules 경로) 정리 후 재실행.

### 배포 (⚠️ 사용자가 명시적으로 "배포"라고 할 때만)

```bash
npm version patch -m "chore(release): %s"   # 또는 minor. package.json 버전+태그 생성
git push --follow-tags
npm run release                              # electron-builder --publish always (GH_TOKEN 필요)
```

- 자동 업데이트: electron-updater + GitHub Releases. `main.js`에서 `autoUpdater.disableDifferentialDownload = true`(차등 다운로드 sha512 불일치로 조용히 실패하던 버그 방지 — **끄지 말 것**).
- 업데이트 실패 시 흔한 원인: 업데이터 캐시(`%LOCALAPPDATA%\beatbear-updater`)에 남은 옛/부분 `installer.exe`가 sha512 검증 실패 → 캐시 폴더 비우면 해결.

## 4. 절대 규칙 · 불변식 (요청 없이 어겨선 안 됨)

### 멀티플레이 일관성 (최상위 불변식)
- **모든 상호작용·전투 연출·결과는 모든 클라이언트에서 동일하게 해석·표시돼야 한다.** "내 화면에선 터지는데 상대 화면엔 안 터진다"는 금지. 예외는 개인 UI(HUD·설정 등)뿐.
- **새 배틀 메시지 타입을 추가하면 반드시 `server/server.js` 화이트리스트에 등록 + 서버 재시작.** 미등록 타입은 서버가 드롭한다(과거 "동기화 안 됨" 버그 다수의 근본 원인).
- 배틀은 **소유자 권한(owner-authoritative)** — 각 클라이언트는 자기 유닛만 sim, 상대는 고스트(`bunits` 릴레이 ~50ms). 좌표는 **공용 절대 프레임**(`battleFlip`, `battleLaneX(L)`)이라 양쪽 화면에서 같은 절대 위치.

### 배틀 코드 작성 전 프리플라이트 체크리스트 (매번, 요청 없이 스스로)
1. **재사용**: 오버레이의 실제 시스템(`fireHoming`, 투사체·충돌·땅파임 등)을 그대로 쓰는가? 평행 복사본 만들지 말 것.
2. **충돌/HP**: 모든 소환 가능한 유닛은 오버레이에서 HP+충돌을 가져야 한다(장식 금지, `ants[]` 재사용).
3. **일관성**: 상대도 보이는가? 양쪽에서 같게 해석되는가? 위치는 정규화됐는가?

### 소환체 정의 · 무기 vs 기지
- **소환체 = 구조물 + 자동 소환체 + 수동 소환체(메카/인간 등) 전부.**
- **배틀에서 플레이어 "무기"는 적 기지(진영)에 데미지를 주지 않는다.** 기지는 오직 소환체/구조물로만 무너진다.

### 소환체 설계
- **HP + 충돌 필수** — 모든 소환 가능 유닛은 실체(장식 아님). 오버레이에서 `ants[]` 계열로 편입.
- **디자인 차별화** — 비슷하게 생긴 소환체는 명확한 시각적 구분 요소를 가진다.
- **업그레이드 Lv5까지 설계** — 새/개편 소환체는 레벨별 수치 + **Lv5 추가 기믹**까지 함께 제안(파워크립 대신 역할 심화).
- **생산/서포트 유닛은 자체 HP 낮게** — 여왕·메딕처럼 본인 전투가 핵심이 아닌 유닛은 낮은 HP(보호받아야 하는 포지션).
- **생산형이 뽑는 소환체는 base 스탯**(플레이어 업그레이드 미반영) — sim `spawn(..., {base:true})`. (안 그러면 타이탄 개미가 ant Lv5 기믹으로 2마리 나오는 등 사기화)

### 전투 판정
- **근접(melee)은 공중 유닛을 못 때린다**(원거리·대공만). 근접은 그 대가로 HP↑·넉백↓.
- **공중 타격 여부는 유닛별 `atk.groundOnly` 플래그로 결정**(2026-07-23~). 원거리·자폭도 `groundOnly:true`면 공중 불가(현재 자폭개미·저격개미·라이플 솔져). "자폭은 항상 공중 타격" 규칙은 폐기 — per-unit. sim `canHit`이 `(melee||groundOnly) && flying`이면 제외.

### 블랙홀
- 블랙홀은 **캐릭터를 제외한 모든 오브젝트**를 중심으로 빨아들인다(캐릭터는 면제).

### 문서 갱신
- 개발 지시가 `docs/` 스펙과 맞물리면 **해당 문서를 갱신 + 짧은 이력 라인(N차)을 추가**한다. 코드와 **같은 커밋**에 담고, 배포(push) 시 함께 GitHub에 올라간다.

## 5. 회귀 금지 핵심 (상세는 SPEC.md §2)

- `main.js` 최상단 **`app.disableHardwareAcceleration()`** — 지우면 상단 흰 바 재발. 절대 제거 금지.
- BrowserWindow **`resizable:true`** + `ready-to-show`에서 전체 모니터 bounds 재적용 — false로 되돌리면 작업표시줄 미커버 회귀.
- **단일 인스턴스** 락 유지.
- 캐릭터는 **곰만**(2026-07-28 메뉴 개편 Phase 3에서 고양이→곰 전면 교체, `renderer/animals.js`). 단일 캐릭터 유지(개/돼지/원숭이 부활 아님 — 되살리지 말 것). 문서 곳곳의 "고양이" 표현은 캐릭터(곰)로 읽는다.

## 6. 주요 파일 지도

- `main.js` — Electron 메인. 창 생성·클릭통과 폴링·자동 업데이트·바탕화면 모드(z-order)·전역 입력.
- `preload.js` — contextBridge(`window.beatbear`). IPC 채널.
- `renderer/app.js` — 렌더/게임 로직 대부분(오버레이 전투·배틀 렌더·HUD·멀티 릴레이 처리). 큼.
- `renderer/animals.js` — 고양이 아트/스킨/무늬.
- `renderer/battle/units.js` — 소환체·무기 데이터(스탯·희귀도·코스트).
- `renderer/battle/sim.js` — 배틀 시뮬레이션(소유자 권한, 레인 L∈[0,1]).
- `renderer/battle/upgrade.js` — 업그레이드 스펙(레벨 수치·Lv5 기믹·희귀도 차등 비용). `computeUnitStats` = sim이 쓰는 실효 스탯 단일 산출.
- `renderer/battle/gacha-ui.js` — 상점·가챠·컬렉션·메뉴 UI.
- `server/server.js` — WS 릴레이. **메시지 타입 화이트리스트**(새 타입 추가 시 등록 필수).

## 7. 알아둘 함정

- **innerHTML 매프레임 재생성 = 클릭 깨짐**: 클릭 가능한 DOM의 innerHTML을 매 프레임 새로 만들면 mousedown/mouseup 타깃이 파괴돼 클릭이 안 먹는다 → 시그니처 캐싱으로 변경 시에만 재생성, 자식엔 `pointer-events:none`.
- 릴레이 좌표는 화면분율(정규화) — 해상도 달라도 일관.
