# 햄버거 메뉴 대개편 스펙 (레퍼런스 스타일 팝업)

> 상태: **설계/목업 단계** — 코드 작업 전. 이 문서가 단일 기준(요구사항 원문 고정). 개발 착수 전 목업 검수 → 수정 → 개발.
> 작성 기준일: 2026-07-28. 참조 이미지: 레퍼런스 인벤/설정/멀티 UI, 곰 디자인 레퍼런스, 가챠 배너 레퍼런스.

## 0. 전체 컨셉
- 현재: 햄버거 클릭 → **화면 전체 딤드 + 중앙 설정창**.
- 변경: 햄버거 클릭 → **캐릭터 위에 뜨는 콤팩트 팝업 메뉴**(레퍼런스처럼). 딤드 없음.
- 팝업 레이아웃: **좌측 세로 레일 = 큰 카테고리(아이콘만)** → **선택된 화면 상단 = 작은 카테고리 탭(아이콘만)** → 그 아래 콘텐츠.
- 텍스트 최소화, **아이콘 + 마우스오버 툴팁**으로 정보 제공.

## 1. 종료(닫기) 방법
- 팝업 우측 상단 **✕** 버튼, 또는 **메뉴 영역 바깥 클릭** → 팝업 닫힘.

## 2. 큰 카테고리 (좌측 세로 레일, 아이콘만 + hover 툴팁)
순서/아이콘/툴팁:
1. **꾸미기**(캐릭터) — 옷장 아이콘. **디폴트로 열리는 화면.**
2. **소환** — 주사위 아이콘.
3. **멀티플레이** — 인터넷/지구본 아이콘.
4. **컬렉션** — 책 아이콘.
5. **미니게임** — 조이패드 아이콘.
6. **편의성** — 번개 아이콘.
7. **설정** — 톱니바퀴 아이콘.

작은 카테고리(각 화면 상단 탭)도 **전부 아이콘만 + hover 툴팁**.

## 3. 캐릭터를 곰으로 (전면 교체)
- 현재 캐릭터=고양이 → **전부 곰으로 교체**. 디자인 컨셉 = 곰 레퍼런스 이미지(둥글고 귀여운 갈색 곰).
- **기본 곰(꾸미기 미적용) = 갈색 기본 곰**. Skins/Hats 등으로 변형.
- CLAUDE.md/SPEC.md의 "고양이만" 규칙은 이 개편으로 **곰으로 대체**(개/돼지/원숭이 부활 아님, 단일 캐릭터=곰).

## 4. 꾸미기(캐릭터) 화면 — 디폴트
- 햄버거 클릭 시 **가장 먼저** 뜨는 화면.
- 작은 카테고리: **Skins, Hats, Ears, Eyes, Mouth, Hands, 키보드, 마우스, 책상** (무기 제외 — 미니게임으로 이동, §11).
  - Skins 디폴트 노출.
  - 탭 아이콘: Ears/Eyes/Mouth = 귀여운 곰 얼굴에 해당 부위 강조, Hands = 발바닥, 키보드=⌨️, 마우스=🖱️, 책상=책상 SVG.
- **디자인 편집 모드에서 "꼬리 위치 조절" 제거.**
- **책상/키보드/마우스 외형**(2026-07-28 추가): 오버레이의 책상·키보드·마우스도 꾸미기 대상. 각 스타일은 `renderer/animals.js`에 정의(위치·충돌·발판은 고정, 색만 변경) + 멀티 전파(profileMsg `desk`/`kb`/`mouse` → server 화이트리스트 → 피어 `deskStyle`/`kbStyle`/`mouseStyle`). 각 3개+ 디자인:
  - 책상: `wood`(기본)/`oak`(원목)/`white`/`graphite`/`mint`
  - 키보드: `dark`(기본)/`white`/`cream`/`teal`
  - 마우스: `white`(기본)/`dark`/`pink`/`blue`

