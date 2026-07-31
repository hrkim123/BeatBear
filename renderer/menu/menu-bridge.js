// 메뉴 전용 창의 브리지 — menu-ui.js가 기대하는 B.* API를 그대로 제공하되,
//  · 조회(get*)는 오버레이가 밀어준 "스냅샷"을 동기 반환   (상태는 오버레이가 단독 소유 → 이중화 없음)
//  · 동작(set*/toggle*)은 오버레이로 IPC 전달(반환값 없음)
//  · 반환값이 필요한 3가지(rollGacha·craftWeapon·craftAppear)만 Promise
;(() => {
  const M = window.beatbearMenu
  let S = {}                      // 최신 스냅샷
  const A = (fn) => (...args) => M.action(fn, args)          // fire-and-forget
  const I = (fn) => (...args) => M.invoke(fn, args)          // 반환값 필요(Promise)

  const B = {
    // ── 조회: 스냅샷에서 동기 반환 ──
    isDev: () => !!S.isDev,
    isConnected: () => !!S.connected,
    getServer: () => S.server || 'ws://localhost:8787',
    getRoster: () => S.roster || [],
    isHost: () => !!S.isHost,
    isPeerLocked: (pid) => !!(S.peerLocked || {})[pid],
    roomInfo: () => S.roomInfo || null,
    getAppearance: () => S.appearance || {},
    appearOwned: (g, v) => !!((S.appearOwned || {})[g] || {})[v],
    appearCount: (g, v) => ((S.appearCount || {})[g] || {})[v] || 0,
    getAchievements: () => S.achievements || [],
    gachaCoins: () => S.gachaCoins || {},
    gachaPool: (kind) => (S.gachaPool || {})[kind] || [],
    gachaOdds: (kind) => (S.gachaOdds || {})[kind] || [],
    weaponSlots: () => S.weaponSlots || [],
    slotUsable: (id) => !!(S.slotUsable || {})[id],
    slotEligible: (id) => !!(S.slotEligible || {})[id],
    craftMats: (kind) => (S.craftMats || {})[kind] || [],
    getKeybinds: () => S.keybinds || { mod: '', keys: [] },
    getFps: () => S.fps,
    getPeersDim: () => !!S.peersDim,
    getDesktopMode: () => !!S.desktopMode,
    getDevCoinMode: () => S.devCoinMode || null,
    getDevBeam: () => !!S.devBeam,
    getDeck: () => S.deck || { unitsA: [], unitsB: [], weapons: [] },
    getDeckLimits: () => S.deckLimits || { units: 0, weapons: 0 },
    getOwnedUnits: () => S.ownedUnits || {},
    getLevels: () => S.levels || {},

    // ── 동작: 오버레이로 전달 ──
    setSkin: A('setSkin'), setHat: A('setHat'), setShape: A('setShape'),
    setMouseStyle: A('setMouseStyle'), setKbStyle: A('setKbStyle'), setDeskStyle: A('setDeskStyle'),
    setFps: A('setFps'), setKeybinds: A('setKeybinds'), setWeaponSlot: A('setWeaponSlot'),
    setDevCoinMode: A('setDevCoinMode'), setDevBeam: A('setDevBeam'),
    togglePeersDim: A('togglePeersDim'), togglePeerLock: A('togglePeerLock'), toggleDesktopMode: A('toggleDesktopMode'),
    switchView: A('switchView'), restoreBar: A('restoreBar'), clearSummons: A('clearSummons'),
    checkUpdate: A('checkUpdate'), challenge: A('challenge'), kickUser: A('kickUser'), quit: A('quit'),
    connect: A('connect'), disconnect: A('disconnect'), setDeck: A('setDeck'), upgradeUnit: A('upgradeUnit'),

    // ── 반환값 필요 ──
    rollGacha: I('rollGacha'), craftWeapon: I('craftWeapon'), craftAppear: I('craftAppear'),

    // ── 별도 창에선 불필요(오버레이 z-order·클릭영역 조작 없음) ──
    setFocusable: () => {}, setShapeRect: () => {}
  }

  // menu-ui.js의 컬렉션·무기설정·덱 탭은 window.BattleGacha를 직접 부른다.
  // 메뉴 창에는 gacha.js(상태 저장소)를 로드하지 않고, 스냅샷 기반 읽기 전용 facade로 대체한다
  // → 같은 상태가 두 프로세스에 존재하는 "이중화"가 원천적으로 생기지 않는다. 변경은 전부 오버레이가 수행.
  window.BattleGacha = {
    catalog: () => S.catalog || [],
    getDeck: () => S.deck || { unitsA: [], unitsB: [], weapons: [] },
    deckLimits: () => S.deckLimits || { units: 0, weapons: 0 },
    inDeck: (id) => !!(S.inDeck || {})[id],
    isOwned: (id) => !!(S.ownedUnits || {})[id],
    toggleDeck: (...a) => M.action('toggleDeck', a),
    getGems: () => (S.gachaCoins || {}).grizzle || 0
  }

  M.onInit((d) => {
    S = (d && d.snap) || {}
    if (window.HGMenu) { window.HGMenu.setBridges(B); if (!window.HGMenu.isOpen()) window.HGMenu.open(null) }
  })
  M.onSnap((snap) => {
    S = snap || S
    if (window.HGMenu && window.HGMenu.isOpen()) window.HGMenu.refresh()
  })
  M.onClose(() => { if (window.HGMenu && window.HGMenu.isOpen()) window.HGMenu.close() })

  window.HGMENU_ON_CLOSE = () => M.close()   // 메뉴가 스스로 닫히면(Esc·닫기버튼) 창도 숨김
})()
