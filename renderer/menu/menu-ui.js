// renderer/menu/menu-ui.js — 새 햄버거 팝업 메뉴(캐릭터 위에 뜨는 콤팩트 팝업)
// 1단계: 셸+네비게이션. 2단계: 기존 기능 이관(멀티/편의성/설정 등).
//   좌측 아이콘 레일 = 큰 카테고리, 상단 아이콘 탭 = 작은 카테고리. ✕/바깥클릭/Esc 닫힘.
// app.js 가 HGMenu.setBridges(...) 로 실제 로직을 주입. 콘텐츠 미이관 화면은 스텁.
// 클릭통과: .hgmenu-back 이 DOM에 있으면 app.js sendHotzone()이 force=true. 설계: docs/menu-redesign.md
(function () {
  'use strict'

  // 곰용 작은 아이콘 — 귀여운 곰 얼굴에 해당 부위를 강조(귀/눈/입), 손은 발바닥
  const I_EAR = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<circle cx="6" cy="6.5" r="4.4" fill="#8a6a4a"/><circle cx="18" cy="6.5" r="4.4" fill="#8a6a4a"/>' +
    '<circle cx="6" cy="6.5" r="2" fill="#f0c9a0"/><circle cx="18" cy="6.5" r="2" fill="#f0c9a0"/>' +
    '<circle cx="12" cy="14" r="7.4" fill="#cda474"/>' +
    '<circle cx="9.3" cy="13" r="1.1" fill="#5a4436"/><circle cx="14.7" cy="13" r="1.1" fill="#5a4436"/>' +
    '<ellipse cx="12" cy="16" rx="1.5" ry="1.1" fill="#5a4436"/></svg>'
  const I_EYE = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<circle cx="6.5" cy="7" r="3" fill="#cda474"/><circle cx="17.5" cy="7" r="3" fill="#cda474"/>' +
    '<circle cx="12" cy="14" r="7.4" fill="#cda474"/>' +
    '<circle cx="9.1" cy="12.6" r="2.4" fill="#3a2a20"/><circle cx="14.9" cy="12.6" r="2.4" fill="#3a2a20"/>' +
    '<circle cx="8.4" cy="11.9" r="0.75" fill="#fff"/><circle cx="14.2" cy="11.9" r="0.75" fill="#fff"/>' +
    '<ellipse cx="12" cy="16.6" rx="1.3" ry="1" fill="#5a4436"/></svg>'
  const I_MOUTH = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<circle cx="6.5" cy="7" r="3" fill="#cda474"/><circle cx="17.5" cy="7" r="3" fill="#cda474"/>' +
    '<circle cx="12" cy="13" r="7.6" fill="#cda474"/>' +
    '<circle cx="9.2" cy="11.2" r="0.95" fill="#5a4436"/><circle cx="14.8" cy="11.2" r="0.95" fill="#5a4436"/>' +
    '<ellipse cx="12" cy="16" rx="4.6" ry="3.4" fill="#f4e2c8" stroke="#4a3324" stroke-width="0.9"/>' +
    '<ellipse cx="12" cy="14.6" rx="1.2" ry="0.85" fill="#3a2a20"/>' +
    '<path d="M12 15.3 L12 16.9 M12 16.9 L10 18.5 M12 16.9 L14 18.5" stroke="#3a2a20" stroke-width="0.95" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const I_PAW = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<g fill="#9a6a3a" stroke="#4a3324" stroke-width="0.9" stroke-linejoin="round">' +
    '<ellipse cx="5.6" cy="10.6" rx="1.8" ry="2.6"/><ellipse cx="9.6" cy="6.9" rx="1.9" ry="2.9"/>' +
    '<ellipse cx="14.4" cy="6.9" rx="1.9" ry="2.9"/><ellipse cx="18.4" cy="10.6" rx="1.8" ry="2.6"/>' +
    '<path d="M5.7 16.2 C5.7 13.3 9 12.7 12 12.7 C15 12.7 18.3 13.3 18.3 16.2 C18.3 19.9 15.4 22.1 12 22.1 C8.6 22.1 5.7 19.9 5.7 16.2 Z"/>' +
    '</g></svg>'
  const I_DESK = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<rect x="2.5" y="7" width="19" height="4" rx="1.2" fill="#c99a63" stroke="#6b4a2a" stroke-width="1"/>' +
    '<rect x="4.4" y="11" width="2.3" height="8.5" fill="#a97c48" stroke="#6b4a2a" stroke-width="0.8"/>' +
    '<rect x="17.3" y="11" width="2.3" height="8.5" fill="#a97c48" stroke="#6b4a2a" stroke-width="0.8"/></svg>'
  // 꾸미기 = 옷장(양문 캐비닛 + 손잡이 + 다리)
  const I_WARDROBE = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<rect x="4.5" y="2.6" width="15" height="17.4" rx="1.6" fill="#c99a63" stroke="#6b4a2a" stroke-width="1.1"/>' +
    '<line x1="12" y1="3.6" x2="12" y2="19" stroke="#6b4a2a" stroke-width="1"/>' +
    '<rect x="10.3" y="9.6" width="1.15" height="3.4" rx="0.55" fill="#5a3a1e"/>' +
    '<rect x="12.55" y="9.6" width="1.15" height="3.4" rx="0.55" fill="#5a3a1e"/>' +
    '<rect x="5.6" y="20" width="2" height="2.3" rx="0.4" fill="#a97c48" stroke="#6b4a2a" stroke-width="0.7"/>' +
    '<rect x="16.4" y="20" width="2" height="2.3" rx="0.4" fill="#a97c48" stroke="#6b4a2a" stroke-width="0.7"/></svg>'
  // Skins = 기본 갈색곰(색+몸 통합) — 실제 곰 캐릭터를 그대로 축소한 아이콘
  function bearIconDataURL(crop) {
    try {
      const A = window.AnimalArt; if (!A || !A.draw) return ''
      const W = 40, H = 40, cv = document.createElement('canvas'); cv.width = W; cv.height = H
      const ctx = cv.getContext('2d')
      const rx = crop[0], ry = crop[1], rw = crop[2], rh = crop[3], s = Math.min(W / rw, H / rh)
      ctx.save(); ctx.translate((W - rw * s) / 2, (H - rh * s) / 2); ctx.scale(s, s); ctx.translate(-rx, -ry)
      A.draw(ctx, 'bear', { seed: 0, hp: 100 }, 0)
      ctx.restore(); return cv.toDataURL()
    } catch (e) { return '' }
  }
  const _bearIcon = bearIconDataURL([42, 22, 156, 140])   // 머리+몸(책상 제외)
  const I_BODY = _bearIcon
    ? `<img src="${_bearIcon}" width="19" height="19" style="display:block" alt="곰">`
    : '<svg viewBox="0 0 24 24" width="19" height="19"><circle cx="6.4" cy="6.8" r="3.3" fill="#bd8a5e"/><circle cx="17.6" cy="6.8" r="3.3" fill="#bd8a5e"/><circle cx="12" cy="13" r="7.6" fill="#bd8a5e"/><circle cx="9.3" cy="11.8" r="1" fill="#3a2a20"/><circle cx="14.7" cy="11.8" r="1" fill="#3a2a20"/><ellipse cx="12" cy="15.4" rx="3" ry="2.3" fill="#ecd6b4"/></svg>'
  // 곰발바닥 주화 — 색만 다른 두 재화. Paw Coin(황금·외형) / Grizzle Coin(빨강·무기+소환체)
  function coinSVG(base, edge, rim, paw) {
    return '<svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align:-3px">' +
      `<circle cx="12" cy="12" r="10.5" fill="${base}" stroke="${edge}" stroke-width="1.6"/>` +
      `<circle cx="12" cy="12" r="8.5" fill="none" stroke="${rim}" stroke-width="1" opacity="0.85"/>` +
      `<g fill="${paw}">` +
      '<ellipse cx="7.8" cy="10.7" rx="1.3" ry="1.7"/><ellipse cx="10.4" cy="8.8" rx="1.4" ry="1.9"/>' +
      '<ellipse cx="13.6" cy="8.8" rx="1.4" ry="1.9"/><ellipse cx="16.2" cy="10.7" rx="1.3" ry="1.7"/>' +
      '<ellipse cx="12" cy="15" rx="4" ry="3.2"/></g></svg>'
  }
  const COIN_PAW = coinSVG('#f2c236', '#b9862a', '#ffe89a', '#6b4326')       // Paw Coin(황금)
  const COIN_GRIZZLE = coinSVG('#e2503f', '#a3271f', '#ff9d86', '#7a3320')   // Grizzle Coin(빨강)
  // 소환체 아이콘 — 소환 포털에서 솟아오르는 불꽃 소환체 느낌
  const I_SUMMON = '<svg viewBox="0 0 24 24" width="19" height="19">' +
    '<ellipse cx="12" cy="19.4" rx="8.6" ry="2.8" fill="#ff8a3c"/>' +
    '<ellipse cx="12" cy="19.4" rx="8.6" ry="2.8" fill="none" stroke="#ffd27a" stroke-width="1"/>' +
    '<path d="M12 3.5 C15.2 8 15.8 12.5 14 17 L10 17 C8.2 12.5 8.8 8 12 3.5 Z" fill="#e0552a"/>' +
    '<path d="M9.6 9 L6.8 6.2 M14.4 9 L17.2 6.2" stroke="#e0552a" stroke-width="1.7" stroke-linecap="round"/>' +
    '<circle cx="6.6" cy="12.3" r="0.9" fill="#ffd27a"/><circle cx="17.4" cy="13" r="0.9" fill="#ffd27a"/><circle cx="12" cy="2.8" r="1" fill="#fff2c0"/></svg>'

  const NAV = [
    { ic: I_WARDROBE, name: '꾸미기', tabs: [[I_BODY, 'Skins'], ['🎩', 'Hats'], [I_EAR, 'Ears'], [I_EYE, 'Eyes'], [I_MOUTH, 'Mouth'], [I_PAW, 'Paw'], ['⌨️', '키보드'], ['🖱️', '마우스'], [I_DESK, '책상']] },
    { ic: '🎲', name: '소환', pct: true, tabs: [['🎀', '외형 소환'], ['🗡️', '무기·소환체 소환'], ['♻️', '조합']] },
    { ic: '🌐', name: '멀티플레이', tabs: [['🖥️', '데디케이트'], ['🌐', '로비']] },
    { ic: '📖', name: '컬렉션', tabs: [[I_SUMMON, '소환체'], ['🗡️', '무기']] },
    { ic: '🎮', name: '미니게임', tabs: [['🎯', '무기 설정'], ['⚔️', '배틀모드'], ['🏆', '업적']] },
    { ic: '⚡', name: '편의성', tabs: [] },
    { ic: '⚙️', name: '설정', tabs: [['🎚️', '옵션'], ['⌨️', '단축키']] },
    { ic: '🛠️', name: '개발자', tabs: [], dev: true },   // 개발자(BEATBEAR_DEV=1)에게만 노출
  ]

  const STYLE_ID = 'hgmenu-style'
  if (!document.getElementById(STYLE_ID)) {
    const st = document.createElement('style'); st.id = STYLE_ID
    st.textContent = `
    .hgmenu-back{position:fixed;inset:0;z-index:2147483200;background:transparent;pointer-events:none;font-family:"Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif}
    .hgm-pop{position:fixed;pointer-events:auto;width:364px;height:540px;max-height:calc(100vh - 20px);display:flex;background:#f2ddcb;border:2px solid #e7b9a4;border-radius:14px;box-shadow:0 12px 26px rgba(120,80,60,.32);overflow:hidden}
    .hgm-rail{width:48px;background:#ead0c0;display:flex;flex-direction:column;gap:4px;padding:8px 5px;border-right:2px solid #e2b7a2}
    .hgm-rbtn{position:relative;height:40px;border:none;border-radius:9px;background:transparent;font-size:20px;cursor:pointer}
    .hgm-rbtn.on{background:#e78f8f;box-shadow:inset 0 0 0 2px #cf7676}
    .hgm-body{flex:1;display:flex;flex-direction:column;min-width:0}
    .hgm-hd{display:flex;align-items:center;gap:6px;padding:7px 8px;background:#eab0a0}
    .hgm-tabs{display:flex;gap:4px;flex:1;flex-wrap:wrap;min-width:0}
    .hgm-tb{position:relative;width:32px;height:30px;border:none;border-radius:8px;background:#f5e3d6;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .hgm-tb.on{background:#fff3ea;box-shadow:inset 0 0 0 2px #e78f8f}
    .hgm-x,.hgm-pct{width:30px;height:30px;border:none;border-radius:8px;background:#f0cabb;cursor:pointer;font-size:14px;font-weight:700;color:#8a4a4a}
    .hgm-pct{font-size:13px}
    .hgm-ct{padding:12px;flex:1;overflow-y:auto;overflow-x:hidden;color:#5b4238}
    .hgm-stub{font-size:12.5px;color:#8a705f;line-height:1.7;background:#fbeee3;border:1px dashed #e0b7a5;border-radius:10px;padding:14px}
    .hgm-stub b{color:#b56a4a}
    .hgm-subtabs{display:flex;gap:5px;margin-bottom:10px}
    .hgm-stb{flex:1;height:28px;border:none;border-radius:7px;background:#ecd6c6;font-size:12px;color:#6b4f43;cursor:pointer}
    .hgm-stb.on{background:#fff3ea;box-shadow:inset 0 0 0 2px #e78f8f;font-weight:700}
    .hgm-cgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
    .hgm-cell{position:relative;background:#fbeee3;border:2px solid #e6d3c4;border-radius:11px;padding:6px 3px 4px;text-align:center}
    .hgm-cell.lock{opacity:.36;filter:grayscale(.55)}
    .hgm-cico{height:34px;display:flex;align-items:center;justify-content:center}
    .hgm-cico svg{width:32px;height:32px}
    .hgm-cname{font-size:9.5px;color:#6b4f43;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hgm-clk{position:absolute;top:2px;right:4px;font-size:10px}
    .hgm-cnt{position:absolute;top:2px;left:3px;font-size:9px;font-weight:800;background:#d24b3e;color:#fff;padding:0 4px;border-radius:8px;line-height:15px;box-shadow:0 1px 2px rgba(0,0,0,.2)}
    .hgm-cnote{font-size:12px;color:#8a6d4b;margin:6px 2px 8px}
    .hgm-crow{display:flex;align-items:center;gap:3px;justify-content:center;flex-wrap:wrap;margin:8px 0}
    .hgm-cslot{width:42px;height:42px;border-radius:9px;background:#f6ead9;border:2px dashed #c2a983;display:flex;align-items:center;justify-content:center;color:#c2a983;font-size:18px;cursor:pointer;overflow:hidden}
    .hgm-cslot.filled{border-style:solid;border-color:#d79a63}
    .hgm-cslot svg,.hgm-cslot canvas{width:30px;height:30px}
    .hgm-cplus{color:#a98d7c;font-weight:800;font-size:12px}
    .hgm-carrow{color:#c98b52;font-weight:800;font-size:20px;margin:0 5px}
    .hgm-cres{width:52px;height:52px;border-radius:10px;background:#ffe9c7;border:2px solid #eab94c;display:flex;align-items:center;justify-content:center;color:#c98b52;font-size:26px;font-weight:800;overflow:hidden}
    .hgm-cbtns{display:flex;gap:8px;align-items:center;margin:8px 0}
    .hgm-cclear{background:#efe3d2;border:1px solid #d8bd9c;border-radius:16px;padding:7px 14px;font-size:12px;color:#8a6d4b;cursor:pointer}
    .hgm-cresbox{display:flex;flex-direction:column;align-items:center;gap:3px;background:#fff6ec;border:1px solid #e7cdb6;border-radius:10px;padding:8px;margin:6px 0}
    .hgm-cresbox .rn{font-size:12px;font-weight:700;color:#5b4238}
    .hgm-cresbox canvas,.hgm-cresbox svg{width:44px;height:44px}
    .hgm-wslots{display:flex;gap:6px;margin-bottom:10px}
    .hgm-wslot{position:relative;flex:1;border-radius:10px;padding:6px 3px 4px;text-align:center;background:#fbeee3;border:2px solid #e6d3c4;cursor:pointer}
    .hgm-wslot.on{border-color:#e78f8f;background:#fff3ea}
    .hgm-wkey{font-size:10px;font-weight:800;color:#c05a7a}
    .hgm-wico{height:28px;display:flex;align-items:center;justify-content:center}
    .hgm-wico svg{width:26px;height:26px}
    .hgm-wclr{position:absolute;top:-6px;right:-6px;width:16px;height:16px;border-radius:50%;background:#d9534f;color:#fff;border:none;font-size:10px;cursor:pointer;line-height:1;padding:0}
    .hgm-setrow{border:1.5px solid #e6d3c4;border-radius:10px;padding:7px;margin-bottom:8px;cursor:pointer;background:#fbeee3}
    .hgm-setrow.active{border-color:#e78f8f;background:#fff3ea}
    .hgm-setlbl{font-size:11px;color:#6b4f43;margin-bottom:5px}
    .hgm-dslots{display:flex;gap:5px;flex-wrap:wrap}
    .hgm-dslot{width:34px;height:34px;border-radius:8px;background:#f4e6da;border:1.5px dashed #d8c0ae;display:flex;align-items:center;justify-content:center;position:relative}
    .hgm-dslot.filled{border-style:solid;border-color:#c9a074;background:#fff}
    .hgm-dslot svg{width:26px;height:26px}
    .hgm-drm{position:absolute;top:-6px;right:-6px;width:15px;height:15px;border-radius:50%;background:#d9534f;color:#fff;border:none;font-size:9px;cursor:pointer;padding:0;line-height:1}
    .hgm-cell.indeck{box-shadow:0 0 0 2px #6fae5a inset}
    .hgm-cell.sel{border-color:#e78f8f;box-shadow:0 0 0 2px #e78f8f inset}
    .hgm-gtop{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px}
    .hgm-glabel{font-size:13px;font-weight:800;color:#8a5a6a;display:inline-flex;align-items:center;gap:4px}
    .hgm-glabel.weapon{color:#5a6472}
    .hgm-wallet{display:inline-flex;align-items:center;gap:9px;padding:4px 10px 4px 8px;border-radius:9px;background:#efe0cf;border:1.4px solid #d8bd9c;box-shadow:inset 0 1px 3px rgba(120,90,60,.22);cursor:default}   /* 정보 리드아웃(버튼 아님) */
    .hgm-wlab{font-size:9px;font-weight:800;color:#a98d7c;letter-spacing:.5px}
    .hgm-wchip{display:inline-flex;align-items:center;gap:4px;font-size:14px;font-weight:800;color:#5b4238}
    .hgm-gpaw{font-size:15px;filter:grayscale(.1)}
    .hgm-odds{background:#fbeee3;border:1px solid #ecd6c6;border-radius:8px;padding:7px 9px;margin-bottom:9px;font-size:11px;color:#6b4f43;text-align:center;line-height:1.7}
    .hgm-gwrap{display:flex;flex-direction:column;height:100%}
    .hgm-gbtns{display:flex;gap:8px;margin-top:9px}
    .hgm-gbtn{flex:1;border:none;border-radius:12px;padding:12px 6px;background:#e78f8f;color:#fff;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}
    .hgm-gbtn:hover{background:#e07a7a} .hgm-gbtn:disabled{opacity:.5;cursor:default}
    .hgm-gcost{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:700;background:rgba(0,0,0,.16);padding:2px 7px;border-radius:10px}
    .hgm-gstage{position:relative;flex:1;min-height:236px;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center;border:2px solid #e7b9a4}
    .hgm-gstage.appear{background:radial-gradient(120% 95% at 50% 18%,#fff0f5,#f4c9d8)}
    .hgm-gstage.weapon{background:radial-gradient(120% 95% at 50% 18%,#eef1f6,#bfc8d6);border-color:#9aa6b6}
    /* 소환 대기: 가챠폰 기계 없이 캡슐만 클러스터로 둥실 + 소프트 장식 */
    .hgm-capfield{position:absolute;inset:0}
    .hgm-capfield.dim{opacity:.28;filter:saturate(.7)}
    .hgm-cglow{position:absolute;left:50%;top:50%;width:270px;height:210px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,200,226,.55),transparent 68%);pointer-events:none}
    .hgm-gstage.weapon .hgm-cglow{background:radial-gradient(circle,rgba(175,202,240,.5),transparent 68%)}
    .hgm-gstage.rolling .hgm-cglow{animation:hgmcharge .5s ease-in forwards}
    .hgm-cped{position:absolute;left:50%;bottom:20px;width:212px;height:38px;transform:translateX(-50%);border-radius:50%;background:rgba(255,255,255,.5);border:1.5px solid rgba(255,200,222,.55)}
    .hgm-gstage.weapon .hgm-cped{border-color:rgba(160,180,210,.55)}
    .hgm-cacc{position:absolute;font-size:18px;opacity:.82;filter:drop-shadow(0 1px 1px rgba(0,0,0,.15))}
    .hgm-cspark{position:absolute;width:7px;height:7px;background:radial-gradient(circle,#fff,transparent 70%);animation:hgmtwinkle 2.4s ease-in-out infinite}
    .hgm-cap{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;transform:translate(var(--dx,0px),var(--dy,0px));transition:transform .45s cubic-bezier(.4,0,.6,1),opacity .4s}
    .hgm-gstage.rolling .hgm-cap{animation:hgmconverge .6s cubic-bezier(.55,0,.75,1) forwards}
    .hgm-gstage.rolling .hgm-capin{animation:none}
    .hgm-capin{position:relative;width:100%;height:100%;border-radius:50%;background:linear-gradient(180deg,var(--rc,#e6d3c4) 0 49%,#fdf6ee 49% 100%);border:1.6px solid rgba(120,90,70,.3);box-shadow:0 2px 4px rgba(0,0,0,.13),inset 0 -6px 9px rgba(90,70,70,.1);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;animation:hgmbob 2.8s ease-in-out infinite}
    .hgm-capin::before{content:'';position:absolute;left:2px;right:2px;top:49%;height:1.5px;background:rgba(90,60,50,.26)}
    .hgm-capin::after{content:'';position:absolute;left:50%;top:24%;width:11px;height:11px;transform:translateX(-50%);border-radius:50%;background:#f4e9dc;border:1px solid rgba(90,60,50,.32)}
    .hgm-caphi{position:absolute;left:24%;top:16%;width:26%;height:15%;border-radius:50%;background:rgba(255,255,255,.55);transform:rotate(-25deg)}
    .hgm-capico{position:relative;z-index:1;margin-bottom:5px;display:flex;align-items:center;justify-content:center}
    .hgm-capico canvas,.hgm-capico svg{width:22px;height:22px;display:block}
    .hgm-drop{position:absolute;left:50%;margin-left:-16px;width:32px;height:32px;border-radius:50%;z-index:4;box-shadow:0 2px 5px rgba(0,0,0,.3);animation:hgmdrop .92s cubic-bezier(.3,.1,.6,1) forwards}
    .hgm-drop.appear{background:radial-gradient(circle at 38% 32%,#fff,#f6a6bf)}
    .hgm-drop.weapon{background:radial-gradient(circle at 38% 32%,#eef,#8b95a5)}
    .hgm-drop::after{content:'';position:absolute;left:50%;top:50%;width:24px;height:24px;margin:-12px;border-radius:50%;background:radial-gradient(circle,#fff 0%,var(--dg,#ffe89a) 42%,transparent 72%);opacity:0;animation:hgmburst .5s ease-out .52s forwards}
    .hgm-tray{position:absolute;left:8px;right:8px;bottom:10px;display:flex;gap:5px;justify-content:center;align-items:center;flex-wrap:wrap;max-height:120px;z-index:5}
    .hgm-tchip{position:relative;width:38px;height:46px;border-radius:8px;background:#fff;border:2px solid var(--rc,#e6d3c4);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 10px var(--rc,#ccc);animation:hgmpop .4s cubic-bezier(.2,.9,.3,1.3) both}
    .hgm-tchip .tn{font-size:8px;font-weight:800;margin-top:1px}
    .hgm-gstage.rolling .hgm-mach{animation:hgmshake .38s ease-in-out infinite}
    .hgm-gstage.glow{animation:hgmglow .5s ease-in-out 2}
    @keyframes hgmbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes hgmtwinkle{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}
    @keyframes hgmcharge{0%{opacity:.7;transform:translate(-50%,-50%) scale(1)}60%{opacity:1;transform:translate(-50%,-50%) scale(1.25);filter:brightness(1.4)}100%{opacity:1;transform:translate(-50%,-50%) scale(.4);filter:brightness(1.9)}}
    @keyframes hgmconverge{0%{transform:translate(var(--dx),var(--dy)) scale(1) rotate(0);opacity:1}55%{transform:translate(calc(var(--dx)*.45),calc(var(--dy)*.45)) scale(1.08) rotate(120deg);opacity:1}100%{transform:translate(0,0) scale(.12) rotate(300deg);opacity:0}}
    @keyframes hgmshake{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-3px) rotate(-2.5deg)}75%{transform:translateX(3px) rotate(2.5deg)}}
    @keyframes hgmdrop{0%{top:38px;opacity:0}18%{opacity:1}50%{top:150px}60%{top:141px}70%{top:150px}100%{top:150px;opacity:1}}
    @keyframes hgmburst{0%{transform:scale(.4);opacity:.25}35%{opacity:1}100%{transform:scale(16);opacity:0}}
    @keyframes hgmflashr{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.7)}}
    @keyframes hgmpop{0%{transform:scale(.2) translateY(-8px);opacity:0}70%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
    @keyframes hgmglow{0%,100%{box-shadow:inset 0 0 0 rgba(255,255,255,0)}50%{box-shadow:inset 0 0 45px var(--gc,#fff)}}
    /* 중앙 획득 연출 */
    .hgm-mach.dim{opacity:.28;filter:saturate(.7)}
    .hgm-reveal{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:6;overflow:hidden}
    .hgm-rays{position:absolute;width:280px;height:280px;border-radius:50%;background:repeating-conic-gradient(var(--gc,#ffd86b) 0deg 9deg, transparent 9deg 18deg);opacity:var(--ro,.35);animation:hgmspin 9s linear infinite}
    .hgm-halo{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,var(--gc,#ffe89a) 0%,transparent 68%);opacity:.7}
    .hgm-flash{position:absolute;inset:0;background:#fff;pointer-events:none;animation:hgmflashout .5s ease-out forwards}
    /* 뽑기 연출: 캡슐 → 빛줄기가 시계방향으로 하나씩 뻗음 → 화면 전체 화이트아웃 */
    .hgm-burst{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:7;overflow:hidden}
    .hgm-brays{position:absolute;left:50%;top:50%;width:0;height:0}
    .hgm-bray{position:absolute;left:-3px;bottom:0;width:6px;height:14px;transform-origin:50% 100%;background:linear-gradient(to top,rgba(255,255,255,.95),rgba(255,255,255,0));border-radius:3px;opacity:0;animation:hgmray .5s ease-out forwards}
    .hgm-bglow{position:absolute;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,var(--dg,#fff) 0%,transparent 65%);animation:hgmbglow .9s ease-in forwards}
    .hgm-bcap{position:absolute;width:34px;height:34px;border-radius:50%;box-shadow:0 0 22px 8px #fff;animation:hgmbcap .9s ease-in forwards}
    .hgm-bcap.appear{background:radial-gradient(circle at 38% 32%,#fff,#f6a6bf)}
    .hgm-bcap.weapon{background:radial-gradient(circle at 38% 32%,#eef,#8b95a5)}
    .hgm-whiteout{position:absolute;inset:0;background:#fff;opacity:0;animation:hgmwhite 1.15s ease-in forwards}
    @keyframes hgmray{0%{height:14px;opacity:0}22%{opacity:1}100%{height:124px;opacity:.12}}
    @keyframes hgmbglow{0%{transform:scale(.3);opacity:.2}40%{opacity:.9}100%{transform:scale(4);opacity:0}}
    @keyframes hgmbcap{0%{transform:scale(.5);opacity:0}18%{transform:scale(1);opacity:1}55%{transform:scale(1.15)}100%{transform:scale(2.4);opacity:0}}
    @keyframes hgmwhite{0%,55%{opacity:0}100%{opacity:1}}
    @keyframes hgmflashout{0%{opacity:1}100%{opacity:0}}
    /* 퀄리티 업 — 뽑기 충격파 + 획득 회전 글로우/스파클/힌트 */
    .hgm-bshock{position:absolute;width:46px;height:46px;border-radius:50%;border:3px solid var(--dg,#fff);opacity:0;animation:hgmshock .78s cubic-bezier(.2,.6,.3,1) .2s forwards}
    @keyframes hgmshock{0%{transform:scale(.3);opacity:0}22%{opacity:.95}100%{transform:scale(6.4);opacity:0}}
    .hgm-rring{position:absolute;width:216px;height:216px;border-radius:50%;background:conic-gradient(from 0deg,transparent,var(--gc,#ffd86b),transparent 62%);opacity:.5;filter:blur(1px);animation:hgmspin 3.2s linear infinite}
    .hgm-rspark{position:absolute;left:50%;top:50%;width:7px;height:7px;border-radius:50%;background:radial-gradient(circle,#fff,var(--gc,#ffe089) 55%,transparent);transform:translate(-50%,-50%);opacity:0;animation:hgmrspark .85s ease-out both}
    @keyframes hgmrspark{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}22%{opacity:1}100%{transform:translate(calc(-50% + var(--tx,0px)),calc(-50% + var(--ty,0px))) scale(.3);opacity:0}}
    .hgm-rhint{position:absolute;bottom:9px;left:0;right:0;text-align:center;font-size:11px;font-weight:700;color:#8a6d4b;opacity:0;animation:hgmhint .5s ease-out .55s forwards}
    @keyframes hgmhint{to{opacity:.92}}
    .hgm-items{position:relative;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;max-width:94%}
    .hgm-ritem{display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,.94);border:2.5px solid var(--rc,#e6d3c4);border-radius:12px;box-shadow:0 0 12px var(--rc,#ccc);animation:hgmreveal .45s cubic-bezier(.2,.9,.3,1.35) both}
    .hgm-ritem.one{width:96px;height:104px;gap:3px}
    .hgm-ritem.many{width:44px;height:52px}
    .hgm-ritem .rn{font-size:10px;font-weight:700;color:#5b4238;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hgm-ritem.many .rn{font-size:8px}
    .hgm-rbadge{font-size:10px;font-weight:800;padding:1px 8px;border-radius:9px;color:#fff;margin-top:2px}
    .hgm-rtag{position:absolute;bottom:8px;font-size:9px;font-weight:800;padding:1px 8px;border-radius:9px}
    @keyframes hgmspin{to{transform:rotate(360deg)}}
    @keyframes hgmflash{0%{opacity:.92}100%{opacity:0}}
    @keyframes hgmreveal{0%{transform:scale(.2) translateY(-14px) rotate(-6deg);opacity:0}55%{transform:scale(1.22) rotate(3deg);opacity:1}74%{transform:scale(.95) rotate(-1deg)}100%{transform:scale(1) rotate(0);opacity:1}}
    /* 확률 팝업(별도 모달) */
    .hgm-omodal{position:fixed;inset:0;z-index:2147483400;display:flex;align-items:center;justify-content:center;background:rgba(40,26,20,.4);font-family:"Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif}
    .hgm-ocard{width:300px;max-height:72vh;background:#fbeee3;border:2px solid #e7b9a4;border-radius:14px;display:flex;flex-direction:column;box-shadow:0 14px 30px rgba(120,80,60,.45);overflow:hidden}
    .hgm-ohd{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;font-weight:800;font-size:14px;color:#5b4238;background:#eab0a0}
    .hgm-obody{padding:8px 13px 12px;overflow:auto}
    .hgm-onote{font-size:10.5px;color:#8a705f;margin:2px 0 8px}
    .hgm-ocat{display:flex;justify-content:space-between;font-weight:800;font-size:13px;margin:11px 0 3px;padding-bottom:3px;border-bottom:1.5px dashed #e0c3b2}
    .hgm-oitem{display:flex;justify-content:space-between;font-size:12px;color:#6b4f43;padding:3px 6px;border-radius:6px}
    .hgm-oitem:nth-child(even){background:rgba(255,255,255,.5)}
    .hgm-oclose{border:none;background:#f0cabb;color:#8a4a4a;border-radius:8px;width:26px;height:26px;font-weight:800;cursor:pointer;font-size:13px}
    .hgm-prev{display:flex;align-items:center;justify-content:center;min-height:38px;margin-bottom:1px}
    .hgm-prev canvas{display:block;border-radius:7px;background:#eef3f7}
    .hgm-ach{background:#fbeee3;border:1.5px solid #ecd6c6;border-radius:10px;padding:9px 10px;margin-bottom:8px}
    .hgm-achhd{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#5b4238}
    .hgm-achbar{height:6px;background:#e6d3c4;border-radius:3px;margin-top:6px;overflow:hidden}
    .hgm-achfill{height:100%;background:#6fae5a;border-radius:3px}
    .hgm-sec{font-size:11px;color:#9a7d6c;margin:2px 2px 7px;letter-spacing:.3px}
    .hgm-dim{color:#a98d7c}
    .hgm-note{font-size:10.5px;color:#8a705f;line-height:1.6;background:#fbeee3;border-radius:9px;padding:8px 9px;margin:10px 0 12px}
    .hgm-note b{color:#b56a4a}
    .hgm-arow{display:flex;align-items:center;gap:10px;padding:11px;background:#fbeee3;border-radius:11px;margin-bottom:8px;border:1.5px solid #ecd6c6;font-size:13px;color:#5b4238;cursor:pointer}
    .hgm-arow:hover{background:#fff3ea}
    .hgm-ai{font-size:18px;width:22px;text-align:center}
    .hgm-arow .hgm-dim{font-size:10.5px;margin-top:2px}
    .hgm-field{width:100%;padding:8px 10px;border-radius:9px;border:1.5px solid #dcc0b0;background:#fff8f2;font-size:12px;margin-bottom:8px;color:#5b4238}
    .hgm-btn{border:none;border-radius:9px;padding:8px 12px;background:#e78f8f;color:#fff;font-weight:700;font-size:12px;cursor:pointer}
    .hgm-btn.ghost{background:#e2c6b6;color:#7a4b4b}
    .hgm-btn:disabled{opacity:.5;cursor:default}
    .hgm-users{max-height:200px;overflow:auto}
    .hgm-ubtn{border:none;border-radius:7px;background:#f0cabb;font-size:12px;line-height:1;padding:4px 7px;margin-left:3px;cursor:pointer}
    .hgm-ubtn.on{background:#d9534f}
    .hgm-ubtn.kick{background:#e2c6b6}
    .hgm-u{display:flex;align-items:center;gap:8px;padding:7px 6px;border-bottom:1px solid #ecd8c9;font-size:12px}
    .hgm-ava{width:22px;height:22px;border-radius:50%;background:#cdb08d;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}
    .hgm-uname{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hgm-dot{width:8px;height:8px;border-radius:50%;background:#6fae5a}
    .hgm-opt{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px;font-size:12px}
    .hgm-opt select{padding:5px 8px;border-radius:7px;border:1.5px solid #dcc0b0;background:#fff8f2;font-size:12px}
    .hgm-opt input[type=range]{flex:1;accent-color:#e78f8f;margin:0 8px}
    .hgm-toprow{display:flex;gap:8px;margin-bottom:9px}
    .hgm-topbtn{flex:1;border:none;border-radius:10px;padding:9px 0;background:#f0cabb;font-size:13px;font-weight:700;color:#7a4b4b;cursor:pointer}
    .hgm-topbtn:hover{background:#eab89f}
    .hgm-keyrow{display:flex;align-items:center;gap:8px;margin-bottom:9px;font-size:12px}
    .hgm-keyrow select{margin-left:auto;padding:5px 8px;border-radius:7px;border:1.5px solid #dcc0b0;background:#fff8f2;font-size:12px}
    .hgm-keycap{margin-left:auto;min-width:52px;text-align:center;padding:6px 12px;background:#fff3ea;border:1.5px solid #e0b7a5;border-radius:8px;font-weight:800;color:#7a4b4b;cursor:pointer}
    .hgm-rbtn[data-tip]:hover::after,.hgm-tb[data-tip]:hover::after{content:attr(data-tip);position:absolute;white-space:nowrap;background:#4a3a30;color:#fff;font-size:11px;padding:3px 7px;border-radius:6px;z-index:5;pointer-events:none}
    .hgm-rbtn[data-tip]:hover::after{left:112%;top:50%;transform:translateY(-50%)}
    .hgm-tb[data-tip]:hover::after{top:110%;left:50%;transform:translateX(-50%)}
    `
    document.head.appendChild(st)
  }

  let B = {}                          // 앱이 주입하는 실제 로직 브리지
  function setBridges(b) { B = Object.assign(B, b || {}) }

  let root = null, curPop = null, lastAnchor = null
  let big = 0
  let battleSub = 0   // 미니게임>배틀모드 하위: 0=덱설정, 1=배틀신청
  let gachaOdds = false, gachaResult = null, gachaRolling = false, gachaPending = null   // 소환: 최근 결과 / 뽑는 중 / 확정 대기(연출용)
  let gachaPick = null   // 캡슐에 보여줄 랜덤 아이템 세트(소환 화면 새로 접근할 때마다 갱신)
  let craftMode = 0, craftSel = [], craftResult = null   // 조합: 0=꾸미기·1=무기, 선택 재료, 결과
  let previewTiles = [], previewRAF = 0   // 이펙트(불/빛/눈물) 미리보기 타일 애니메이션
  let wsSel = 0       // 무기 설정에서 선택된 단축키 슬롯(0/1/2)
  let deckSet = 'A'   // 덱 편성 대상 세트
  let deckCat = 'unit' // 덱 카탈로그 필터(unit/weapon)
  let colRar = 'all', deckRar = 'all', wsRar = 'all'   // 컬렉션/덱/무기설정 희귀도 필터
  let wsCat = 'weapon'   // 무기 설정 카테고리(무기 디폴트 / 소환체)
  const smallSel = NAV.map(() => 0)

  function hostSync() { try { if (window.__bgModalChanged) window.__bgModalChanged() } catch (e) {} }
  function isOpen() { return !!root }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) }

  // ── 콘텐츠(팬) 빌더 ── 각 {html, wire?(pop, rerender)} 반환 ─────────────────
  function settingsTop() {
    return `<div class="hgm-toprow">
        <button class="hgm-topbtn" data-act="quit">⏻ 종료</button>
        <button class="hgm-topbtn" data-act="upd">⟳ 업데이트 확인</button>
      </div>
      <div class="hgm-note">💬 <b>Ctrl+Shift+B</b> : 채팅 열기 · Enter 전송/Esc 취소</div>`
  }
  function wireTop(pop) {
    const q = pop.querySelector('[data-act="quit"]'); if (q) q.onclick = () => { if (B.quit) B.quit() }
    const u = pop.querySelector('[data-act="upd"]'); if (u) u.onclick = () => { if (B.checkUpdate) B.checkUpdate() }
  }

  function conveniencePane() {
    const dm = B.getDesktopMode ? !!B.getDesktopMode() : false
    const dimOn = B.getPeersDim ? !!B.getPeersDim() : false
    const html =
      `<div class="hgm-arow" data-act="clear"><span class="hgm-ai">🧹</span><div><div>소환체 제거</div><div class="hgm-dim">내 소환체·투사체 전부 정리</div></div></div>` +
      `<div class="hgm-arow" data-act="dim"><span class="hgm-ai">👁️</span><div><div>투명 모드 ${dimOn ? '<b style="color:#5f9e4a">ON</b>' : '<span class="hgm-dim">OFF</span>'}</div><div class="hgm-dim">모든 상대를 투명하게(토글)</div></div></div>` +
      `<div class="hgm-arow" data-act="desk"><span class="hgm-ai">🖼️</span><div><div>뒤로 보내기 ${dm ? '<b style="color:#5f9e4a">ON</b>' : '<span class="hgm-dim">OFF</span>'}</div><div class="hgm-dim">다른 창 뒤로 보내 데스크톱 펫처럼</div></div></div>` +
      `<div class="hgm-arow" data-act="restore"><span class="hgm-ai">🌱</span><div><div>땅 복구</div><div class="hgm-dim">파인 지형 원상복구</div></div></div>`
    return {
      html, wire(pop, rr) {
        pop.querySelector('[data-act="clear"]').onclick = () => { if (B.clearSummons) B.clearSummons() }
        pop.querySelector('[data-act="dim"]').onclick = () => { if (B.togglePeersDim) B.togglePeersDim(); rr() }
        pop.querySelector('[data-act="desk"]').onclick = () => { if (B.toggleDesktopMode) B.toggleDesktopMode(); rr() }
        pop.querySelector('[data-act="restore"]').onclick = () => { if (B.restoreBar) B.restoreBar() }
      }
    }
  }

  function devPane() {
    const mode = B.getDevCoinMode ? B.getDevCoinMode() : null
    const seg = (val, label) => `<button class="hgm-stb ${(val ? mode === val : !mode) ? 'on' : ''}" data-dev="${val}">${label}</button>`
    const html =
      `<div class="hgm-sec">코인 상자 뿌리기 <span class="hgm-dim">개발자 전용</span></div>` +
      `<div class="hgm-subtabs">${seg('', '⛔ 끄기')}${seg('paw', coinIcon('paw') + ' 파우')}${seg('grizzle', coinIcon('grizzle') + ' 그리즐')}</div>` +
      `<div class="hgm-note">켜면 오버레이 화면을 <b>좌클릭</b>한 지점에 코인 상자가 생깁니다. 멀티에서는 <b>가장 먼저 클릭한 사람</b>이 해당 코인 1개를 획득해요. (상자는 클릭 전까지 유지)</div>`
    return {
      html, wire(pop, rr) {
        pop.querySelectorAll('[data-dev]').forEach((b) => b.onclick = () => { if (B.setDevCoinMode) B.setDevCoinMode(b.dataset.dev || null); rr() })
      }
    }
  }

  function dediPane() {
    const conn = B.isConnected ? B.isConnected() : false
    const server = B.getServer ? B.getServer() : 'ws://localhost:8787'
    const roster = (B.getRoster ? B.getRoster() : []) || []
    const iAmHost = B.isHost ? !!B.isHost() : false
    function userRow(u) {
      const meTag = u.me ? ' <span class="hgm-dim">(나)</span>' : ''
      const crown = u.host ? ' 👑' : ''
      let right = '<span class="hgm-dot"></span>'
      if (iAmHost && !u.me && u.id != null) {   // 호스트만: 상대 무기잠금·강퇴 버튼
        const locked = B.isPeerLocked ? !!B.isPeerLocked(u.id) : false
        right = `<button class="hgm-ubtn ${locked ? 'on' : ''}" data-wlock="${u.id}" title="무기·소환체 사용 ${locked ? '잠금됨 — 클릭해 허용' : '허용 — 클릭해 잠금'}">${locked ? '🚫' : '⚔️'}</button>` +
                `<button class="hgm-ubtn kick" data-kick="${u.id}" title="강퇴">👢</button>`
      }
      return `<div class="hgm-u"><div class="hgm-ava">${esc((u.name || '?')[0])}</div><div class="hgm-uname">${esc(u.name || '?')}${meTag}${crown}</div>${right}</div>`
    }
    const list = roster.length ? roster.map(userRow).join('') : '<div class="hgm-dim" style="padding:10px 2px">접속 중이 아니거나 접속자가 없어요.</div>'
    const html =
      `<div class="hgm-sec">서버 주소</div>` +
      `<input class="hgm-field" id="hgm-srv" value="${esc(server)}" ${conn ? 'disabled' : ''} placeholder="ws://localhost:8787">` +
      `<div style="display:flex;gap:6px;margin-bottom:12px"><button class="hgm-btn" id="hgm-conn" style="flex:1" ${conn ? 'disabled' : ''}>접속</button><button class="hgm-btn ghost" id="hgm-disc" style="flex:1" ${conn ? '' : 'disabled'}>나가기</button></div>` +
      `<div class="hgm-sec">이 서버에 접속 중 (${roster.length})${iAmHost ? ' · 👑호스트: ⚔️무기잠금/👢강퇴' : ''}</div><div class="hgm-users">${list}</div>` +
      `<div class="hgm-note">서버가 곧 방입니다. 한 명이 서버를 켜고 주소를 공유하면 함께 놀 수 있어요.</div>`
    return {
      html, wire(pop, rr) {
        const c = pop.querySelector('#hgm-conn'), d = pop.querySelector('#hgm-disc'), inp = pop.querySelector('#hgm-srv')
        if (c) c.onclick = () => { const v = inp.value.trim(); if (v && B.connect) { B.connect(v); setTimeout(rr, 350) } }
        if (d) d.onclick = () => { if (B.disconnect) B.disconnect(); setTimeout(rr, 120) }
        pop.querySelectorAll('[data-wlock]').forEach((b) => b.onclick = () => { if (B.togglePeerLock) B.togglePeerLock(+b.dataset.wlock); rr() })
        pop.querySelectorAll('[data-kick]').forEach((b) => b.onclick = () => { if (B.kickUser) B.kickUser(+b.dataset.kick); setTimeout(rr, 200) })
      }
    }
  }
  function lobbyPane() {
    return { html: `<div class="hgm-stub">🌐 <b>로비</b><br>스팀 연동 시 로비 생성·랜덤 조인 예정. 지금은 데디케이트 탭을 사용하세요.</div>` }
  }

  function optionsPane() {
    const fps = B.getFps ? B.getFps() : 60
    const html = settingsTop() +
      `<div class="hgm-opt">화면 전환 <button class="hgm-btn ghost" id="hgm-switchview" style="padding:6px 12px">🖥️ 다음 모니터</button></div>` +
      `<div class="hgm-opt">언어 <select><option>한국어</option></select></div>` +
      `<div class="hgm-opt">FPS <input type="range" id="hgm-fps" min="20" max="60" step="5" value="${fps}"><span id="hgm-fpsv" class="hgm-dim">${fps}</span></div>`
    return {
      html, wire(pop) {
        wireTop(pop)
        const sv = pop.querySelector('#hgm-switchview'); if (sv) sv.onclick = () => { if (B.switchView) B.switchView() }
        const f = pop.querySelector('#hgm-fps'); if (f) f.oninput = () => { pop.querySelector('#hgm-fpsv').textContent = f.value; if (B.setFps) B.setFps(+f.value) }
      }
    }
  }
  function modLabelOf(m) { return m === 'none' ? '없음' : m === 'alt' ? 'Alt' : m === 'ctrlalt' ? 'Ctrl+Alt' : m === 'ctrlshift' ? 'Ctrl+Shift' : m === 'caps' ? 'CapsLock' : (m || 'Alt') }
  function keysPane() {
    const kb = B.getKeybinds ? B.getKeybinds() : { mod: 'alt', keys: ['Z', 'X', 'C'] }
    const slots = [0, 1, 2].map((i) => `<div class="hgm-keyrow">슬롯 ${i + 1}<button class="hgm-keycap" data-slot="${i}">${esc((kb.keys[i] || '?').toUpperCase())}</button></div>`).join('')
    const html = settingsTop() +
      `<div class="hgm-sec">조합키 (버튼 클릭 후 원하는 키를 누르세요)</div>` +
      `<div class="hgm-keyrow">조합키<button class="hgm-keycap" id="hgm-mod">${esc(modLabelOf(kb.mod))}</button><button class="hgm-btn ghost" id="hgm-modnone" style="padding:6px 10px">없음</button></div>` +
      `<div class="hgm-sec">슬롯 키 (버튼 클릭 후 원하는 키 입력)</div>${slots}` +
      `<div class="hgm-note">조합키를 원하는 키로 직접 지정할 수 있어요(Alt·Space·F키 등). "없음" = 조합키 없이 슬롯 키만으로 발동.</div>`
    return {
      html, wire(pop, rr) {
        wireTop(pop)
        const setMod = (m) => { if (B.setKeybinds) B.setKeybinds({ mod: m, keys: kb.keys.slice() }); rr() }
        const noneBtn = pop.querySelector('#hgm-modnone'); if (noneBtn) noneBtn.onclick = () => setMod('none')
        const modBtn = pop.querySelector('#hgm-mod')
        if (modBtn) modBtn.onclick = () => {
          modBtn.textContent = '…'
          if (B.setFocusable) B.setFocusable(true)   // 키 입력 캡처엔 창 포커스 필요(캡처 동안만)
          const onk = (e) => { e.preventDefault(); e.stopPropagation(); window.removeEventListener('keydown', onk, true); if (B.setFocusable) B.setFocusable(false); const name = modKeyName(e); if (name) setMod(name); else rr() }
          window.addEventListener('keydown', onk, true)
        }
        pop.querySelectorAll('.hgm-keycap[data-slot]').forEach((btn) => {
          btn.onclick = () => {
            const slot = +btn.dataset.slot; btn.textContent = '…'
            if (B.setFocusable) B.setFocusable(true)   // 키 입력 캡처엔 창 포커스 필요(캡처 동안만)
            const onk = (e) => {
              e.preventDefault(); e.stopPropagation()
              window.removeEventListener('keydown', onk, true); if (B.setFocusable) B.setFocusable(false)
              const name = keyName(e)
              if (name) { const keys = kb.keys.slice(); keys[slot] = name; if (B.setKeybinds) B.setKeybinds({ mod: kb.mod, keys }) }
              rr()
            }
            window.addEventListener('keydown', onk, true)
          }
        })
      }
    }
  }
  function modKeyName(e) {
    const k = e.key
    if (k === 'Escape') return null
    if (k === 'Alt') return 'Alt'; if (k === 'Control') return 'Ctrl'; if (k === 'Shift') return 'Shift'; if (k === 'Meta') return 'Meta'
    if (k === ' ') return 'Space'; if (k === 'CapsLock') return 'CapsLock'; if (k === 'Tab') return 'Tab'
    if (/^[a-zA-Z0-9]$/.test(k)) return k.toUpperCase()
    if (/^F([1-9]|1[0-2])$/.test(k)) return k
    return null
  }
  function keyName(e) {
    if (e.key === 'Escape') return null
    if (/^[a-zA-Z0-9]$/.test(e.key)) return e.key.toUpperCase()
    if (/^F([1-9]|1[0-2])$/.test(e.key)) return e.key
    return null
  }

  function stubPane(name, sub) {
    return { html: `<div class="hgm-stub">🚧 <b>${esc(name)}${sub ? ' › ' + esc(sub) : ''}</b><br>이 화면은 다음 단계에서 이관·구현됩니다.</div>` }
  }

  function battleReqInner() {
    const info = B.roomInfo ? B.roomInfo() : null
    if (!info || !info.connected) return { html: '<div class="hgm-stub">멀티 접속 후 배틀 신청이 가능합니다.<br>(멀티플레이 › 데디케이트에서 접속)</div>' }
    const peers = info.peers || []
    const rec = (w, p) => `${w || 0}승 ${Math.max(0, (p || 0) - (w || 0))}패`
    const list = peers.length
      ? peers.map((p) => `<div class="hgm-u"><div class="hgm-ava">${esc((p.name || '?')[0])}</div><div class="hgm-uname">${esc(p.name)}<div class="hgm-dim" style="font-size:10px">⚔ ${rec(p.wins, p.plays)}</div></div><button class="hgm-btn" data-ch="${p.id}" style="padding:5px 12px">신청</button></div>`).join('')
      : '<div class="hgm-dim" style="padding:10px 2px">접속한 다른 유저가 없어요.</div>'
    return {
      html: `<div class="hgm-sec">배틀 신청 (접속 유저 ${peers.length})</div><div class="hgm-users">${list}</div>`,
      wire(pop) { pop.querySelectorAll('[data-ch]').forEach((b) => b.onclick = () => { close(); if (B.challenge) B.challenge(+b.dataset.ch) }) }
    }
  }
  function catIcon(id, size) { return (window.BattleArt && window.BattleArt.icon) ? window.BattleArt.icon(id, size) : '🔩' }
  function rarInfo(rk) { const D = window.BattleData; return (D && D.RARITY && D.RARITY[rk]) || { name: rk || '', color: '#c9a074' } }
  const RAR_ORDER = ['legend', 'rare', 'uncommon', 'common']   // 전설 먼저
  const RAR_BTNS = [['all', '전체'], ['legend', '전설'], ['rare', '희귀'], ['uncommon', '고급'], ['common', '일반']]
  function rarFilterBar(cur, attr) {   // 희귀도 필터 버튼 줄
    return `<div class="hgm-subtabs" style="flex-wrap:wrap;gap:4px">` + RAR_BTNS.map(([k, n]) => {
      const col = k !== 'all' ? rarInfo(k).color : ''
      return `<button class="hgm-stb ${cur === k ? 'on' : ''}" data-${attr}="${k}" style="${cur === k && col ? 'box-shadow:inset 0 0 0 2px ' + col : ''};flex:0 0 auto;padding:0 10px">${n}</button>`
    }).join('') + `</div>`
  }
  const cntBadge = (n) => (n >= 2 ? '<div class="hgm-cnt">×' + n + '</div>' : '')   // 보유 2개 이상만 개수 표기
  function rarGrid(items, cellFn, rarFilter) {   // 전체=희귀도별 그룹 헤더, 특정=해당 등급만
    if (rarFilter && rarFilter !== 'all') {
      const gi = items.filter((e) => e.rarity === rarFilter)
      return gi.length ? `<div class="hgm-cgrid">${gi.map(cellFn).join('')}</div>` : '<div class="hgm-dim" style="padding:8px 2px">해당 희귀도 없음</div>'
    }
    return RAR_ORDER.map((rk) => {
      const gi = items.filter((e) => e.rarity === rk); if (!gi.length) return ''
      const info = rarInfo(rk), own = gi.filter((i) => i.owned).length
      return `<div class="hgm-sec" style="color:${info.color};font-weight:800;margin-top:9px">${esc(info.name)} · ${own}/${gi.length}</div><div class="hgm-cgrid">${gi.map(cellFn).join('')}</div>`
    }).join('')
  }
  function collectionPane() {
    const G = window.BattleGacha
    if (!G || !G.catalog) return stubPane('컬렉션')
    const cat = smallSel[3] === 1 ? 'weapon' : 'unit'
    const items = G.catalog().filter((e) => e.cat === cat)
    const owned = items.filter((i) => i.owned).length
    const cellFn = (e) => {
      const info = rarInfo(e.rarity)
      return `<div class="hgm-cell ${e.owned ? '' : 'lock'}" title="${esc(e.name)}" style="border-color:${info.color}"><div class="hgm-cico">${catIcon(e.id, 32)}</div><div class="hgm-cname">${esc(e.name)}</div>${e.owned ? '' : '<div class="hgm-clk">🔒</div>'}${cntBadge(e.count)}</div>`
    }
    return {
      html: `<div class="hgm-sec">${cat === 'weapon' ? '무기' : '소환체'} 컬렉션 — 획득 ${owned}/${items.length}</div>` + rarFilterBar(colRar, 'cr') + rarGrid(items, cellFn, colRar),
      wire(pop, rr) { pop.querySelectorAll('[data-cr]').forEach((b) => b.onclick = () => { colRar = b.dataset.cr; rr() }) }
    }
  }
  function weaponSettingsPane() {
    const G = window.BattleGacha
    if (!G || !G.catalog || !B.weaponSlots) return stubPane('미니게임', '무기 설정')
    const st = B.weaponSlots(), slots = st.slots || [], keys = st.keys || []
    const chips = slots.map((id, i) => {
      const has = id && id !== 'none'
      return `<div class="hgm-wslot ${wsSel === i ? 'on' : ''}" data-slot="${i}"><div class="hgm-wkey">${esc(keys[i] || '-')}</div><div class="hgm-wico">${has ? catIcon(id, 26) : '<span style="color:#b9a48f;font-size:18px">·</span>'}</div>${has ? `<button class="hgm-wclr" data-clr="${i}">✕</button>` : ''}</div>`
    }).join('')
    const items = G.catalog().filter((e) => (!B.slotEligible || B.slotEligible(e.id)) && e.cat === wsCat)
    const cellFn = (e) => {
      const inSlot = slots.indexOf(e.id), info = rarInfo(e.rarity)
      const badge = inSlot >= 0 ? '<div class="hgm-clk" style="color:#5f9e4a;font-weight:800">✓</div>' : (e.owned ? '' : '<div class="hgm-clk">🔒</div>')
      return `<div class="hgm-cell ${e.owned ? '' : 'lock'} ${inSlot >= 0 ? 'indeck' : ''}" data-id="${e.id}" title="${esc(e.name)}" style="border-color:${info.color}"><div class="hgm-cico">${catIcon(e.id, 30)}</div><div class="hgm-cname">${esc(e.name)}</div>${badge}${cntBadge(e.count)}</div>`
    }
    const wsCatBtns = `<div class="hgm-subtabs"><button class="hgm-stb ${wsCat === 'weapon' ? 'on' : ''}" data-wc="weapon">⚔ 무기</button><button class="hgm-stb ${wsCat === 'unit' ? 'on' : ''}" data-wc="unit">${I_SUMMON} 소환체</button></div>`
    return {
      html: `<div class="hgm-sec">단축키 슬롯 (선택 후 아래에서 탭해 배정)</div><div class="hgm-wslots">${chips}</div><div class="hgm-sec">보유 아이템</div>` + wsCatBtns + rarFilterBar(wsRar, 'wr') + rarGrid(items, cellFn, wsRar),
      wire(pop, rr) {
        pop.querySelectorAll('[data-slot]').forEach((el) => el.onclick = () => { wsSel = +el.dataset.slot; rr() })
        pop.querySelectorAll('[data-clr]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); if (B.setWeaponSlot) B.setWeaponSlot(+b.dataset.clr, 'none'); rr() })
        pop.querySelectorAll('[data-wc]').forEach((b) => b.onclick = () => { wsCat = b.dataset.wc; rr() })
        pop.querySelectorAll('[data-wr]').forEach((b) => b.onclick = () => { wsRar = b.dataset.wr; rr() })
        pop.querySelectorAll('.hgm-cell[data-id]').forEach((c) => c.onclick = () => { const id = c.dataset.id; if (B.slotUsable && !B.slotUsable(id)) return; if (B.setWeaponSlot) B.setWeaponSlot(wsSel, id); wsSel = (wsSel + 1) % 3; rr() })
      }
    }
  }
  function deckPane() {
    const G = window.BattleGacha
    if (!G || !G.getDeck) return { html: '<div class="hgm-stub">덱 데이터 없음</div>' }
    const lim = G.deckLimits(), deck = G.getDeck()
    const slotHtml = (id) => id
      ? `<div class="hgm-dslot filled" title="${esc(id)}">${catIcon(id, 26)}<button class="hgm-drm" data-rm="${esc(id)}">✕</button></div>`
      : '<div class="hgm-dslot"></div>'
    const fill = (arr, n) => Array.from({ length: n }, (_, i) => arr[i] || null)
    const slotsA = fill(deck.unitsA, lim.setSize), slotsB = fill(deck.unitsB, lim.setSize), wpn = fill(deck.weapons, lim.weapons)
    const setRow = (which, slots) => `<div class="hgm-setrow ${deckSet === which ? 'active' : ''}" data-set="${which}"><div class="hgm-setlbl">세트 ${which} <span class="hgm-dim">${slots.filter(Boolean).length}/${lim.setSize}</span>${deckSet === which ? ' <span style="color:#c05a7a">◀ 편성중</span>' : ''}</div><div class="hgm-dslots">${slots.map(slotHtml).join('')}</div></div>`
    const items = G.catalog().filter((e) => e.cat === deckCat)
    const cellFn = (e) => {
      const info = rarInfo(e.rarity), indeck = G.inDeck(e.id)
      const badge = indeck ? '<div class="hgm-clk" style="color:#5f9e4a;font-weight:800">✓</div>' : (e.owned ? '' : '<div class="hgm-clk">🔒</div>')
      return `<div class="hgm-cell ${e.owned ? '' : 'lock'} ${indeck ? 'indeck' : ''}" data-id="${e.id}" title="${esc(e.name)}" style="border-color:${info.color}"><div class="hgm-cico">${catIcon(e.id, 30)}</div><div class="hgm-cname">${esc(e.name)}</div>${badge}${cntBadge(e.count)}</div>`
    }
    const catBtns = `<div class="hgm-subtabs" style="margin-top:8px"><button class="hgm-stb ${deckCat === 'unit' ? 'on' : ''}" data-dc="unit">${I_SUMMON} 소환체</button><button class="hgm-stb ${deckCat === 'weapon' ? 'on' : ''}" data-dc="weapon">⚔ 무기</button></div>`
    const html = `<div class="hgm-sec">배틀 덱 — 소환체 ${deck.unitsA.length + deck.unitsB.length}/${lim.units} · 무기 ${deck.weapons.length}/${lim.weapons}</div>` +
      setRow('A', slotsA) + setRow('B', slotsB) +
      `<div class="hgm-sec">⚔ 무기</div><div class="hgm-dslots" style="margin-bottom:4px">${wpn.map(slotHtml).join('')}</div>` +
      catBtns + rarFilterBar(deckRar, 'dr') + rarGrid(items, cellFn, deckRar)
    return {
      html, wire(pop, rr) {
        pop.querySelectorAll('[data-set]').forEach((r) => r.onclick = () => { deckSet = r.dataset.set; rr() })
        pop.querySelectorAll('[data-dc]').forEach((b) => b.onclick = () => { deckCat = b.dataset.dc; rr() })
        pop.querySelectorAll('[data-dr]').forEach((b) => b.onclick = () => { deckRar = b.dataset.dr; rr() })
        pop.querySelectorAll('[data-rm]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); G.toggleDeck(b.dataset.rm); rr() })
        pop.querySelectorAll('.hgm-cell[data-id]').forEach((c) => c.onclick = () => { const id = c.dataset.id; if (!G.isOwned(id)) return; G.toggleDeck(id, deckSet); rr() })
      }
    }
  }
  function achievementsPane() {
    const list = B.getAchievements ? B.getAchievements() : null
    if (!list) return stubPane('미니게임', '업적')
    const rows = list.map((a) => {
      const pct = a.done ? 100 : Math.min(100, Math.round((a.cur / Math.max(1, a.goal)) * 100))
      const status = a.done ? '✅ 전 단계 달성 완료' : `${(a.cur || 0).toLocaleString()} / ${(a.goal || 0).toLocaleString()} · ${a.cleared || 0}단계`
      return `<div class="hgm-ach"><div class="hgm-achhd"><span>${esc(a.icon)} ${esc(a.title)}</span><span class="hgm-dim">${a.reward}</span></div><div class="hgm-achbar"><div class="hgm-achfill" style="width:${pct}%"></div></div><div class="hgm-dim" style="font-size:10px;margin-top:3px">${esc(status)}</div></div>`
    }).join('')
    return { html: `<div class="hgm-sec">업적</div>${rows}` }
  }
  function minigamePane() {
    const s = smallSel[4]
    if (s === 0) return weaponSettingsPane()   // 무기 설정 인라인
    if (s === 2) return achievementsPane()     // 업적 인라인
    // s===1 배틀모드: 하위 탭(덱설정/배틀신청)
    const subtabs = `<div class="hgm-subtabs"><button class="hgm-stb ${battleSub === 0 ? 'on' : ''}" data-bs="0">🃏 덱 설정</button><button class="hgm-stb ${battleSub === 1 ? 'on' : ''}" data-bs="1">🤝 배틀 신청</button></div>`
    let inner = '', wireFn = null
    if (battleSub === 0) { const r = deckPane(); inner = r.html; wireFn = r.wire }
    else { const r = battleReqInner(); inner = r.html; wireFn = r.wire }
    return {
      html: subtabs + inner,
      wire(pop, rr) { pop.querySelectorAll('.hgm-stb').forEach((b) => b.onclick = () => { battleSub = +b.dataset.bs; rr() }); if (wireFn) wireFn(pop, rr) }
    }
  }

  // ── 꾸미기(캐릭터 외형) — 실시간 곰 미리보기 타일 그리드 ──────────────────────
  const APPEAR_LABELS = {
    skin: { default: '기본 갈색', cream: '크림', gray: '회색', brown: '브라운', black: '블랙', orange: '오렌지', pink: '핑크', mint: '민트', lavender: '라벤더' },
    body: { plain: '기본', cream: '크림 배', panda: '흰 배', heart: '하트', moon: '반달곰', star: '별무늬' },
    hat: { none: '없음', beanie: '비니', party: '파티', crown: '왕관', tophat: '실크햇', cap: '캡' },
    ear: { pointed: '뾰족', round: '둥근', folded: '접힌', antler: '사슴뿔', devil: '악마뿔', goblin: '도깨비뿔' },
    eye: { oval: '타원', round: '동그란', happy: '방긋', sparkle: '반짝', fire: '불타는', glow: '빛나는', cry: '우는', brow: '짙은눈썹' },
    mouth: { smile: '미소', cat: '입꼬리', oh: '오', wide: '헤벌쭉', devil: '악마입', mischief: '장난꾸러기' },
    hand: { round: '기본', pink: '젤리', brown: '갈색', claw: '발톱', paw: '곰손', fire: '불타는', aura: '아우라' },
    kb: { dark: '다크', white: '화이트', cream: '크림', teal: '게이밍', fire: '불타는', aura: '아우라', vine: '덩굴' },
    mouse: { white: '화이트', dark: '다크', pink: '핑크', blue: '블루', fire: '불타는', animal: '쥐모양', vine: '덩굴' },
    desk: { wood: '우드', oak: '원목', white: '화이트', graphite: '그래파이트', mint: '민트', oakgrain: '나이테', ember: '불타는', ice: '얼음' }
  }
  function albl(group, v) { const m = APPEAR_LABELS[group]; return (m && m[v]) || v }
  const CROP_FACE = [54, 12, 132, 146], CROP_DESK = [34, 118, 172, 98], CROP_BODY = [40, 24, 160, 192]
  const CROP_KB = [56, 156, 128, 48], CROP_MOUSE = [174, 164, 46, 50]   // 키보드/마우스 초점 크롭(작은 타일용)
  // Skins = 색상 + 몸 컨셉 통합 프리셋(각 항목이 색+몸을 한 번에 설정). animals.js AnimalArt.SKIN_PRESETS 공용(소유 판정 id).
  const SKIN_PRESETS = (window.AnimalArt && window.AnimalArt.SKIN_PRESETS) || []
  function skinPreset(id) { return SKIN_PRESETS.find((p) => p.id === id) || null }
  // 꾸미기 하위 카테고리(외형 소환 확률표 그룹핑용) — group → 표시명
  const APPEAR_CATS = [['skin', 'Skins'], ['hat', 'Hats'], ['ear', 'Ears'], ['eye', 'Eyes'], ['mouth', 'Mouth'], ['hand', 'Paw'], ['kb', '키보드'], ['mouse', '마우스'], ['desk', '책상']]
  function appearLabel(group, v) { return group === 'skin' ? ((skinPreset(v) || {}).name || v) : albl(group, v) }
  function appearOwned(group, v) { return B.appearOwned ? B.appearOwned(group, v) : true }
  function appearCnt(group, v) { return B.appearCount ? B.appearCount(group, v) : 0 }
  function appearBase() {
    const ap = (B.getAppearance ? B.getAppearance() : null) || {}
    return { tint: ap.skin || 'default', hat: ap.hat || 'none', shape: Object.assign({}, ap.shape), deskStyle: ap.deskStyle || 'wood', kbStyle: ap.kbStyle || 'dark', mouseStyle: ap.mouseStyle || 'white' }
  }
  const EFFECT_VALUES = { eye: ['fire', 'glow', 'cry'], hand: ['fire', 'aura'], kb: ['fire', 'aura'], mouse: ['fire'], desk: ['ember'] }   // 애니메이션 미리보기 대상. 정적은 제외
  function hasEffect(group, v) { return (EFFECT_VALUES[group] || []).indexOf(v) >= 0 }
  function skinAnimated(id) { const p = skinPreset(id); return !!(p && p.body === 'fire') }   // 불타는 몸 스킨은 미리보기 애니
  function drawThumbInto(ctx, state, crop, W, H, now) {
    const A = window.AnimalArt, rx = crop[0], ry = crop[1], rw = crop[2], rh = crop[3], s = Math.min(W / rw, H / rh)
    ctx.clearRect(0, 0, W, H)
    ctx.save(); ctx.translate((W - rw * s) / 2, (H - rh * s) / 2); ctx.scale(s, s); ctx.translate(-rx, -ry)
    try { A.draw(ctx, 'bear', state, now) } catch (e) {}
    ctx.restore()
  }
  function bearThumb(state, crop, W, H, animate) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    drawThumbInto(cv.getContext('2d'), state, crop, W, H, animate ? performance.now() : 0)
    if (animate) previewTiles.push({ cv, redraw: (ctx, now) => drawThumbInto(ctx, state, crop, W, H, now) })
    return cv
  }
  function stopPreviewAnim() { if (previewRAF) cancelAnimationFrame(previewRAF); previewRAF = 0; previewTiles = [] }
  function startPreviewAnim() {
    if (previewRAF || !previewTiles.length) return
    const loop = () => { const now = performance.now(); for (const t of previewTiles) t.redraw(t.cv.getContext('2d'), now); previewRAF = requestAnimationFrame(loop) }
    previewRAF = requestAnimationFrame(loop)
  }
  function handThumb(shape, tint, W, H, animate) {   // 손만 렌더(전체 캐릭터 아님)
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    // 불꽃/아우라는 패드 위로 크게 번져 → 반경 줄이고 중심을 내려서 칸 안에 들어오게(불타는 손 잘림 방지)
    const fire = shape === 'fire', aura = shape === 'aura'
    const r = Math.min(W, H) * (fire || aura ? 0.24 : 0.34)
    const cy = fire ? H * 0.66 : H / 2 + 2
    const draw = (ctx, now) => { ctx.clearRect(0, 0, W, H); try { window.AnimalArt.drawHand(ctx, shape, W / 2, cy, r, tint, now) } catch (e) {} }
    draw(cv.getContext('2d'), animate ? performance.now() : 0)
    if (animate) previewTiles.push({ cv, redraw: draw })
    return cv
  }
  // 외형 소환용 아이템 미리보기 — 카테고리(group)별로 알맞은 크롭/오버라이드로 곰(또는 손)을 그림
  function appearThumb(it, W, H, animate) {
    const base = appearBase(), g = it.group, v = it.value
    if (g === 'hand') return handThumb(v, base.tint, W, H, animate && hasEffect('hand', v))
    const st = { seed: 0, hp: 100, tint: base.tint, hat: base.hat, shape: Object.assign({}, base.shape), deskStyle: base.deskStyle, kbStyle: base.kbStyle, mouseStyle: base.mouseStyle }
    let crop = CROP_FACE, anim = hasEffect(g, v)
    if (g === 'skin') { const p = skinPreset(v); if (p) { st.tint = p.tint; st.shape.body = p.body; st.shape.tail = p.tail || 'stub' } crop = CROP_BODY; anim = skinAnimated(v) }
    else if (g === 'hat') { st.hat = v; crop = CROP_FACE }
    else if (g === 'ear' || g === 'eye' || g === 'mouth') { st.shape[g] = v; crop = CROP_FACE }
    else if (g === 'kb') { st.kbStyle = v; crop = CROP_KB }
    else if (g === 'mouse') { st.mouseStyle = v; crop = CROP_MOUSE }
    else if (g === 'desk') { st.deskStyle = v; crop = CROP_DESK }
    return bearThumb(st, crop, W, H, animate && anim)
  }
  function dressupPane() {
    const A = window.AnimalArt
    if (!A) return stubPane('꾸미기')
    const s = smallSel[0], base = appearBase(), tab = (NAV[0].tabs[s] || [])[1]
    const clone = () => ({ seed: 0, hp: 100, tint: base.tint, hat: base.hat, shape: Object.assign({}, base.shape), deskStyle: base.deskStyle, kbStyle: base.kbStyle, mouseStyle: base.mouseStyle })
    const shapeOv = (key, v) => { const st = clone(); st.shape[key] = v; return st }
    const styleOv = (key, v) => { const st = clone(); st[key] = v; return st }
    if (tab === 'Skins') {   // 색+몸 통합 프리셋(소유=프리셋 id 단위)
      const list = SKIN_PRESETS.slice().sort((a, b) => (appearOwned('skin', a.id) ? 0 : 1) - (appearOwned('skin', b.id) ? 0 : 1))
      const cells = list.map((p) => {
        const on = base.tint === p.tint && (base.shape.body || 'plain') === p.body, locked = !appearOwned('skin', p.id)
        const badge = locked ? '<div class="hgm-clk">🔒</div>' : (on ? '<div class="hgm-clk" style="color:#5f9e4a;font-weight:800">✓</div>' : '')
        return `<div class="hgm-cell ${locked ? 'lock' : ''} ${on ? 'sel' : ''}" data-id="${esc(p.id)}" data-tint="${esc(p.tint)}" data-body="${esc(p.body)}" title="${esc(p.name)}"><div class="hgm-prev" data-prev></div><div class="hgm-cname">${esc(p.name)}</div>${badge}${cntBadge(appearCnt('skin', p.id))}</div>`
      }).join('')
      const note = list.some((p) => !appearOwned('skin', p.id)) ? '<div class="hgm-note">🔒 잠긴 스킨은 <b>외형 소환</b>으로 획득해요.</div>' : ''
      return {
        html: `<div class="hgm-sec">Skins</div><div class="hgm-cgrid" style="grid-template-columns:repeat(4,1fr)">${cells}</div>${note}`,
        wire(pop, rr) {
          pop.querySelectorAll('.hgm-cell[data-id]').forEach((el) => {
            const id = el.dataset.id, tint = el.dataset.tint, body = el.dataset.body, holder = el.querySelector('[data-prev]')
            if (holder) { const st = clone(); st.tint = tint; st.shape.body = body; holder.appendChild(bearThumb(st, CROP_BODY, 46, 58, skinAnimated(id))) }
            if (appearOwned('skin', id)) el.onclick = () => { const p = skinPreset(id); if (B.setSkin) B.setSkin(tint); if (B.setShape) { B.setShape('body', body); B.setShape('tail', (p && p.tail) || 'stub') } rr() }
          })
        }
      }
    }
    let cfg
    if (tab === 'Hats') cfg = { group: 'hat', values: A.HATS.slice(), cur: base.hat, crop: CROP_FACE, cols: 4, tw: 46, th: 54, over: (v) => styleOv('hat', v), apply: (v) => B.setHat && B.setHat(v) }
    else if (tab === 'Ears') cfg = { group: 'ear', values: A.EAR_SHAPES.slice(), cur: base.shape.ear, crop: CROP_FACE, cols: 4, tw: 46, th: 52, over: (v) => shapeOv('ear', v), apply: (v) => B.setShape && B.setShape('ear', v) }
    else if (tab === 'Eyes') cfg = { group: 'eye', values: A.EYE_SHAPES.slice(), cur: base.shape.eye, crop: CROP_FACE, cols: 4, tw: 46, th: 52, over: (v) => shapeOv('eye', v), apply: (v) => B.setShape && B.setShape('eye', v) }
    else if (tab === 'Mouth') cfg = { group: 'mouth', values: A.MOUTH_SHAPES.slice(), cur: base.shape.mouth, crop: CROP_FACE, cols: 4, tw: 46, th: 52, over: (v) => shapeOv('mouth', v), apply: (v) => B.setShape && B.setShape('mouth', v) }
    else if (tab === 'Paw') cfg = { group: 'hand', values: A.HAND_SHAPES.slice(), cur: base.shape.hand, kind: 'hand', cols: 4, tw: 46, th: 46, apply: (v) => B.setShape && B.setShape('hand', v) }
    else if (tab === '키보드') cfg = { group: 'kb', values: A.KB_ORDER.slice(), cur: base.kbStyle, crop: CROP_KB, cols: 4, tw: 46, th: 44, over: (v) => styleOv('kbStyle', v), apply: (v) => B.setKbStyle && B.setKbStyle(v) }
    else if (tab === '마우스') cfg = { group: 'mouse', values: A.MOUSE_ORDER.slice(), cur: base.mouseStyle, crop: CROP_MOUSE, cols: 4, tw: 46, th: 44, over: (v) => styleOv('mouseStyle', v), apply: (v) => B.setMouseStyle && B.setMouseStyle(v) }
    else cfg = { group: 'desk', values: A.DESK_ORDER.slice(), cur: base.deskStyle, crop: CROP_DESK, cols: 4, tw: 46, th: 44, over: (v) => styleOv('deskStyle', v), apply: (v) => B.setDeskStyle && B.setDeskStyle(v) }

    const lock = (v) => !appearOwned(cfg.group, v)   // 기본 외형 외 전부 외형 소환으로 획득(개발자 예외)
    const vals = cfg.values.slice().sort((a, b) => (lock(a) ? 1 : 0) - (lock(b) ? 1 : 0))   // 보유 먼저(§5)
    const cells = vals.map((v) => {
      const locked = lock(v), on = v === cfg.cur
      const badge = locked ? '<div class="hgm-clk">🔒</div>' : (on ? '<div class="hgm-clk" style="color:#5f9e4a;font-weight:800">✓</div>' : '')
      return `<div class="hgm-cell ${locked ? 'lock' : ''} ${on ? 'sel' : ''}" data-val="${esc(v)}"><div class="hgm-prev" data-prev></div><div class="hgm-cname">${esc(albl(cfg.group, v))}</div>${badge}${cntBadge(appearCnt(cfg.group, v))}</div>`
    }).join('')
    const note = vals.some((v) => lock(v)) ? '<div class="hgm-note">🔒 잠긴 항목은 <b>외형 소환</b>으로 획득해요.</div>' : ''
    return {
      html: `<div class="hgm-sec">${esc(tab)}</div><div class="hgm-cgrid" style="grid-template-columns:repeat(${cfg.cols},1fr)">${cells}</div>${note}`,
      wire(pop, rr) {
        pop.querySelectorAll('.hgm-cell[data-val]').forEach((el) => {
          const v = el.dataset.val, holder = el.querySelector('[data-prev]')
          if (holder) holder.appendChild(cfg.kind === 'hand' ? handThumb(v, base.tint, cfg.tw, cfg.th, hasEffect('hand', v)) : bearThumb(cfg.over(v), cfg.crop, cfg.tw, cfg.th, hasEffect(cfg.group, v)))
          if (!lock(v)) el.onclick = () => { cfg.apply(v); rr() }
        })
      }
    }
  }

  // ── 소환(가챠) — 외형(모자)/무기·소환체, 2재화(Paw/Grizzle) + 뽑기 연출 ──────
  function gachaPane() {
    const sub = smallSel[1], kind = sub === 0 ? 'appear' : 'weapon'
    const coins = B.gachaCoins ? B.gachaCoins() : { paw: 0, grizzle: 0 }
    const bal = kind === 'appear' ? coins.paw : coins.grizzle, coinIco = kind === 'appear' ? COIN_PAW : COIN_GRIZZLE
    const pool = B.gachaPool ? B.gachaPool(kind) : []
    const base = appearBase()
    const capIco = (e) => kind === 'appear' ? `<span data-ag="${esc(e.group)}" data-av="${esc(e.value)}" data-hs="22"></span>` : catIcon(e.id, 22)
    // 대기화면 캡슐 — 소환 화면 새로 접근할 때마다 랜덤 8개(뽑기 애니 도중엔 캐시 유지)
    if (!gachaPick || gachaPick.kind !== kind) gachaPick = { kind, items: pool.slice().sort(() => Math.random() - 0.5).slice(0, 8) }
    const OFF = [[-96, -6], [-42, -58], [24, -62], [86, -18], [100, 46], [36, 66], [-32, 60], [-92, 52]]
    const caps = gachaPick.items.map((e, i) => {
      const p = OFF[i % OFF.length], color = kind === 'appear' ? '#ffc2d3' : (e.color || '#b9c2d0')
      return `<div class="hgm-cap" style="--dx:${p[0]}px;--dy:${p[1]}px" title="${esc(kind === 'appear' ? appearLabel(e.group, e.value) : (e.name || e.id))}"><div class="hgm-capin" style="--rc:${color};animation-delay:${(i * 0.26).toFixed(2)}s"><div class="hgm-caphi"></div><div class="hgm-capico">${capIco(e)}</div></div></div>`
    }).join('')
    const res = (!gachaRolling && gachaResult && gachaResult.kind === kind && gachaResult.items.length) ? gachaResult.items : null
    const rarMap = {}; if (kind === 'weapon' && B.gachaOdds) B.gachaOdds().forEach((r) => rarMap[r.key] = r)
    // 캡슐 중앙 수렴(rolling 클래스 transition) → 빛 폭발(burst) → 화면 화이트아웃 → 중앙 획득 연출
    function makeBurst() {   // 뽑기 시작 시 라이브 DOM에 주입(캡슐 재생성 없이 수렴 애니 유지)
      let dg = kind === 'appear' ? '#ffd6e6' : '#ffe89a'
      if (gachaPending && kind === 'weapon') { const order = ['legend', 'rare', 'uncommon', 'common']; const top = order.find((k) => gachaPending.items.some((r) => r.rarity === k)) || 'common'; dg = (rarMap[top] || {}).color || '#ffe89a' }
      const rays = Array.from({ length: 12 }, (_, i) => `<div class="hgm-bray" style="transform:rotate(${i * 30}deg);animation-delay:${(i * 0.045).toFixed(3)}s"></div>`).join('')
      return `<div class="hgm-burst"><div class="hgm-bglow" style="--dg:${dg}"></div><div class="hgm-bshock" style="--dg:${dg}"></div><div class="hgm-brays">${rays}</div><div class="hgm-bcap ${kind}"></div><div class="hgm-whiteout"></div></div>`
    }
    const burst = gachaRolling ? makeBurst() : ''
    let reveal = ''
    if (res) {
      const one = res.length === 1
      let gc = '#ffd0e6', ro = 0.32
      if (kind === 'weapon') {
        const order = ['legend', 'rare', 'uncommon', 'common']
        const top = order.find((k) => res.some((r) => r.rarity === k)) || 'common'
        gc = (rarMap[top] || {}).color || '#ffd86b'
        ro = top === 'legend' ? 0.7 : top === 'rare' ? 0.55 : top === 'uncommon' ? 0.42 : 0.28
      }
      const items = res.map((r, i) => {
        const rc = r.appear ? '#e6d3c4' : (r.color || '#e6d3c4'), nm = r.appear ? appearLabel(r.group, r.value) : (r.name || r.id)
        const hs = one ? 60 : 30
        const ico = r.appear ? `<span data-ag="${esc(r.group)}" data-av="${esc(r.value)}" data-hs="${hs}"></span>` : catIcon(r.id, one ? 48 : 26)
        let tag = ''
        if (one) tag = r.appear
          ? `<div class="hgm-rbadge" style="background:${r.dup ? '#b088a0' : '#5f9e4a'}">${r.dup ? '중복' : 'NEW'}</div>`
          : `<div class="hgm-rbadge" style="background:${(rarMap[r.rarity] || {}).color || '#c9a074'}">${esc((rarMap[r.rarity] || {}).name || '')}</div>`
        const rnColor = r.appear ? (r.dup ? '#a98d7c' : '#5f9e4a') : '#5b4238'
        return `<div class="hgm-ritem ${one ? 'one' : 'many'}" style="--rc:${rc};animation-delay:${(i * 0.045).toFixed(2)}s" title="${esc(nm)}">${ico}<div class="rn" style="color:${rnColor}">${esc(nm)}</div>${tag}</div>`
      }).join('')
      const rsparks = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, d = 58 + Math.random() * 34; return `<div class="hgm-rspark" style="--tx:${(Math.cos(a) * d).toFixed(0)}px;--ty:${(Math.sin(a) * d).toFixed(0)}px;animation-delay:${(0.1 + Math.random() * 0.14).toFixed(2)}s"></div>` }).join('')
      reveal = `<div class="hgm-reveal" style="--gc:${gc};--ro:${ro}"><div class="hgm-rays"></div><div class="hgm-rring"></div><div class="hgm-halo"></div><div class="hgm-items">${items}</div>${rsparks}<div class="hgm-flash"></div><div class="hgm-rhint">화면을 눌러 계속</div></div>`
    }
    const acc = kind === 'appear' ? ['🎀', '💗'] : ['⚔️', '🛡️']
    const sparks = [[16, 20], [84, 16], [14, 64], [86, 62], [50, 8], [30, 78]].map((s, i) => `<div class="hgm-cspark" style="left:${s[0]}%;top:${s[1]}%;animation-delay:${(i * 0.4).toFixed(1)}s"></div>`).join('')
    const accHtml = `<div class="hgm-cacc" style="left:8%;top:32%">${acc[0]}</div><div class="hgm-cacc" style="right:8%;top:46%">${acc[1]}</div>`
    const field = `<div class="hgm-capfield${res ? ' dim' : ''}"><div class="hgm-cglow"></div><div class="hgm-cped"></div>${sparks}${accHtml}${caps}</div>`
    const stage = `<div class="hgm-gstage ${kind}${gachaRolling ? ' rolling' : ''}">${field}${burst}${reveal}</div>`
    const dis = gachaRolling ? 'disabled' : ''
    return {
      html: `<div class="hgm-gwrap"><div class="hgm-gtop">` +
        `<span class="hgm-glabel ${kind === 'weapon' ? 'weapon' : ''}">${kind === 'appear' ? '🎀 외형 소환' : '⚔️ 무기·소환체'}</span>` +
        `<span class="hgm-wallet" title="보유 재화 (🐾 외형용 · 🔴 무기·소환체용)"><span class="hgm-wlab">보유</span><span class="hgm-wchip">${COIN_PAW} ${coins.paw}</span><span class="hgm-wchip">${COIN_GRIZZLE} ${coins.grizzle}</span></span>` +
        `</div>${stage}` +
        `<div class="hgm-gbtns"><button class="hgm-gbtn" data-roll="1" ${bal >= 1 && !dis ? '' : 'disabled'}><span class="hgm-gcost">${coinIco} 1</span> 1회</button>` +
        `<button class="hgm-gbtn" data-roll="10" ${bal >= 10 && !dis ? '' : 'disabled'}><span class="hgm-gcost">${coinIco} 10</span> 10회</button></div></div>`,
      wire(pop, rr) {
        pop.querySelectorAll('[data-ag]').forEach((h) => { const s = +(h.dataset.hs || 30); h.appendChild(appearThumb({ group: h.dataset.ag, value: h.dataset.av }, s, s, res)) })
        const rev = pop.querySelector('.hgm-reveal')   // 획득 화면 클릭 → 대기 화면으로 복귀
        if (rev) rev.addEventListener('click', () => { gachaResult = null; rr() })
        pop.querySelectorAll('[data-roll]').forEach((b) => b.onclick = () => {
          if (gachaRolling) return
          const items = B.rollGacha ? B.rollGacha(kind, +b.dataset.roll) : []
          if (!items.length) return
          gachaPending = { kind, items }; gachaRolling = true; gachaResult = null
          const stageEl = pop.querySelector('.hgm-gstage')
          if (stageEl) {   // 1) 재렌더 없이: rolling 클래스로 기존 캡슐을 중앙 수렴(transition) + 빛 폭발 오버레이 주입
            stageEl.classList.add('rolling'); stageEl.insertAdjacentHTML('beforeend', makeBurst())
            pop.querySelectorAll('.hgm-gbtn').forEach((x) => { x.disabled = true })
          } else rr()
          setTimeout(() => { gachaRolling = false; gachaResult = gachaPending; gachaPending = null; if (isOpen() && big === 1) rr() }, 1180)   // 2) 화이트아웃 → 획득 연출
        })
      }
    }
  }
  // 확률 팝업(별도 모달) — 무기: 등급 % + 그 아래 개별 아이템 % / 외형: 개별 %(동일)
  function oddsData(kind) {
    const pool = B.gachaPool ? B.gachaPool(kind) : []
    if (kind === 'appear') {
      const n = pool.length, per = n ? 100 / n : 0   // 외형은 희귀도 없이 전 아이템 균등
      const by = {}; pool.forEach((e) => { (by[e.group] = by[e.group] || []).push(e) })
      const cats = APPEAR_CATS.filter((c) => (by[c[0]] || []).length).map((c) => ({ name: c[1], items: by[c[0]].map((e) => ({ name: appearLabel(e.group, e.value), pct: per })) }))
      return { rarity: false, appearCats: cats }
    }
    const cats = (B.gachaOdds ? B.gachaOdds() : []).slice().reverse()   // 높은 등급(전설)을 위로
    const by = {}; pool.forEach((e) => { (by[e.rarity] = by[e.rarity] || []).push(e) })
    const groups = cats.map((c) => {
      const list = by[c.key] || [], per = list.length ? c.pct / list.length : 0
      return { cat: c, items: list.map((e) => ({ name: e.name || e.id, pct: per })) }
    })
    return { rarity: true, groups }
  }
  function closeOddsModal() { const m = document.querySelector('.hgm-omodal'); if (m) { m.remove(); return true } return false }
  function openOddsModal(kind) {
    closeOddsModal()
    const d = oddsData(kind)
    let body
    if (!d.rarity) {
      body = `<div class="hgm-onote">외형은 희귀도 없이 <b>동일 확률</b>. 카테고리별로 묶어 보여줘요.</div>` +
        (d.appearCats || []).map((g) => `<div class="hgm-ocat" style="color:#8a6d4b"><span>${esc(g.name)}</span><span></span></div>` +
          g.items.map((it) => `<div class="hgm-oitem"><span>${esc(it.name)}</span><span>${it.pct.toFixed(2)}%</span></div>`).join('')).join('')
    } else {
      body = `<div class="hgm-onote">등급을 먼저 뽑고, 그 등급 안에서 아이템이 균등 확률로 나와요.</div>` +
        d.groups.map((g) => `<div class="hgm-ocat" style="color:${g.cat.color}"><span>${esc(g.cat.name)}</span><span>${g.cat.pct}%</span></div>` +
          g.items.map((it) => `<div class="hgm-oitem"><span>${esc(it.name)}</span><span>${it.pct.toFixed(2)}%</span></div>`).join('')).join('')
    }
    const m = document.createElement('div'); m.className = 'no-drag hgm-omodal'
    m.innerHTML = `<div class="hgm-ocard"><div class="hgm-ohd"><span>📊 획득 확률</span><button class="hgm-oclose">✕</button></div><div class="hgm-obody">${body}</div></div>`
    m.addEventListener('mousedown', (e) => { if (e.target === m) m.remove() })
    m.querySelector('.hgm-oclose').onclick = () => m.remove()
    document.body.appendChild(m)
  }

  // ── 조합(소환 3번째 탭): 꾸미기 5개→랜덤 꾸미기 / 무기 동일희귀도 5개→상위희귀도 ──
  function craftPane() {
    const kind = craftMode === 0 ? 'appear' : 'weapon'
    const mats = (B.craftMats ? B.craftMats(kind) : []).slice()
    const keyOf = (m) => kind === 'appear' ? (m.group + '|' + m.value) : m.id
    const labelOf = (m) => kind === 'appear' ? appearLabel(m.group, m.value) : (m.name || m.id)
    const byKey = {}; mats.forEach((m) => byKey[keyOf(m)] = m)
    const used = {}; craftSel.forEach((k) => used[k] = (used[k] || 0) + 1)
    let lockRar = null
    if (kind === 'weapon' && craftSel.length) { const f = byKey[craftSel[0]]; lockRar = f ? f.rarity : null }
    const icoHtml = (m, sz) => kind === 'appear' ? `<span data-ag="${esc(m.group)}" data-av="${esc(m.value)}" data-hs="${sz}"></span>` : catIcon(m.id, sz)
    const toggle = `<div class="hgm-subtabs"><button class="hgm-stb ${craftMode === 0 ? 'on' : ''}" data-cm="0">🎀 꾸미기</button><button class="hgm-stb ${craftMode === 1 ? 'on' : ''}" data-cm="1">⚔️ 무기·소환체</button></div>`
    const note = (kind === 'appear' ? '꾸미기 아무거나 5개 → 랜덤 꾸미기 1개 (희귀도 없음)' : ('같은 희귀도 5개 → 상위 희귀도 1개' + (lockRar ? ` · <b style="color:${rarInfo(lockRar).color}">${esc(rarInfo(lockRar).name)}</b> 고정` : ''))) + '<br><span style="color:#a98d7c">2개 이상 보유한 것만 재료 사용 · 마지막 1개는 보존</span>'
    const slots = Array.from({ length: 5 }, (_, i) => craftSel[i] || null).map((k, i) => {
      if (!k) return `<div class="hgm-cslot" data-cslot="${i}">+</div>`
      const m = byKey[k] || {}
      return `<div class="hgm-cslot filled" data-cslot="${i}" title="${esc(labelOf(m))}">${icoHtml(m, 30)}</div>`
    }).join('<span class="hgm-cplus">+</span>')
    const R = craftResult
    const resCenter = R ? (R.kind === 'appear' ? `<span data-ag="${esc(R.group)}" data-av="${esc(R.value)}" data-hs="46"></span>` : catIcon(R.id, 40)) : '?'
    let resBox = ''
    if (R) { const rn = R.kind === 'appear' ? appearLabel(R.group, R.value) : (R.name || R.id); resBox = `<div class="hgm-cresbox">${R.kind === 'appear' ? `<span data-ag="${esc(R.group)}" data-av="${esc(R.value)}" data-hs="46"></span>` : catIcon(R.id, 44)}<div class="rn">${esc(rn)}</div><div class="hgm-rbadge" style="background:${R.dup ? '#b088a0' : '#5f9e4a'}">${R.dup ? '중복 +1' : '✨ NEW'}</div></div>` }
    const usable = mats.filter((m) => m.count > 1)   // 1개 초과(중복)만 재료로 노출
    const pick = usable.map((m) => {
      const k = keyOf(m), avail = (m.count - 1) - (used[k] || 0)   // 마지막 1개는 항상 보존
      const dis = avail <= 0 || (kind === 'weapon' && lockRar && m.rarity !== lockRar)
      const bc = kind === 'weapon' ? (m.color || '#e7cdb6') : '#e7cdb6'
      return `<div class="hgm-cell ${dis ? 'lock' : ''}" data-mat="${esc(k)}" title="${esc(labelOf(m))} (보유 ${m.count} · 사용가능 ${Math.max(0, avail)})" style="border-color:${bc}"><div class="hgm-cico">${icoHtml(m, 30)}</div><div class="hgm-cname">${esc(labelOf(m))}</div>${cntBadge(m.count)}</div>`
    }).join('')
    const canCraft = craftSel.length === 5
    return {
      html: toggle + `<div class="hgm-cnote">${note}</div>` +
        `<div class="hgm-crow">${slots}<span class="hgm-carrow">→</span><div class="hgm-cres">${resCenter}</div></div>` +
        `<div class="hgm-cbtns"><button class="hgm-gbtn" data-craft ${canCraft ? '' : 'disabled'}>조합하기 ${craftSel.length}/5</button>${craftSel.length ? '<button class="hgm-cclear" data-cclear>비우기</button>' : ''}</div>` +
        resBox +
        `<div class="hgm-sec">재료 (2개 이상 보유) ${usable.length ? '' : '— 없음(소환으로 중복을 모아보세요)'}</div><div class="hgm-cgrid">${pick}</div>`,
      wire(pop, rr) {
        pop.querySelectorAll('[data-ag]').forEach((h) => { const sz = +(h.dataset.hs || 30); h.appendChild(appearThumb({ group: h.dataset.ag, value: h.dataset.av }, sz, sz, false)) })
        pop.querySelectorAll('[data-cm]').forEach((b) => b.onclick = () => { craftMode = +b.dataset.cm; craftSel = []; craftResult = null; rr() })
        pop.querySelectorAll('[data-mat]').forEach((el) => el.onclick = () => { if (el.classList.contains('lock')) return; if (craftSel.length < 5) { craftResult = null; craftSel.push(el.dataset.mat); rr() } })
        pop.querySelectorAll('[data-cslot]').forEach((el) => el.onclick = () => { const i = +el.dataset.cslot; if (craftSel[i] != null) { craftSel.splice(i, 1); rr() } })
        const cc = pop.querySelector('[data-cclear]'); if (cc) cc.onclick = () => { craftSel = []; rr() }
        const cb = pop.querySelector('[data-craft]'); if (cb) cb.onclick = () => {
          if (craftSel.length !== 5) return
          let res
          if (kind === 'appear') res = B.craftAppear ? B.craftAppear(craftSel.map((k) => { const p = k.split('|'); return { group: p[0], value: p[1] } })) : { ok: false }
          else res = B.craftWeapon ? B.craftWeapon(craftSel.slice()) : { ok: false }
          if (res && res.ok) { craftResult = kind === 'appear' ? { kind, group: res.group, value: res.value, dup: res.dup } : { kind, id: res.id, name: (res.entry && res.entry.name) || res.id, dup: res.dup }; craftSel = [] }
          rr()
        }
      }
    }
  }

  function paneContent() {
    const cat = NAV[big], s = smallSel[big], sub = cat.tabs.length ? cat.tabs[s][1] : ''
    if (big === 0) return dressupPane()
    if (big === 1) return smallSel[1] === 2 ? craftPane() : gachaPane()
    if (big === 2 && s === 0) return dediPane()
    if (big === 2 && s === 1) return lobbyPane()
    if (big === 3) return collectionPane()
    if (big === 4) return minigamePane()
    if (big === 5) return conveniencePane()
    if (big === 6 && s === 0) return optionsPane()
    if (big === 6 && s === 1) return keysPane()
    if (big === 7) return devPane()
    return stubPane(cat.name, sub)
  }

  // ── 셸 렌더 ────────────────────────────────────────────────────────────────
  function render(pop) {
    stopPreviewAnim()   // 이전 미리보기 애니 정리(innerHTML 교체로 캔버스 사라짐)
    const cat = NAV[big]
    const devOn = !!(B.isDev && B.isDev())
    const rail = NAV.map((c, i) => (c.dev && !devOn) ? '' : `<button class="hgm-rbtn ${i === big ? 'on' : ''}" data-tip="${c.name}" data-big="${i}">${c.ic}</button>`).join('')
    const tabs = cat.tabs.map((t, i) => `<button class="hgm-tb ${i === smallSel[big] ? 'on' : ''}" data-tip="${t[1]}" data-small="${i}">${t[0]}</button>`).join('')
    const right = (cat.pct && !(big === 1 && smallSel[1] === 2) ? '<button class="hgm-pct" data-tip="확률">%</button>' : '') + '<button class="hgm-x" data-tip="닫기">✕</button>'
    const content = paneContent()
    pop.innerHTML =
      `<div class="hgm-rail">${rail}</div><div class="hgm-body"><div class="hgm-hd"><div class="hgm-tabs">${tabs}</div>${right}</div><div class="hgm-ct">${content.html}</div></div>`
    const rr = () => render(pop)
    pop.querySelectorAll('.hgm-rbtn').forEach((b) => b.onclick = () => { big = +b.dataset.big; gachaResult = null; gachaRolling = false; gachaPending = null; gachaPick = null; gachaOdds = false; craftSel = []; craftResult = null; render(pop) })
    pop.querySelectorAll('.hgm-tb').forEach((b) => b.onclick = () => { smallSel[big] = +b.dataset.small; gachaResult = null; gachaRolling = false; gachaPending = null; gachaPick = null; craftSel = []; craftResult = null; render(pop) })
    pop.querySelector('.hgm-x').onclick = close
    const pctBtn = pop.querySelector('.hgm-pct'); if (pctBtn) pctBtn.onclick = () => openOddsModal(smallSel[1] === 0 ? 'appear' : 'weapon')
    if (content.wire) content.wire(pop, rr)
    startPreviewAnim()   // 이펙트 미리보기 타일 애니메이션 시작(있을 때만)
  }

  // 팝업은 고정 크기(내부 스크롤). 캐릭터 위에 붙이되 화면 밖으로 나가면 클램프.
  const POP_W = 364, POP_H = 540
  function position(pop, a) {
    const vw = window.innerWidth, vh = window.innerHeight
    const H = Math.min(POP_H, vh - 20)
    let left, top
    if (a && a.w != null) {
      left = Math.max(8, Math.min(a.x + a.w / 2 - POP_W / 2, vw - POP_W - 8))
      top = a.y - 8 - H                 // 캐릭터 위(위젯 top 바로 위)
      if (top < 8) top = 8              // 화면 위로 넘치면 클램프
    } else { left = Math.max(8, (vw - POP_W) / 2); top = Math.max(8, vh - 90 - H) }
    pop.style.left = left + 'px'; pop.style.top = top + 'px'; pop.style.bottom = 'auto'
  }

  function open(anchor) {
    if (root) { close(); return }
    // big/smallSel는 세션 동안 유지 → 마지막으로 보던 카테고리로 다시 열림. 앱 재시작 시 모듈 재로드로 자동 0(디폴트).
    lastAnchor = anchor || null
    gachaRolling = false; gachaPick = null   // 이전 뽑기 연출 재개 방지 + 캡슐 랜덤 새로
    root = document.createElement('div'); root.className = 'no-drag hgmenu-back'
    curPop = document.createElement('div'); curPop.className = 'hgm-pop'
    root.appendChild(curPop)
    // 바깥 클릭 닫기 + 캐릭터 드래그 추종은 app.js(캐릭터 위치를 아는 쪽)가 처리한다.
    // 백드롭은 pointer-events:none → 캔버스(캐릭터) 클릭/드래그를 막지 않음.
    document.body.appendChild(root)
    render(curPop); position(curPop, anchor)
    onKey.active = true; hostSync()
    // 깜빡임 방지: 메뉴 열림만으론 오버레이를 focusable로 만들지 않음(일반 클릭/바깥클릭 시 창 활성화→재blend 깜빡임 없앰).
    //   텍스트 입력칸이 "실제로 포커스"될 때만 focusable 켜서 타이핑 가능하게 한다. (단축키 캡처는 keysPane에서 별도 토글.)
    const isField = (el) => !!(el && ((el.tagName === 'INPUT' && el.type !== 'range') || el.tagName === 'TEXTAREA' || el.isContentEditable))
    root.addEventListener('focusin', (e) => { if (isField(e.target) && B.setFocusable) B.setFocusable(true) })
    root.addEventListener('focusout', () => setTimeout(() => { if (root && !isField(document.activeElement) && B.setFocusable) B.setFocusable(false) }, 0))
  }
  function close() { closeOddsModal(); stopPreviewAnim(); if (!root) return; root.remove(); root = null; curPop = null; onKey.active = false; if (B.setFocusable) B.setFocusable(false); hostSync() }   // 메뉴 닫힘: focusable 확실히 해제
  function refresh() { if (root && curPop) render(curPop) }   // 로스터 등 변화 시 앱이 호출
  function reposition(a) { if (root && curPop) { if (a) lastAnchor = a; position(curPop, lastAnchor) } }   // 캐릭터 드래그 시 앱이 매 틱 호출

  function onKey(e) { if (onKey.active && e.key === 'Escape') { e.preventDefault(); if (closeOddsModal()) return; close() } }   // Esc: 확률 팝업 먼저 닫기
  onKey.active = false
  window.addEventListener('keydown', onKey)

  function coinIcon(k) { return (k === 'grizzle' || k === 'grz' || k === 'gem') ? COIN_GRIZZLE : COIN_PAW }   // 실제 게임 코인 아이콘(금색 파우 / 빨강 그리즐) 공유
  window.HGMenu = { open, close, isOpen, refresh, reposition, setBridges, coinIcon }
})()