## 5. 외형 선택 방식 — 미리보기 아이콘 그리드
- 현재: 스크롤 + 텍스트로 선택 → 변경: **미리보기 아이콘 타일 그리드로 선택**(레퍼런스 인벤 이미지 컨셉).
- 각 작은 카테고리(Skins/Hats/Ears/Eyes/Mouth/Hands)에 **초기 리소스 최소 3개 이상씩 제작** 필요(현재 미제작분 포함).
- **Skins 정의**: 단순 색상이 아니라 **(다른 카테고리에 속하지 않는) 색상 + 머리 모양 + 몸통 모양 + 꼬리 모양** 세트. (레퍼런스 2번째 인벤 이미지처럼 전체 실루엣 변형.)
- **획득/미획득 구분 = 딤드 처리**(미획득은 흐리게). 외형에 **별도 희귀도 없음.**
- **획득한 외형이 상단에 정렬**.

## 6. 무기 설정 위치 (변경: 미니게임으로)
- 오버레이 **무기 슬롯 설정**은 **미니게임 큰 카테고리의 작은 카테고리 "무기 설정"** 에 두고, **미니게임 클릭 시 디폴트 화면**으로 노출(§11). (캐릭터에는 두지 않음.)

## 7. 소환 화면 (가챠 개편 — 레퍼런스 4번째 가챠 배너)
- **작은 카테고리 2개로 분리**: **외형 소환(디폴트)** / **무기·소환체 소환**(현재 소환 = 무기·소환체가 나오는 것). 탭 순서 [외형][무기·소환체]. 둘 다 아래 규칙 공통.
- **재화 공용**: 두 소환 모두 **같은 루비**를 사용.
- 현재 소환 UI가 칙칙 → 개편.
- **상단**: 재화 표기를 **소환 재화 1종만**(현재 3종 중). **"젬" → "루비"로 이름 변경 + 아이콘 수정.**
- **버튼**: 
  - **1회 소환** — 버튼명 "1회", **필요 재화를 라벨 왼쪽에 표기**(레퍼런스처럼).
  - **10회 소환** — 버튼명 "10회".
- **제거**: 하단의 "카운트→루비 교환" 버튼, "컬렉션" 버튼.
- **확률 버튼**: 현재 주사위 아이콘 → **% 아이콘**으로 변경, 위치는 **우측 상단 ✕ 옆**.
- **중앙 연출 영역**: 현재 "젬으로 1회 소환" 같은 텍스트 → **실제 획득 가능한 아이템들로 디자인**(쇼케이스).

## 8. 큰 카테고리 아이콘 규칙 (재확인)
- 텍스트 없이 아이콘, hover 시 텍스트 툴팁.
- 꾸미기=옷장 / 소환=주사위 / 멀티=인터넷 / 컬렉션=책 / 미니게임=조이패드 / 편의성=번개 / 설정=톱니바퀴.

## 9. 컬렉션 화면
- 현재 **배틀 덱 설정이 컬렉션에 섞여 있음** → **덱 설정 기능·UI를 전부 제거**.
- **외형 컬렉션 제외** — 외형은 캐릭터(꾸미기)에서 이미 획득/미획득이 표기되므로 컬렉션에 중복 불필요.
- 컬렉션 = **무기·소환체만**. 확실한 구분을 위해 작은 카테고리 **소환체 / 무기** 로 분리.

## 10. (=6과 연결) 무기 설정
- 오버레이 무기 설정 = 꾸미기 > 무기 작은 카테고리.

## 11. 미니게임 화면
- 작은 카테고리:
  - **무기 설정**(디폴트) — 오버레이 무기 슬롯 설정(캐릭터에서 이동, §6). 미니게임 클릭 시 가장 먼저 노출.
  - **배틀모드**. 내부에 **더 하위 카테고리**:
    - **덱 설정**(디폴트) — 컬렉션에서 빠진 덱 설정을 여기로.
    - **배틀 신청** — 현재 "방 정보"로 신청하던 배틀 신청 기능을 여기로.
  - **업적** — 기존 업적을 작은 카테고리로.
  - (추후 미니게임이 작은 카테고리로 더 추가될 예정.)

## 12. 작은 카테고리 아이콘 규칙
- 작은 카테고리도 **전부 텍스트 없이 아이콘만 + hover 툴팁**.

## 13. 편의성 화면
- 항목: **소환체 제거**, **뒤로 보내기**(기존 "바탕화면 모드" 개명 확정), **땅 복구**.

