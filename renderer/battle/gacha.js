// renderer/battle/gacha.js — 배틀 모드 가챠 로직 + 영속(localStorage)
// 순수 로직만(UI 없음). window.BattleData(units.js)에 의존.
//  - 재화: 💎 젬(뽑기), 🔩 강화 부품(중복 시 지급)
//  - 뽑기: 1회, 희귀도 가중치로 tier 선택 후 tier 내 균등
//  - 중복: 강화 부품 +UPGRADE.perDuplicate
//  - 카운트 치환: countPerGem(=10,000) 당 젬 1 (카운트 차감은 통합 레이어가 담당)
(function () {
  'use strict'
  if (!window.BattleData) { console.error('[battle/gacha] BattleData(units.js) 먼저 로드 필요'); return }
  const D = window.BattleData
  const K = { gems: 'hgbattle.gems', mat: 'hgbattle.mat', owned: 'hgbattle.owned', lvl: 'hgbattle.lvl', deck: 'hgbattle.deck', cnt: 'hgbattle.counts' }
  const DECK_SET_SIZE = 5, DECK_SETS = 2, DECK_UNITS = DECK_SET_SIZE * DECK_SETS, DECK_WEAPONS = 3   // 소환체 세트 2개(각 5칸)=최대 10. 무기 3(단축키 3개와 일치). 배틀 HUD는 한 세트씩 노출하고 스왑으로 세트 통째 교체
  const DECK_MIN_UNITS = 3, DECK_MIN_WEAPONS = 1   // 배틀 참여 최소 조건(A+B 합)

  function loadNum(k) { const n = parseInt(localStorage.getItem(k) || '0', 10); return Number.isFinite(n) ? n : 0 }
  function loadObj(k) { try { const o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }

  let gems = loadNum(K.gems)
  let materials = loadNum(K.mat)
  let owned = loadObj(K.owned)   // { id: true }
  let levels = loadObj(K.lvl)    // { id: n }  (업그레이드 레벨. 보유 시 기본 1)
  let counts = loadObj(K.cnt)    // { id: n }  (보유 개수 — 중복은 강화부품 대신 스택. 조합 재료로 사용)
  let deck = loadDeck()          // { units:[ids], weapons:[ids] }

  function loadDeck() {
    try {
      const d = JSON.parse(localStorage.getItem(K.deck) || 'null')
      if (d && Array.isArray(d.weapons)) {
        if (Array.isArray(d.unitsA) || Array.isArray(d.unitsB)) return { unitsA: (d.unitsA || []).slice(0, DECK_SET_SIZE), unitsB: (d.unitsB || []).slice(0, DECK_SET_SIZE), weapons: d.weapons.slice(0, DECK_WEAPONS) }   // 신 포맷(세트 2개)
        if (Array.isArray(d.units)) return { unitsA: d.units.slice(0, DECK_SET_SIZE), unitsB: d.units.slice(DECK_SET_SIZE, DECK_UNITS), weapons: d.weapons.slice(0, DECK_WEAPONS) }   // 구 포맷(단일 리스트) → 앞 5=A세트·다음 5=B세트로 이관
      }
    } catch {}
    return { unitsA: [], unitsB: [], weapons: [] }
  }

  // 기본지급(starter)은 처음부터 보유로 seed
  ;[...D.unitList(), ...D.weaponList()].forEach((e) => {
    if (e.starter && !owned[e.id]) { owned[e.id] = true; if (!levels[e.id]) levels[e.id] = 1 }
  })
  // 디폴트 덱: 모든 유저 기본 지급(보유 처리) — 일반 개미 4종 + 쉴더(고급) + 미사일. 덱이 비어있으면 자동 편성.
  const DEFAULT_UNITS = ['ant', 'rifleman', 'grenadier', 'scout', 'shielder']
  const DEFAULT_WEAPONS = ['missile']
  ;[...DEFAULT_UNITS, ...DEFAULT_WEAPONS].forEach((id) => { if (!owned[id]) owned[id] = true; if (!levels[id]) levels[id] = 1 })
  if (!deck.unitsA.length && !deck.unitsB.length && !deck.weapons.length) { deck = { unitsA: DEFAULT_UNITS.slice(0, DECK_SET_SIZE), unitsB: [], weapons: DEFAULT_WEAPONS.slice() }; localStorage.setItem(K.deck, JSON.stringify(deck)) }
  // 보유 아이템은 최소 1개 count로 시드(구 저장분 마이그레이션)
  Object.keys(owned).forEach((id) => { if (owned[id] && !(counts[id] > 0)) counts[id] = 1 })
  saveOwned(); saveCounts()

  function saveGems() { localStorage.setItem(K.gems, String(gems)) }
  function saveMat() { localStorage.setItem(K.mat, String(materials)) }
  function saveOwned() { localStorage.setItem(K.owned, JSON.stringify(owned)); localStorage.setItem(K.lvl, JSON.stringify(levels)) }
  function saveCounts() { localStorage.setItem(K.cnt, JSON.stringify(counts)) }
  function getCount(id) { return counts[id] || 0 }

  function getGems() { return gems }
  function getMaterials() { return materials }
  function isOwned(id) { return !!owned[id] }
  function getLevel(id) { return levels[id] || 0 }

  function addGems(n) { gems = Math.max(0, gems + (n | 0)); saveGems(); return gems }
  function addMaterials(n) { materials = Math.max(0, materials + (n | 0)); saveMat(); return materials }
  function spendMaterials(n) { n = n | 0; if (materials < n) return false; materials -= n; saveMat(); return true }
  function setGems(n) { gems = Math.max(0, n | 0); saveGems(); return gems }         // 개발자용
  function setMaterials(n) { materials = Math.max(0, n | 0); saveMat(); return materials } // 개발자용
  function setLevel(id, n) { if (!owned[id]) return false; levels[id] = Math.max(1, n | 0); saveOwned(); return true }

  // ── 덱 (배틀용): 소환체 5 + 무기 2 ──
  function saveDeck() { localStorage.setItem(K.deck, JSON.stringify(deck)) }
  // units = A.concat(B) 평탄 리스트(구 소비자 호환용, 읽기 전용 복사본). 세트가 필요하면 unitsA/unitsB 사용.
  function getDeck() { return { unitsA: deck.unitsA.slice(), unitsB: deck.unitsB.slice(), units: deck.unitsA.concat(deck.unitsB), weapons: deck.weapons.slice() } }
  function deckLimits() { return { units: DECK_UNITS, setSize: DECK_SET_SIZE, sets: DECK_SETS, weapons: DECK_WEAPONS, minUnits: DECK_MIN_UNITS, minWeapons: DECK_MIN_WEAPONS } }
  function deckReady() { return (deck.unitsA.length + deck.unitsB.length) >= DECK_MIN_UNITS && deck.weapons.length >= DECK_MIN_WEAPONS }
  function inDeck(id) { return deck.unitsA.includes(id) || deck.unitsB.includes(id) || deck.weapons.includes(id) }
  // 유닛은 세트(A/B) 단위로 편성. 이미 덱(어느 세트/무기든)에 있으면 제거, 없으면 지정 세트(기본 A)에 추가. 중복 유닛은 불가(72차 보류 규칙 유지).
  function toggleDeck(id, set) {
    const isUnit = !!D.UNITS[id], isWeapon = !!D.WEAPONS[id]
    if (!(isUnit || isWeapon) || !owned[id]) return { ok: false, reason: 'not-owned' }
    if (isWeapon) {
      const arr = deck.weapons, i = arr.indexOf(id)
      if (i >= 0) { arr.splice(i, 1); saveDeck(); return { ok: true, on: false } }
      if (arr.length >= DECK_WEAPONS) return { ok: false, reason: 'full' }
      arr.push(id); saveDeck(); return { ok: true, on: true }
    }
    const inA = deck.unitsA.indexOf(id), inB = deck.unitsB.indexOf(id)
    if (inA >= 0) { deck.unitsA.splice(inA, 1); saveDeck(); return { ok: true, on: false } }
    if (inB >= 0) { deck.unitsB.splice(inB, 1); saveDeck(); return { ok: true, on: false } }
    const target = set === 'B' ? deck.unitsB : deck.unitsA
    if (target.length >= DECK_SET_SIZE) return { ok: false, reason: 'full' }
    target.push(id); saveDeck(); return { ok: true, on: true }
  }

  // 카운트 amount 로 만들 수 있는 젬 수(차감/적립은 호출측). 남는 카운트는 버리지 않도록 정수 젬만 반환.
  function gemsFromCount(count) { return D.countToGems(count) }

  // 전체 목록(유닛+무기) — 컬렉션 UI용. rarity 메타 병합.
  function catalog() {
    return [...D.unitList(), ...D.weaponList()].map((e) => ({
      ...e, rarityInfo: D.RARITY[e.rarity] || D.RARITY.common,
      owned: !!owned[e.id], level: levels[e.id] || 0, count: counts[e.id] || 0,
    }))
  }

  // 가중 tier 선택
  function pickRarityKey() {
    const tiers = Object.values(D.RARITY).filter((r) => r.weight > 0)
    const total = tiers.reduce((s, r) => s + r.weight, 0)
    let x = _rand() * total
    for (const r of tiers) { x -= r.weight; if (x <= 0) return r.key }
    return tiers[tiers.length - 1].key
  }

  // 결정적 랜덤(테스트 시 주입 가능). 기본은 Math.random.
  let _rand = Math.random
  function setRandom(fn) { _rand = typeof fn === 'function' ? fn : Math.random }

  // 1회 뽑기. 젬 부족이면 null.
  function roll() {
    if (gems < D.GEM.pullCost) return null
    gems -= D.GEM.pullCost; saveGems()

    const pool = D.gachaPool()
    let rk = pickRarityKey()
    let bucket = pool.filter((e) => e.rarity === rk)
    if (!bucket.length) { bucket = pool; rk = null }   // 해당 tier 비면 전체에서
    const entry = bucket[Math.floor(_rand() * bucket.length)]
    const rarity = D.RARITY[entry.rarity] || D.RARITY.common

    const dup = !!owned[entry.id]
    counts[entry.id] = (counts[entry.id] || 0) + 1   // 중복은 강화부품이 아니라 스택(조합 재료)
    if (!dup) { owned[entry.id] = true; if (!levels[entry.id]) levels[entry.id] = 1; saveOwned() }
    saveCounts()
    return { id: entry.id, entry, rarity, dup, count: counts[entry.id] }
  }

  // ── 조합: 같은 희귀도 무기·소환체 5개 → 상위 희귀도 1개 랜덤 ──
  const RARITY_LADDER = ['common', 'uncommon', 'rare', 'legend']
  function nextRarity(rk) { const i = RARITY_LADDER.indexOf(rk); return i >= 0 && i < RARITY_LADDER.length - 1 ? RARITY_LADDER[i + 1] : null }
  function removeFromDeck(id) {   // 소비로 0개가 되면 덱에서도 제거
    let ch = false
    for (const arr of [deck.unitsA, deck.unitsB, deck.weapons]) { const i = arr.indexOf(id); if (i >= 0) { arr.splice(i, 1); ch = true } }
    if (ch) saveDeck()
  }
  // ids = 재료 5개(동일 희귀도). 성공 시 { ok, id(결과), entry, rarity } / 실패 { ok:false, reason }
  function craftWeapon(ids) {
    if (!Array.isArray(ids) || ids.length !== 5) return { ok: false, reason: 'need5' }
    const all = {}; ;[...D.unitList(), ...D.weaponList()].forEach((e) => all[e.id] = e)
    // 재료 유효성: 전부 보유·같은 희귀도, 개수 충분(중복 재료면 그 개수만큼 보유해야)
    const need = {}; for (const id of ids) need[id] = (need[id] || 0) + 1
    let rk = null
    for (const id of ids) { const e = all[id]; if (!e) return { ok: false, reason: 'bad' }; if (rk == null) rk = e.rarity; else if (e.rarity !== rk) return { ok: false, reason: 'mixed' } }
    for (const id in need) if ((counts[id] || 0) - need[id] < 1) return { ok: false, reason: 'keep1' }   // 1개 초과만 재료(마지막 1개 보존)
    const up = nextRarity(rk); if (!up) return { ok: false, reason: 'max' }   // 전설은 상위 없음
    // 결과 후보 = 상위 희귀도 전체(가챠 풀 기준)
    const pool = D.gachaPool().filter((e) => e.rarity === up)
    if (!pool.length) return { ok: false, reason: 'nopool' }
    // 소비
    for (const id in need) { counts[id] = (counts[id] || 0) - need[id]; if (counts[id] <= 0) { counts[id] = 0; owned[id] = false; delete levels[id]; removeFromDeck(id) } }
    const res = pool[Math.floor(_rand() * pool.length)]
    const wasDup = !!owned[res.id]
    counts[res.id] = (counts[res.id] || 0) + 1; owned[res.id] = true; if (!levels[res.id]) levels[res.id] = 1
    saveOwned(); saveCounts()
    return { ok: true, id: res.id, entry: res, rarity: D.RARITY[up] || null, dup: wasDup }
  }

  // 개발용 리셋(테스트 편의). 실제 앱의 1회 초기화 마이그레이션과는 별개.
  function _devReset() {
    gems = 0; materials = 0; owned = {}; levels = {}; counts = {}; deck = { unitsA: [], unitsB: [], weapons: [] }
    ;[...D.unitList(), ...D.weaponList()].forEach((e) => { if (e.starter) { owned[e.id] = true; levels[e.id] = 1; counts[e.id] = 1 } })
    saveGems(); saveMat(); saveOwned(); saveCounts(); saveDeck()
  }

  window.BattleGacha = {
    getGems, getMaterials, isOwned, getLevel, getCount, addGems, addMaterials, spendMaterials, setGems, setMaterials, setLevel,
    gemsFromCount, catalog, roll, craftWeapon, nextRarity, setRandom, _devReset,
    getDeck, deckLimits, deckReady, inDeck, toggleDeck,
  }
})()