## 14. 설정 화면
- **작은 카테고리: 옵션 / 단축키**.
- 작은 카테고리와 **별개로 설정 화면 최상단**:
  - **⏻ 전원 아이콘 = 종료**.
  - 그 옆 **⟳ 새로고침 아이콘 = 업데이트 확인**(기능은 현재와 동일).
  - 종료/업데이트 버튼 **아래에 텍스트**로 **채팅 여는 법** 안내 + **F2 = 하단바 숨김**(신규 기능) 설명.
- **단축키** 작은 카테고리:
  - 조합키(모디파이어)를 **정해진 목록 선택이 아니라 원하는 키로 직접 커스텀**.
  - **조합키 미사용(=슬롯 키만으로)도 가능**.
  - 슬롯 1/2/3 키는 현재처럼 직접 설정 유지.
- **옵션** 작은 카테고리:
  - **언어 설정**(현재 한국어만).
  - **캐릭터 크기 조절**: 하단바 제외 캐릭터 전체. 현재 1, **최대 2 / 최소 0.5**.
  - **UI 크기 조절**: 하단바 포함.
  - **FPS 설정**: 최대 60.
- **제거**: 기존 설정의 개발자 기능, 평화모드, 채팅 열기 버튼 등.
- 참고: 6번째 이미지 = 레퍼런스 설정창.

## 15. 멀티플레이 화면
- 작은 카테고리: **데디케이트 / 로비**.
- **데디케이트**(현재 방식):
  - **접속할 주소 입력칸** + 그 아래 **현재 그 서버에 접속한 사람 리스트**.
- **로비**(추후 스팀용, 레퍼런스식 로비 생성 + 랜덤 조인):
  - 지금은 **작은 카테고리 버튼만 만들고 내부는 비움**(placeholder).

## 16. 진행 방식
- 위 내용을 반영한 **UI 목업(이미지)** 을 **개발 전에 먼저 공유** → 틀린 부분 수정 후 개발(규모가 커서 잘못된 개발은 토큰 낭비).

---
## 구현 진행 상황 (2026-07-31 갱신)
파일: `renderer/menu/menu-ui.js`(팝업 UI), **메뉴 전용 창** `renderer/menu/menu-window.html`+`menu-bridge.js`+`preload-menu.js`+`main.js`(창 생성·IPC), 연결: `renderer/app.js`(`MENU_BRIDGE`·`buildMenuSnap`·액션 디스패처), `renderer/index.html`(script).
- ✅ **1단계 셸/네비**: 좌측 레일 7 + 상단 아이콘 탭 + ✕/바깥/Esc 닫힘, 캐릭터 위 위치, hotzone(force) 연동.
- ✅ **곰 아이콘**: 꾸미기 탭 Ears/Eyes/Mouth = 곰 얼굴+부위 강조(입=人 주둥이), Hands=발바닥. Mouth 탭 신규.
- ✅ **편의성**: 소환체 제거 / 뒤로 보내기(토글) / 땅 복구.
- ✅ **멀티 데디케이트**: 서버주소+접속/나가기+접속자 리스트(로스터 변동 시 refresh). 로비=빈 탭.
- ✅ **설정**: 상단 종료/업데이트확인 + 채팅/F2 안내, 옵션(언어), 단축키(프리셋+**없음**+슬롯 키캡처). main `none` 모디파이어.
- ✅ **미니게임 배틀신청**: 접속자 목록+신청(roomInfo/challenge 인라인). 배틀모드 하위탭(덱설정·배틀신청).
- ✅ **미니게임 무기설정 인라인**: 단축키 슬롯 3칸 + 팔레트(catalog, slotEligible 필터, 획득먼저·미획득딤). 브리지 weaponSlots/setWeaponSlot/slotEligible/slotUsable. 데이터는 window.BattleGacha/BattleData/BattleArt 직접 사용.
- ✅ **컬렉션 인라인**: 소환체/무기 탭, 획득먼저+미획득 딤, 희귀도 색 테두리(덱설정 없음).
- ✅ **미니게임 덱설정 인라인**: 세트 A/B(각 setSize) + 무기 슬롯, 카탈로그(소환체/무기)에서 탭해 편성, ✕ 제거. G.getDeck/deckLimits/inDeck/isOwned/toggleDeck 직접 사용. (컬렉션에서 완전 분리)
- ✅ **미니게임 업적 인라인**: getAchievements 브리지(누적카운트/배틀참여/배틀승리 3종, 진행바).
- ✅ **옵션 FPS 상한**: 20~60 슬라이더(60=제한없음). frame() 렌더 스킵. 브리지 getFps/setFps, localStorage 'fps'.
- ✅ **F2 하단바 숨김**: main.js uiohook F2(비소모) → command 'toggle-bar' → app.js setBarHidden(토글·저장, 배틀 복원 시 유지). localStorage 'barHidden'. ⚠️ 오버레이 런타임 = npm start로 검증 필요.
- ✅ **조합키 완전 커스텀**: 원하는 키 직접 지정(Alt·Space·F키 등) + 없음. main.js `slotMod='custom'`+`slotModKey`(keysDown.has 체크), UiohookKey 이름으로 저장. 하위호환(기존 프리셋 문자열도 동작).
- ✅ **3단계 곰 아트**(2026-07-28): `renderer/animals.js` 캐릭터를 고양이→**둥근 갈색 곰**으로 전면 교체. 팔레트 `CAT`→`BEAR`(body/belly/ear/earIn + 신규 muzzle/nose), `furPalette`가 skin tint에서 muzzle=밝게·earIn=어둡게·nose=고정 산출. 크림 주둥이 오벌 + 검은 코(+글로스) + 검은 눈, **수염 제거**, 둥근 귀(default), 눈 위치 상향(eyeY hy-2). `DEFAULT_SHAPE`=ear:round·eye:round·tail:stub(shapesOf 폴백도 동일). `anchors` ear/eye Y 갱신. 슬랩/데미지(HP바·책상파손)/KO/깜빡임/자리비움/피격/모자/이름표/말풍선 상태 전부 유지 확인(오프스크린 하네스로 22종 렌더 검증). 배틀·오버레이 모두 이 단일 `AnimalArt.draw` 경유 → 자동 반영.
- ✅ **꾸미기 하위 카테고리 추가 — 책상/키보드/마우스**(2026-07-28): 아트 디자인 각 4종 + 멀티 전파까지 완료. `animals.js` `DESK_STYLES`/`KB_STYLES`/`MOUSE_STYLES`(+`*_ORDER`, resolver, export), draw 브랜치(책상 바·키보드 case/key·마우스 body/seam)가 `state.deskStyle`/`kbStyle`/`mouseStyle` 참조(위치·충돌·발판 고정). `app.js` me 초기화(localStorage)·`profileMsg`(desk/kb/mouse)·roster 피어 적용·`onCommand 'profile'`(스타일 리스트로 검증)·pushState. `server.js` roster/join/update 화이트리스트에 desk/kb/mouse 추가(**새 릴리스 시 서버 재시작 필요**). 오프스크린 하네스로 12스타일 픽셀 검증. **탭은 꾸미기 레일에 노출되나 선택 그리드 UI는 Phase 4에서 구현**(현재는 old settings 'profile' 커맨드/localStorage로만 설정 가능).
- ✅ **4단계 꾸미기 외형 그리드 UI**(2026-07-28): 꾸미기 9탭(Skins/Hats/Ears/Eyes/Mouth/Hands/키보드/마우스/책상) **실시간 곰 미리보기 타일 그리드**. `menu-ui.js dressupPane()` — 각 타일이 `AnimalArt.draw`로 해당 옵션 적용된 곰을 크롭 렌더(얼굴 크롭/책상 크롭), 현재값=핑크 테두리+✓, 미획득(모자)=딤+🔒·획득 먼저 정렬. 브리지 `getAppearance`/`hatOwned`/`setSkin`/`setHat`/`setShape`/`setDeskStyle`/`setKbStyle`/`setMouseStyle`(즉시 반영+`sendUpdate` 멀티 전파). **Hands 신규 외형 3종**(round/beans/mitten) animals.js `HAND_SHAPES`+pawPad 브랜치, `SHAPE_KEYS`에 'hand' 말단 추가(하위호환). 하네스로 9탭 전 프리뷰 고유 렌더 검증.
- ✅ **메뉴 셸 개선**(2026-07-28, 사용자 요청): (1) 팝업 **고정 크기**(364×540, 내용 무관) + 내부 세로 스크롤(`.hgm-ct overflow:auto`), 컬렉션 정도 기본 크기. (2) **캐릭터 드래그 시 메뉴 추종**·안 꺼짐: 백드롭 `pointer-events:none`(캔버스 드래그 통과) + `HGMenu.reposition` 을 app.js onCursor 드래그/드롭에서 호출. (3) **바깥 클릭 닫기**는 app.js canvas mousedown이 캐릭터 밖이면 `HGMenu.close()`. position()=top 기반 클램프. 닫힘 시 hostSync→`__bgModalChanged`→sendHotzone로 클릭통과 복원.
- ✅ **하단바 UI 톤 통일 + 햄버거=곰 발바닥**(2026-07-28, 사용자 요청): `#hud-bar` 살구(rgba(242,221,203))+`#e7b9a4` 테두리, `#counter` 진갈색 `#4a3324`+크림 `#ffe9c7`(곰 이름표 톤), `#btn-menu` 살구 배경+**발바닥 SVG**. 피어 캔버스 카운터(drawPeerCount)도 동일 색으로 일치.
- ✅ **꾸미기 Color/Skins 분리 + 아트 확장**(2026-07-28, 사용자 요청): 색 변경 탭='Color', 신규 'Skins' 탭(곰 몸통 아이콘)=머리/몸통/꼬리 문양 세트(`animals.js BODY_SKINS`: plain/cream/panda/heart/moon/star, 배 패치·하트·반달곰·별). **볼터치는 기본 곰에서 제거→Skins(heart·star)에만**(`BLUSH_SKINS`). 손 디자인 6종(round/pink/brown/claw/mitten/paw, 공유 `drawPaw`+export `drawHand`), **손 미리보기는 손만**(handThumb, 46px). 몸 스킨은 shape 채널로 전파(SHAPE_KEYS에 'body' 말단 추가; 서버 shape 그대로). 마우스 좌/우 버튼+스크롤휠 추가. 책상 채움을 몸통 바닥까지 확장→**F2 하단바 숨겨도 몸통 안 삐져나옴**. 메뉴 **가로 스크롤 제거**(overflow-x:hidden). **개발자(isDev)는 모자 등 가챠 없이 전부 사용**. **단축키 변경 시 표시 텍스트 일괄 갱신**(`refreshKeyUI`: 배틀HUD·열린메뉴·샵라벨). **상대 투명모드 버튼**을 상대 책상 왼쪽 모서리로 이동(눈뜬/눈감은 아이콘 토글).
- ✅ **5단계 소환 가챠 개편**(2026-07-28, §7): 소환(big=1)에 `gachaPane` 구현. 탭 [외형 소환][무기·소환체 소환], 재화 **루비**(BattleGacha gems 공용) 상단 1종 표기 + **루비 SVG 아이콘**, **1회/10회** 버튼(비용을 라벨 왼쪽 칩으로), **% 확률** 버튼(헤더 ✕ 옆, cat.pct)→토글로 등급 확률(일반45·고급40·희귀13·전설2%) 표시, 중앙 **쇼케이스**(무기=catIcon+등급색 테두리, 외형=곰+모자 미리보기), 뽑기 결과(획득/중복·NEW). 외형=모자 롤(희귀도 없음·동일 확률, ownedHats), 무기=기존 `BattleGacha.roll`. 브리지 gachaRubies/gachaPool/gachaOdds/rollGacha. 하네스로 양 탭·1/10연차·확률·재화차감 검증.
- ✅ **꾸미기 전면 소유(획득) 시스템**(2026-07-29, 사용자 요청): 기본 외형(`APPEAR_DEFAULTS` = skin:default·hat:none·ear:round·eye:round·mouth:smile·hand:round·kb:dark·mouse:white·desk:wood)을 **제외한 모든 꾸미기 아이템은 외형 소환으로 획득해야 활성화**(개발자 isDev는 전부 보유). `app.js` `ownedAppear` Set(localStorage, key=`"group:value"`, 구 `ownedHats`→`hat:*` 마이그레이션) + `isAppearOwned/grantAppear/appearPool`. 로드 시 미보유 항목은 기본값으로 리셋(불변식). **Skins는 프리셋 id 단위 소유** — `animals.js`로 `SKIN_PRESETS`(id 포함) 이관·export하여 app·menu 공용. 브리지 `appearOwned(group,value)` 추가, `gachaPool('appear')`=전 카테고리 `{group,value,owned}`, `rollGacha('appear')`=미보유 우선 랜덤 획득. `menu-ui.js`: 모든 꾸미기 탭 그리드에 🔒 잠금·보유 먼저 정렬·잠긴 타일 클릭 불가, 외형 소환 캡슐/획득 연출이 **카테고리별 미리보기**(`appearThumb`: skin=몸통·hat/ear/eye/mouth=얼굴·hand=손·kb/mouse/desk=책상 크롭) 렌더, **확률표는 꾸미기 하위 카테고리로 그룹핑**(희귀도 없이 균등 %). 하네스로 잠금 렌더·전 카테고리 풀·뽑기 NEW·카테고리 확률표 검증.
- ✅ **테마 꾸미기 대량 추가**(2026-07-29, 사용자 요청): (입) `MOUTH_SHAPES`에 `devil`(악마입=송곳니 씩웃음)·`mischief`(장난꾸러기=한쪽 올라간 스마일). (귀) antler/devil/goblin을 **둥근 귀 base 없이 귀 자리를 대체**하도록 수정(사슴뿔·악마뿔은 머리에서 자라남, 도깨비뿔=이마 가운데 단일 뿔·귀 없음). (바디) `BODY_SKINS`에 `fire`(가슴/배 애니 불꽃)·`goblin`(호피 허리감개), `TAIL_SHAPES`에 `devil`·`club`(방망이) 추가 + `drawBodySkin`에 `now` 전달(불 애니). 테마 스킨 프리셋 `불타는곰`(black+fire+devil꼬리)·`도깨비곰`(mint+goblin+club꼬리) — 스킨 적용 시 전용 꼬리도 함께 세팅(꼬리는 별도 탭 없이 스킨 번들, 로드 시 미보유 스킨이면 꼬리도 stub 리셋). (책상/키보드/마우스) 색 위에 덧그리는 **테마 오버레이**(`deskTheme`/`kbTheme`/`mouseTheme`): 책상 `oakgrain`(나이테)·`ember`(불)·`ice`(얼음), 키보드 `fire`·`aura`(발광)·`vine`(덩굴), 마우스 `fire`·`animal`(쥐 모양 귀+꼬리+눈)·`vine`. 배틀 기지(hideDeskItems)에선 책상 오버레이 생략. 신규 값은 전부 기존 shape 문자열/desk·kb·mouse 필드로 전파(새 메시지 타입 없음 → 서버 변경 불필요). 메뉴 라벨·애니 미리보기(EFFECT_VALUES) 갱신. 하네스로 전 신규 디자인 렌더 검증.
- ✅ **불타는 이펙트 통일 — `FX.burn`**(2026-07-29, 사용자 반복 피드백 반영): "촛불 하나 얹기"가 아니라 **사물을 감싸며 타오르는** 형태로 재설계. `animals.js` FX에 `burn(ctx, cx, cy, w, h, now, shape)` 추가 — (A)사물 실루엣(`shape:'round'|'rect'`)을 따라 도는 **불꽃 윤곽**(evenodd 링 2겹, 사물은 안에서 비쳐 보임) + (B)윗부분에서 솟구치는 **통짜 불꽃**(cusp licking 3겹) + 발광/불티, 전부 additive·now 애니. 넓은 사물(책상)은 솟는 불꽃 폭·글로우 반경을 캡. 적용: 불타는 **손**(drawPaw)·**눈**(per-eye)·**몸**(drawBodySkin fire=클립 없이 몸통 감쌈)·**키보드/마우스/책상**(kb/mouse/deskTheme, round/rect). 기존 `FX.flame` 단일 불꽃 호출 6곳 교체. 하네스로 실제 곰 6종 렌더 검증.
- ✅ **메뉴 전용 창(플랜 C) 전환 완료**(2026-07-31, 사용자 요청): 햄버거 메뉴를 오버레이 DOM → **별도 BrowserWindow**로 이관. 목적 = (1) **뒤로 보내기(desktopMode) ON에서도 메뉴만 최상단**, (2) 메뉴를 열고 닫을 때 오버레이 z-order·포커스를 건드려 생기던 **깜빡임 제거**.
  - **구조**: `main.js` 메뉴 전용 창(frameless·transparent·alwaysOnTop 'screen-saver'·skipTaskbar, 캐릭터 앵커 기준 배치·워크에어리어 클램프) + IPC 라우팅(`menu-open/close-req/move/snap/action/invoke/closed`). `preload-menu.js`(rid 기반 invoke 왕복) · `renderer/menu/menu-window.html` · `renderer/menu/menu-bridge.js`.
  - **상태 단일 소유**: 상태(BattleGacha·ownedAppear·keybinds…)는 **오버레이가 단독 소유**. 메뉴 창엔 `battle/gacha.js`를 **로드하지 않고** 스냅샷 기반 읽기 전용 facade로 `window.BattleGacha`를 대체 → 같은 상태가 두 프로세스에 존재하는 이중화가 원천 차단. 창엔 순수 데이터·아트만 로드(`animals.js`·`battle/units.js`·`battle/art.js`).
  - **스냅샷**: `app.js buildMenuSnap()` — 파라미터 있는 getter 8종을 맵으로 직렬화(`appearOwned`/`appearCount`={group:{value:…}}, `slotUsable`/`slotEligible`/`inDeck`/`ownedUnits`={id:…}, `craftMats`/`gachaPool`={kind:[…]}, `gachaOdds`=배열). 카탈로그는 메뉴가 쓰는 6필드만 투영(전투 스탯 통째 전송 방지).
  - **디스패처**: `onMenuAction`→`MENU_BRIDGE[fn]` 실행 후 **스냅샷 재푸시**, `onMenuInvoke`(가챠·조합)→결과를 rid로 반환 후 재푸시. 결과는 `plainClone`(JSON 왕복)으로 구조화 복제 안전 보장. 덱 편성은 facade `toggleDeck`→`MENU_BRIDGE.toggleDeck`.
  - **깜빡임 차단**: 메뉴가 오버레이 DOM이 아니므로 `.hgmenu-back`이 없어 hotzone `force`가 **끝까지 false** → `forceInteractive`가 안 뒤집히고 `applyLayer()`/`pushToTop`/`pushToBottom`이 **호출되지 않음**(실측 확인). 브리지의 `setFocusable`/`setShapeRect`는 no-op.
  - **작업표시줄 z-order 복구 축소**: `scheduleTopReassert`에 `topReassertAllowed()` 게이트 추가. → **2026-07-31 실측 후 이 함수 자체를 제거**했다(아래 항목 참고).
  - **재렌더 가드**(§7 innerHTML 함정): 액션마다 스냅샷이 오므로 `HGMenu.refresh()`가 잦아짐 → **뽑기 연출 중·단축키 캡처 대기 중·입력칸 포커스 중**엔 재렌더를 건너뛴다. 창 재사용 시 `menu-close`로 DOM을 먼저 헐어 `open()` 토글 함정 방지(에코 루프는 `shutting` 플래그로 차단).
  - **검증**(실제 앱 CDP 구동): 8개 카테고리 22개 패널 전부 렌더·에러 0, 액션 라우팅(setHat·setWeaponSlot·toggleDeck·setFps·togglePeersDim·kickUser·togglePeerLock·setDevCoinMode·setDevBeam) 정상, invoke(rollGacha) Promise 왕복 + 연출 유지, **오버레이 실제 상태 변경 확인**(localStorage hat/fps), 스냅샷 왕복 반영, `menuMove`로 창이 캐릭터 추종, **desktopMode ON에서도 메뉴 창 정상 표시**, ✕/토글/재오픈 정상, force 기록 전 구간 `[]`.
- ✅ **z-order / 땅 파임 가려짐 — 오판 두 번 끝에 정리**(2026-07-31). ⚠️ **아래 결론만 믿을 것. 중간에 내렸던 두 판단은 둘 다 틀렸다.**
  - ❌ **오판 1**: "작업표시줄은 topmost가 아니니 우리를 못 덮는다 → `scheduleTopReassert` 불필요" — 40초 샘플링 한 번으로 일반화했는데 **틀렸다**. `Shell_TrayWnd`의 topmost 여부는 **고정이 아니라 상황에 따라 승격**한다. 실제로 `Shell_TrayWnd[TOP]`가 오버레이 위에 있는 상태를 나중에 관측했다. 지웠던 `scheduleTopReassert`를 **되살렸다 — 다시 지우지 말 것.**
  - ❌ **오판 2**: "`setAlwaysOnTop(false→true 'screen-saver')`가 PowerShell `SetWindowPos`와 동등" — **틀렸다.** 그건 topmost *속성*만 다시 켤 뿐, 이미 topmost인 창들 사이에서 **맨 위로 재삽입하지 않는다**. 그래서 작업표시줄이 위에 있으면 아무 효과가 없었고, 배포본에서 땅 파임 가려짐이 재발했다.
  - ✅ **최종**: `pushToTop()` = `setAlwaysOnTop(true,'screen-saver')` + **`win.moveTop()`**. `moveTop`이 `SetWindowPos(HWND_TOP, SWP_NOACTIVATE)` 역할이라 포커스를 안 뺏으면서 재삽입하고, PowerShell spawn도 없다. A/B 검증: 오버레이를 topmost 창 밑으로 밀어 **깨진 상태를 재현**한 뒤 작업표시줄 클릭 한 번에 **400ms 내 복구**·유지.
  - ✅ **`setFocusable`이 근본 원인 축**이었다. 이 API가 창 스타일을 재구성하면서 (a) topmost 밴드 내 위치를 잃고 (b) `skipTaskbar`(셸 등록)를 되살려 **작업표시줄에 BeatBear 아이콘이 튀어나오고** (c) 재합성 깜빡임을 낸다. 대응: 호출 직후 `keepOffTaskbar()`(=`setSkipTaskbar(true)`) + 한 박자(60ms) 뒤 값싼 재삽입. 이때 **두 번째는 `reassertOverlay()`를 부르면 안 된다** — 내부 `stripWin11Chrome`이 powershell.exe를 spawn해서 채팅 보낼 때마다 히치가 생긴다(실제로 그렇게 만들었다가 되돌림).
  - 🔎 **아직 남은 것**: 작업표시줄 앱 활성/비활성 시 약한 깜빡임(= 재삽입 자체의 비용, 땅 파임 유지와 맞바꾸는 관계) · 채팅 보낼 때 약한 깜빡임(`setFocusable` + `stripWin11Chrome` 1회). **근본책은 채팅 입력칸을 메뉴처럼 별도 창으로 빼는 것** — 그러면 `setFocusable`을 아예 안 쓰게 되어 위 축이 통째로 사라진다. 사용자가 "이 정도면 됐다"고 해서 보류.
  - 🧪 **다음에 이 영역을 만질 때**: 한 번의 샘플링으로 결론짓지 말 것. 깨진 상태를 재현(내 소유의 TopMost 창을 오버레이 위로 강제 삽입)한 뒤 **A/B 대조**로 확인해야 한다. `Shell_TrayWnd`는 외부 `SetWindowPos`를 무시하므로 작업표시줄 자체로는 재현이 안 된다.
  - `pushToBottom`(HWND_BOTTOM)은 네이티브 대응이 없어 PowerShell 유지.
- ✅ **확률(%) 팝업 고정 크기 + 스크롤**(2026-07-31, 사용자 요청): 항목이 늘면 카드가 계속 커지던 것 → **카드 크기 고정, 넘치는 만큼만 본문 스크롤**. 원인은 `.hgm-obody`가 flex 자식 기본값 `min-height:auto`라 내용보다 작아지지 못해 `overflow:auto`가 발동하지 못한 것 → `flex:1 1 auto; min-height:0`으로 해결하고 카드는 `height:calc(100% - 28px); max-height:420px`. 실측: 항목 62개(외형)·26개(무기) 모두 카드 424px 동일, 창(556) 안에 완전히 들어가고 본문 1729px가 372px 안에서 스크롤(1357px 이동 확인).

## 개발 시 주의(불변식 유지)
- 멀티 일관성/오버레이 규칙 등 기존 불변식 유지. 새 릴레이 메시지 추가 시 server.js 화이트리스트 등록.
- 큰 개편이므로 단계적 구현(먼저 셸/네비 → 각 화면).
