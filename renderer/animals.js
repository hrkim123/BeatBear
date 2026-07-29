// Cute beatbear-bear, vector drawn. Bear only (replaced the cat, 2026-07-28 — menu redesign Phase 3).
// Public API: draw / CELL_W / CELL_H / SLAP_MS / SKINS / HATS / PATTERNS / anchors / DEFAULT_FEAT
(function () {
  const LINE = '#43404c'
  // Cute round brown bear. Base (no skin) = warm brown body, cream muzzle/belly, dark nose.
  const BEAR = { body: '#bd8a5e', belly: '#ecd6b4', ear: '#bd8a5e', earIn: '#9c6a41', muzzle: '#ecd6b4', nose: '#453b34' }

  const CELL_W = 240
  const BUBBLE_H = 10
  const DESK_Y = 152
  const BAR_VIS = 54
  const CELL_H = BUBBLE_H + DESK_Y + BAR_VIS
  const SLAP_MS = 140

  const SKINS = {
    default: null, cream: '#f3e2c2', gray: '#b9bec8', brown: '#c79a6d',
    black: '#5a5762', orange: '#f0b27a', pink: '#f7bcd0', mint: '#b6e3d4', lavender: '#d0c2ec',
    white: '#f4f4f7'
  }
  const HATS = ['none', 'beanie', 'party', 'crown', 'tophat', 'cap']
  const PATTERNS = ['solid', 'tabby', 'tuxedo', 'spotted', 'point']

  // ---------- desk / keyboard / mouse cosmetics (꾸미기 하위 카테고리) ----------
  // Positions/footprint are fixed (battle ground, collision, paw targets) — only colors change.
  const DESK_STYLES = {
    wood:     { top: '#f0d7b0', bot: '#e0bd8b', hi: 'rgba(255,255,255,0.28)', lo: 'rgba(0,0,0,0.10)' },   // default (warm wood)
    oak:      { top: '#cba876', bot: '#a97c48', hi: 'rgba(255,240,215,0.30)', lo: 'rgba(60,36,14,0.20)' },   // 원목(깊은 내추럴 우드)
    white:    { top: '#f4f5f8', bot: '#dbe0ea', hi: 'rgba(255,255,255,0.55)', lo: 'rgba(0,0,0,0.08)' },
    graphite: { top: '#4c5058', bot: '#2f333b', hi: 'rgba(255,255,255,0.14)', lo: 'rgba(0,0,0,0.32)' },
    mint:     { top: '#cdeede', bot: '#a6dcc6', hi: 'rgba(255,255,255,0.42)', lo: 'rgba(0,0,0,0.08)' },
    oakgrain: { top: '#d3a86a', bot: '#a9793f', hi: 'rgba(255,240,215,0.26)', lo: 'rgba(60,36,14,0.22)', theme: 'grain' },   // 나이테(원목결)
    ember:    { top: '#5a2a1e', bot: '#37160f', hi: 'rgba(255,150,60,0.22)', lo: 'rgba(0,0,0,0.34)', theme: 'fire' },        // 불타는 책상
    ice:      { top: '#d3ecf6', bot: '#a6d2ea', hi: 'rgba(255,255,255,0.62)', lo: 'rgba(70,110,150,0.20)', theme: 'ice' }    // 얼음질감
  }
  const DESK_ORDER = ['wood', 'oak', 'white', 'graphite', 'mint', 'oakgrain', 'ember', 'ice']
  const KB_STYLES = {
    dark:  { case: '#4a4e5a', key: '#6b7080' },   // default (dark case, gray keys)
    white: { case: '#e6e8ee', key: '#c2c6d0' },
    cream: { case: '#d9c4a0', key: '#f0e7d6' },
    teal:  { case: '#2b3a44', key: '#54c7c0' },    // gamer teal keycaps
    fire:  { case: '#5a2a1e', key: '#e0672a', theme: 'fire' },   // 불타는 키보드
    aura:  { case: '#3a2f52', key: '#9b7be0', theme: 'aura' },   // 빛 아우라 키보드
    vine:  { case: '#6b5a3a', key: '#cdbb8f', theme: 'vine' }    // 덩굴 키보드
  }
  const KB_ORDER = ['dark', 'white', 'cream', 'teal', 'fire', 'aura', 'vine']
  const MOUSE_STYLES = {   // line = 좌/우 버튼 구분선 색(본체와 대비되게)
    white:  { body: '#eceef4', seam: '#c2c5d0', line: '#4a4e5a' },   // default (밝은 본체 → 검은 구분선)
    dark:   { body: '#3a3d46', seam: '#20222a', line: '#eef1f6' },   // 어두운 본체 → 흰 구분선
    pink:   { body: '#ffd3e2', seam: '#f2a9c4', line: '#a3436b' },
    blue:   { body: '#bcd6ff', seam: '#8fb4ee', line: '#2f4f8f' },
    fire:   { body: '#5a2a1e', seam: '#7a3320', line: '#ffd27a', theme: 'fire' },     // 불타는 마우스
    animal: { body: '#b8b3ac', seam: '#8f8a83', line: '#5a5560', theme: 'animal' },   // 쥐 모양 마우스
    vine:   { body: '#7c8a5a', seam: '#5f6d43', line: '#eaf3d8', theme: 'vine' }      // 덩굴 마우스
  }
  const MOUSE_ORDER = ['white', 'dark', 'pink', 'blue', 'fire', 'animal', 'vine']
  function deskStyle(state) { return DESK_STYLES[state.deskStyle] || DESK_STYLES.wood }
  function kbStyle(state) { return KB_STYLES[state.kbStyle] || KB_STYLES.dark }
  function mouseStyle(state) { return MOUSE_STYLES[state.mouseStyle] || MOUSE_STYLES.white }

  // per-feature position nudges the user can drag in edit mode
  const DEFAULT_FEAT = { earDX: 0, earDY: 0, eyeDX: 0, eyeDY: 0, tailDX: 0, tailDY: 0 }

  // selectable body-part SHAPES (character customization). Order matters for wire encoding.
  const EAR_SHAPES = ['pointed', 'round', 'folded', 'antler', 'devil', 'goblin']
  const EYE_SHAPES = ['oval', 'round', 'happy', 'sparkle', 'fire', 'glow', 'cry', 'brow']
  const MOUTH_SHAPES = ['smile', 'cat', 'oh', 'wide', 'devil', 'mischief']
  const TAIL_SHAPES = ['curl', 'straight', 'fluffy', 'stub', 'devil', 'club']
  // 발(앞발) 모양: round=크림 패드, pink=분홍 젤리, brown=갈색 패드(색상 베리), claw=패드 바깥으로 나온 발톱, paw=진짜 곰손
  const HAND_SHAPES = ['round', 'pink', 'brown', 'claw', 'paw', 'fire', 'aura']
  // 몸 스킨(머리+몸통+꼬리 문양 세트, 색과 별개): plain=기본, cream=크림 배, panda=흰 배, heart=하트 배, moon=반달곰, star=별무늬, fire=불타는 몸, goblin=도깨비 옷(호피)
  const BODY_SKINS = ['plain', 'cream', 'panda', 'heart', 'moon', 'star', 'fire', 'goblin']
  const BLUSH_SKINS = ['heart', 'star', 'panda']   // 볼터치를 쓰는 스킨(기본 곰엔 볼터치 없음)
  // Skins 프리셋(색+몸 통합) — app(소유/소환)·menu(그리드) 공용. id=소유 키.
  const SKIN_PRESETS = [
    { id: 'default', name: '기본 갈색', tint: 'default', body: 'plain' },
    { id: 'cream', name: '크림', tint: 'cream', body: 'plain' }, { id: 'gray', name: '회색', tint: 'gray', body: 'plain' },
    { id: 'brownc', name: '브라운', tint: 'brown', body: 'plain' }, { id: 'blackc', name: '블랙', tint: 'black', body: 'plain' },
    { id: 'orange', name: '오렌지', tint: 'orange', body: 'plain' }, { id: 'pinkc', name: '핑크', tint: 'pink', body: 'plain' },
    { id: 'mint', name: '민트', tint: 'mint', body: 'plain' }, { id: 'lavender', name: '라벤더', tint: 'lavender', body: 'plain' },
    { id: 'panda', name: '판다', tint: 'white', body: 'panda' }, { id: 'moon', name: '반달곰', tint: 'black', body: 'moon' },
    { id: 'heart', name: '하트곰', tint: 'pink', body: 'heart' }, { id: 'star', name: '별곰', tint: 'lavender', body: 'star' },
    { id: 'creamb', name: '크림배', tint: 'brown', body: 'cream' },
    // 테마 프리셋 — 몸 문양 + 전용 꼬리를 함께 세팅(꼬리는 별도 탭 없이 스킨에 번들). 입/귀 등은 별도 아이템으로 조합.
    { id: 'fireb', name: '불타는곰', tint: 'black', body: 'fire', tail: 'devil' },
    { id: 'goblinb', name: '도깨비곰', tint: 'mint', body: 'goblin', tail: 'club' }
  ]
  const DEFAULT_SHAPE = { ear: 'round', eye: 'round', mouth: 'smile', tail: 'stub', hand: 'round', body: 'plain' }
  function shapesOf(state) {
    const s = state.shape || {}
    return {
      ear: EAR_SHAPES.includes(s.ear) ? s.ear : 'round',
      eye: EYE_SHAPES.includes(s.eye) ? s.eye : 'round',
      mouth: MOUTH_SHAPES.includes(s.mouth) ? s.mouth : 'smile',
      hand: HAND_SHAPES.includes(s.hand) ? s.hand : 'round',
      body: BODY_SKINS.includes(s.body) ? s.body : 'plain',
      tail: TAIL_SHAPES.includes(s.tail) ? s.tail : 'stub'
    }
  }

  // ---------- color helpers ----------
  function parseColor(c) {
    if (c[0] === '#') {
      let h = c.slice(1)
      if (h.length === 3) h = h.split('').map(x => x + x).join('')
      const n = parseInt(h, 16)
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (m) { const p = m[1].split(',').map(parseFloat); return { r: p[0], g: p[1], b: p[2] } }
    return { r: 250, g: 250, b: 252 }
  }
  function shade(color, amt) {
    const { r, g, b } = parseColor(color)
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt)
    const mix = (c) => Math.round(c + (t - c) * p)
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`
  }

  // ---------- primitives ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }
  function ink(ctx, fill, lw) {
    if (fill) { ctx.fillStyle = fill; ctx.fill() }
    ctx.strokeStyle = LINE; ctx.lineWidth = lw || 3; ctx.lineJoin = 'round'; ctx.stroke()
  }
  function volume(ctx, base, x, y, r) {
    const g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.4, r * 0.1, x, y, r * 1.05)
    g.addColorStop(0, shade(base, 0.16)); g.addColorStop(0.6, base); g.addColorStop(1, shade(base, -0.10))
    return g
  }
  function slapProgress(lastSlap, now) {
    if (!lastSlap) return 0
    const e = now - lastSlap
    if (e >= SLAP_MS) return 0
    const t = e / SLAP_MS
    return t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7
  }
  function furPalette(tint) {
    if (!tint || tint === 'default' || !SKINS[tint]) return BEAR
    const c = SKINS[tint]
    return { body: c, belly: shade(c, 0.5), ear: c, earIn: shade(c, -0.28), muzzle: shade(c, 0.5), nose: BEAR.nose }
  }
  function feat(state) { return Object.assign({}, DEFAULT_FEAT, state.feat || {}) }
  function bobAt(now, seed) { return Math.sin(now / 950 + (seed || 0)) * 1.4 }

  // 앞발(손) 하나를 (px,py) 중심·반경 r로 그림 — 연주(pawPad)·미리보기(drawHand) 공유. now=이펙트 애니.
  function drawPaw(ctx, shape, px, py, r, pal, now) {
    const belly = (pal && pal.belly) || BEAR.belly
    if (shape === 'aura') FX.glow(ctx, px, py, r * 1.7, now || 0, 'rgba(180,145,255,0.9)')   // 빛 아우라(패드 뒤)
    if (shape === 'claw') {   // 발톱을 패드 "뒤"에 먼저 그려 바깥으로 뾰족하게 튀어나오게(패드가 밑동을 가림)
      ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#5a5560'; ctx.lineWidth = 0.9; ctx.lineJoin = 'round'
      for (const s of [-0.62, 0, 0.62]) {
        const cxx = px + s * r, lean = s * r * 0.22
        ctx.beginPath()
        ctx.moveTo(cxx - r * 0.17, py - r * 0.45)
        ctx.lineTo(cxx + r * 0.17, py - r * 0.45)
        ctx.lineTo(cxx + lean, py - r * 1.28)   // tip — 패드 위 가장자리(0.82r) 밖으로
        ctx.closePath(); ctx.fill(); ctx.stroke()
      }
    }
    const padCol = shape === 'brown' ? shade((pal && pal.body) || BEAR.body, -0.04) : belly
    ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.82, 0, 0, Math.PI * 2); ink(ctx, volume(ctx, padCol, px, py - 2, r), 2.5)
    if (shape === 'pink') {   // 분홍 젤리
      ctx.fillStyle = '#e58aa3'
      ctx.beginPath(); ctx.ellipse(px, py + r * 0.15, r * 0.32, r * 0.24, 0, 0, Math.PI * 2); ctx.fill()
      for (const s of [-1, 0, 1]) { ctx.beginPath(); ctx.ellipse(px + s * r * 0.34, py - r * 0.38, r * 0.14, r * 0.17, 0, 0, Math.PI * 2); ctx.fill() }
    } else if (shape === 'paw') {   // 진짜 곰손 — 진한 큰 젤리 + 발가락 젤리 4개
      ctx.fillStyle = shade(belly, -0.3)
      ctx.beginPath(); ctx.ellipse(px, py + r * 0.16, r * 0.42, r * 0.32, 0, 0, Math.PI * 2); ctx.fill()
      for (const s of [-1.5, -0.5, 0.5, 1.5]) { ctx.beginPath(); ctx.ellipse(px + s * r * 0.27, py - r * 0.4, r * 0.15, r * 0.18, 0, 0, Math.PI * 2); ctx.fill() }
    } else if (shape === 'fire') {   // 불타는 손 — 패드를 감싸는 불꽃 + 위로 솟음
      FX.burn(ctx, px, py, r * 2.0, r * 1.9, now || 0, 'round')
    } else {   // round / brown / claw / aura → 발가락선
      ctx.strokeStyle = 'rgba(70,64,80,0.35)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(px - r * 0.28, py - r * 0.4); ctx.lineTo(px - r * 0.28, py); ctx.moveTo(px + r * 0.28, py - r * 0.4); ctx.lineTo(px + r * 0.28, py); ctx.stroke()
    }
  }
  // 메뉴 미리보기용 — tint(스킨색)로 팔레트를 만들어 손 하나만 렌더
  function drawHand(ctx, shape, x, y, r, tint, now) {
    drawPaw(ctx, HAND_SHAPES.includes(shape) ? shape : 'round', x, y, r, furPalette(tint), now)
  }

  function drawStar(ctx, x, y, r, rot, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      const a2 = a + Math.PI / 5
      ctx.lineTo(Math.cos(a2) * r * 0.45, Math.sin(a2) * r * 0.45)
    }
    ctx.closePath()
    ctx.fillStyle = color || '#ffd451'; ctx.fill()
    ctx.strokeStyle = 'rgba(120,90,20,0.6)'; ctx.lineWidth = 1; ctx.stroke()
    ctx.restore()
  }
  function drawDizzyStars(ctx, cx, cy, now) {
    for (let k = 0; k < 3; k++) {
      const a = now / 210 + k * 2.094
      drawStar(ctx, cx + Math.cos(a) * 22, cy + Math.sin(a) * 7, 5, now / 120 + k, '#ffd451')
    }
  }

  // ---------- 이펙트 엔진(불/아우라/눈물/반짝임) — now(ms)로 애니메이션. 캐릭터·메뉴 미리보기 공용 ----------
  const FX = {
    flame(ctx, cx, cy, w, h, now, seed) {   // 이글이글 타는 불꽃(밑동 cy, 위로 h) — 여러 레이어 + 밝은 코어 + 불티
      const t = now / 68 + (seed || 0)
      // [색, 폭배율, 높이배율]  바깥(짙은 빨강) → 안쪽(밝은 흰노랑)
      const layers = [['rgba(200,35,8,0.92)', 1.0, 1.0], ['rgba(255,85,20,0.95)', 0.8, 0.88], ['rgba(255,165,45,0.98)', 0.58, 0.72], ['rgba(255,240,180,1)', 0.3, 0.48]]
      for (let i = 0; i < layers.length; i++) {
        const L = layers[i], fl = 1 + 0.3 * Math.sin(t + i * 1.1), hh = h * L[2] * fl, ww = w * L[1]
        const wob = Math.sin(t * 1.7 + i * 1.4) * w * 0.24
        ctx.fillStyle = L[0]
        ctx.beginPath()
        ctx.moveTo(cx + wob, cy - hh)
        ctx.bezierCurveTo(cx - ww, cy - hh * 0.42, cx - ww * 0.7, cy + h * 0.04, cx, cy + h * 0.12)
        ctx.bezierCurveTo(cx + ww * 0.7, cy + h * 0.04, cx + ww, cy - hh * 0.42, cx + wob, cy - hh)
        ctx.closePath(); ctx.fill()
      }
      // 위로 튀는 불티
      ctx.fillStyle = 'rgba(255,205,95,0.95)'
      for (let k = 0; k < 3; k++) { const ph = ((now / 480) + k / 3 + (seed || 0)) % 1; const sx = cx + Math.sin(t * 2 + k * 2) * w * 0.55, sy = cy - h * (0.55 + ph * 1.0); ctx.globalAlpha = (1 - ph) * 0.85; ctx.beginPath(); ctx.arc(sx, sy, w * 0.12, 0, Math.PI * 2); ctx.fill() }
      ctx.globalAlpha = 1
    },
    glow(ctx, cx, cy, r, now, color) {   // 맥동하는 빛 아우라
      const pulse = 0.6 + 0.4 * Math.sin(now / 260), R = r * (1 + 0.22 * pulse)
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, R)
      g.addColorStop(0, color || 'rgba(150,220,255,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.save(); ctx.globalAlpha = 0.45 * pulse + 0.35; ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.restore()
    },
    tear(ctx, x, y, now, seed) {   // 아래로 왈칵 흐르는 큰 눈물방울(과장)
      const ph = ((now / 500) + (seed || 0)) % 1, ty = y + ph * 34, alpha = ph < 0.9 ? 1 : (1 - ph) / 0.1
      ctx.save(); ctx.globalAlpha = Math.max(0, alpha)
      ctx.fillStyle = 'rgba(105,195,255,0.95)'   // 물방울(위 뾰족, 아래 둥근)
      ctx.beginPath(); ctx.moveTo(x, ty - 5); ctx.bezierCurveTo(x + 3.2, ty - 1, x + 3.2, ty + 3.2, x, ty + 3.8); ctx.bezierCurveTo(x - 3.2, ty + 3.2, x - 3.2, ty - 1, x, ty - 5); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.beginPath(); ctx.arc(x - 1, ty - 0.3, 1, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    },
    sparkle(ctx, cx, cy, r, now, seed) {   // 주변 반짝임
      for (let k = 0; k < 3; k++) {
        const ph = ((now / 640) + k / 3 + (seed || 0)) % 1, a = 1 - Math.abs(ph - 0.5) * 2
        const ang = k * 2.094 + now / 420, sx = cx + Math.cos(ang) * r, sy = cy + Math.sin(ang) * r * 0.7
        ctx.save(); ctx.globalAlpha = Math.max(0, a); drawStar(ctx, sx, sy, 2.2, now / 300 + k, '#fff2b0'); ctx.restore()
      }
    },
    // 불타는 이펙트 공용 — (A)사물 실루엣을 감싸는 불꽃 윤곽 + (B)위쪽 솟는 통짜 불꽃. shape: 'round'|'rect'
    burn(ctx, cx, cy, w, h, now, shape) {
      const rx = w / 2, ry = h / 2, t = now || 0
      const pts = []
      if (shape === 'rect') {
        const r = Math.min(w, h) * 0.2, L = cx - rx, R = cx + rx, T = cy - ry, B = cy + ry
        const seg = (x0, y0, x1, y1, nx, ny, n) => { for (let i = 0; i < n; i++) { const u = i / n; pts.push({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, nx, ny }) } }
        const arc = (ax, ay, a0, a1, n) => { for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i / n); pts.push({ x: ax + r * Math.cos(a), y: ay + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }) } }
        const ns = 6, na = 3
        seg(L + r, T, R - r, T, 0, -1, ns); arc(R - r, T + r, -Math.PI / 2, 0, na); seg(R, T + r, R, B - r, 1, 0, ns); arc(R - r, B - r, 0, Math.PI / 2, na); seg(R - r, B, L + r, B, 0, 1, ns); arc(L + r, B - r, Math.PI / 2, Math.PI, na); seg(L, B - r, L, T + r, -1, 0, ns); arc(L + r, T + r, Math.PI, Math.PI * 1.5, na)
      } else {
        const N = 36; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2 - Math.PI / 2; let nx = Math.cos(a) / rx, ny = Math.sin(a) / ry; const m = Math.hypot(nx, ny); nx /= m; ny /= m; pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), nx, ny }) }
      }
      const off = Math.max(3, Math.min(w, h) * 0.12), amp = off * 1.4
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      const gr = Math.min(Math.max(rx, ry) * 1.7, 130)
      const gl = ctx.createRadialGradient(cx, cy, 2, cx, cy, gr); gl.addColorStop(0, 'rgba(255,150,50,0.18)'); gl.addColorStop(0.6, 'rgba(255,90,20,0.08)'); gl.addColorStop(1, 'rgba(255,60,10,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(cx, cy, gr, gr, 0, 0, Math.PI * 2); ctx.fill()
      const ring = (phase, scale, stops) => {
        ctx.beginPath()
        pts.forEach((p, i) => { const wob = Math.sin(i * 0.9 + t / 140 + phase) * 0.5 + Math.sin(i * 2.3 - t / 95 + phase) * 0.3 + 0.7, topF = Math.max(0, (cy - p.y) / ry), hh = (off + amp * wob * (0.55 + topF * 1.35)) * scale, x = p.x + p.nx * hh, y = p.y + p.ny * hh; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }); ctx.closePath()
        for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], x = p.x + p.nx * (-1.5), y = p.y + p.ny * (-1.5); i === pts.length - 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) } ctx.closePath()
        const g = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.75, cx, cy, Math.max(rx, ry) + off + amp); stops.forEach((s) => g.addColorStop(s[0], s[1])); ctx.fillStyle = g; ctx.fill('evenodd')
      }
      ring(0, 1.0, [[0, 'rgba(255,175,70,0.45)'], [0.5, 'rgba(255,120,35,0.68)'], [1, 'rgba(210,60,22,0)']])
      ring(1.7, 0.68, [[0, 'rgba(255,238,170,0.8)'], [0.55, 'rgba(255,180,70,0.65)'], [1, 'rgba(255,140,45,0)']])
      for (let i = 0; i < 6; i++) { const ph = ((t / 520) + i * 0.4) % 1, ex2 = cx + Math.sin(i * 3 + t / 300) * rx * 0.9, ey2 = cy - ry * 0.4 - ph * (ry * 2.4); ctx.fillStyle = 'rgba(255,205,95,' + (0.65 * (1 - ph)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(ex2, ey2, 1.3 * (1 - ph) + 0.5, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    }
  }

  // ---------- coat patterns ----------
  function patternBody(ctx, pattern, pal, cx, deskY, bob) {
    if (!pattern || pattern === 'solid') return
    ctx.save()
    ctx.beginPath(); ctx.ellipse(cx, deskY + 10 + bob * 0.4, 58, 54, 0, 0, Math.PI * 2); ctx.clip()
    const dark = shade(pal.body, -0.28)
    if (pattern === 'tabby') {
      ctx.strokeStyle = dark; ctx.lineWidth = 6; ctx.lineCap = 'round'
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(cx - 40, deskY - 6 + i * 16)
        ctx.quadraticCurveTo(cx, deskY + 2 + i * 16, cx + 40, deskY - 6 + i * 16)
        ctx.stroke()
      }
    } else if (pattern === 'tuxedo') {
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.ellipse(cx, deskY + 14, 26, 34, 0, 0, Math.PI * 2); ctx.fill()
    } else if (pattern === 'spotted') {
      ctx.fillStyle = dark
      for (const [dx, dy] of [[-28, -6], [22, 4], [-6, 18], [30, -14]]) {
        ctx.beginPath(); ctx.ellipse(cx + dx, deskY + dy, 7, 6, 0, 0, Math.PI * 2); ctx.fill()
      }
    } else if (pattern === 'point') {
      ctx.fillStyle = shade(pal.body, -0.22); ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.ellipse(cx, deskY + 40, 60, 30, 0, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  }

  function patternHead(ctx, pattern, pal, cx, hy) {
    if (!pattern || pattern === 'solid') return
    ctx.save()
    ctx.beginPath(); ctx.ellipse(cx, hy, 50, 44, 0, 0, Math.PI * 2); ctx.clip()
    const dark = shade(pal.body, -0.28)
    if (pattern === 'tabby') {
      ctx.strokeStyle = dark; ctx.lineWidth = 4; ctx.lineCap = 'round'
      for (const dx of [-7, 0, 7]) { // forehead "M"
        ctx.beginPath(); ctx.moveTo(cx + dx, hy - 40); ctx.lineTo(cx + dx * 1.5, hy - 22); ctx.stroke()
      }
      for (const s of [-1, 1]) { // cheek stripes
        ctx.beginPath(); ctx.moveTo(cx + s * 34, hy - 6); ctx.lineTo(cx + s * 48, hy - 2); ctx.stroke()
      }
    } else if (pattern === 'tuxedo') {
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.ellipse(cx, hy + 14, 26, 20, 0, 0, Math.PI * 2); ctx.fill()
    } else if (pattern === 'spotted') {
      ctx.fillStyle = dark
      for (const [dx, dy] of [[-24, -14], [26, -8]]) {
        ctx.beginPath(); ctx.ellipse(cx + dx, hy + dy, 6, 5, 0, 0, Math.PI * 2); ctx.fill()
      }
    } else if (pattern === 'point') {
      ctx.fillStyle = shade(pal.body, -0.24)
      ctx.beginPath(); ctx.ellipse(cx, hy + 10, 24, 18, 0, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  }

  // ---------- body skin (몸/가슴 컨셉 — 책상 위로 실제 보이는 가슴 영역에 그림) ----------
  function drawBodySkin(ctx, design, cx, bodyY, pal, now) {
    if (!design || design === 'plain' || !BODY_SKINS.includes(design)) return
    if (design === 'fire') { FX.burn(ctx, cx, bodyY - 20, 76, 66, now, 'round'); return }   // 불타는 몸 — 몸통을 감싸며 위로 타오름(클립 없이)
    const cream = shade(pal.body, 0.58)
    ctx.save()
    ctx.beginPath(); ctx.ellipse(cx, bodyY, 58, 54, 0, 0, Math.PI * 2); ctx.clip()
    const cy = bodyY - 26   // 책상 위로 노출되는 가슴 중앙
    const heart = (hx, hy, s, col) => { ctx.beginPath(); ctx.moveTo(hx, hy + s * 0.85); ctx.bezierCurveTo(hx - s * 1.3, hy - s * 0.2, hx - s * 0.5, hy - s * 1.1, hx, hy - s * 0.3); ctx.bezierCurveTo(hx + s * 0.5, hy - s * 1.1, hx + s * 1.3, hy - s * 0.2, hx, hy + s * 0.85); ctx.closePath(); ctx.fillStyle = col; ctx.fill() }
    if (design === 'cream') {   // 크림 가슴
      ctx.beginPath(); ctx.ellipse(cx, cy + 8, 26, 30, 0, 0, Math.PI * 2); ctx.fillStyle = cream; ctx.fill()
      ctx.strokeStyle = shade(pal.body, -0.14); ctx.lineWidth = 1.4; ctx.stroke()
    } else if (design === 'panda') {   // 흰 몸 + 검은 어깨밴드 + 팔(판다 조끼). 머리는 drawHeadSkin.
      ctx.fillStyle = '#232227'
      ctx.beginPath(); ctx.ellipse(cx, cy - 6, 48, 19, 0, 0, Math.PI * 2); ctx.fill()   // 어깨 밴드(가로)
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 42, cy + 16, 18, 30, 0, 0, Math.PI * 2); ctx.fill() }   // 양쪽 팔
    } else if (design === 'heart') {   // 몸에 빨간 하트들
      heart(cx, cy, 11, '#e0466b'); heart(cx - 27, cy + 12, 7, '#f07a97'); heart(cx + 27, cy + 12, 7, '#f07a97')
      heart(cx - 15, cy - 14, 6, '#f07a97'); heart(cx + 15, cy - 14, 6, '#f07a97')
    } else if (design === 'moon') {   // 반달곰 — 가슴 크림 V자 반달 무늬
      ctx.strokeStyle = cream; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(cx - 17, cy - 7); ctx.lineTo(cx, cy + 13); ctx.lineTo(cx + 17, cy - 7); ctx.stroke()
    } else if (design === 'star') {   // 별무늬
      drawStar(ctx, cx, cy, 12, -Math.PI / 2 + 0.63, '#ffe08a')
      drawStar(ctx, cx - 23, cy + 13, 7, 0.2, '#ffe08a'); drawStar(ctx, cx + 23, cy + 13, 7, -0.3, '#ffe08a')
    } else if (design === 'goblin') {   // 도깨비 옷 — 호피(호랑이 무늬) 허리감개
      ctx.fillStyle = '#e6a83c'
      ctx.beginPath(); ctx.rect(cx - 52, cy + 2, 104, 26); ctx.fill()
      ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'
      for (let i = -4; i <= 4; i++) { const x = cx + i * 12; ctx.beginPath(); ctx.moveTo(x - 3, cy + 2); ctx.quadraticCurveTo(x + 3, cy + 15, x - 2, cy + 28); ctx.stroke() }
      ctx.strokeStyle = '#a06a24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 52, cy + 3); ctx.lineTo(cx + 52, cy + 3); ctx.stroke()
    }
    ctx.restore()
  }
  // 머리 레벨 테마(판다: 양쪽 검은 귀 + 눈물방울 눈 무늬 + 그 안 반짝이는 눈). 머리/귀/눈이 그려진 뒤 호출.
  function drawHeadSkin(ctx, design, cx, hy, pal, f) {
    if (design !== 'panda') return
    const BK = '#232227', eyeY = hy - 2 + ((f && f.eyeDY) || 0), edx = (f && f.eyeDX) || 0
    // (귀는 스킨이 직접 그리지 않음 — 귀 디자인은 별도 '귀' 꾸미기 담당. 판다는 귀 "색"만 검게: 귀 렌더에서 shp.body==='panda' 처리)
    // 검은 눈 무늬 — 큰 세로 타원이 위(바깥)는 눈을 감싸고 아래(안쪽=코쪽)로 기움(만화 판다). 눈은 패치 윗부분.
    for (const s of [-1, 1]) {
      const ex = cx + s * (15 + edx)
      ctx.fillStyle = BK
      // 눈물방울 무늬: 코쪽 아래로 뾰족한 꼬리 + 눈을 감싸는 둥근 윗부분
      ctx.beginPath(); ctx.moveTo(ex - s * 3, eyeY + 5); ctx.lineTo(ex + s * 4, eyeY + 3); ctx.lineTo(ex + s * 7, eyeY + 18); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.ellipse(ex - s * 1.5, eyeY - 1, 8, 9.5, 0, 0, Math.PI * 2); ctx.fill()
      const cxE = ex - s * 1.5, cyE = eyeY - 1
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cxE, cyE, 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#211d1a'; ctx.beginPath(); ctx.arc(cxE, cyE + 0.4, 3.4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(cxE - 1.5, cyE - 1.5, 1.4, 0, Math.PI * 2); ctx.fill()
    }
  }

  // ---------- hats ----------
  function drawHat(ctx, hat, cx, topY) {
    if (!hat || hat === 'none') return
    ctx.save(); ctx.lineJoin = 'round'
    if (hat === 'beanie') {
      ctx.beginPath(); ctx.arc(cx, topY + 6, 32, Math.PI, Math.PI * 2); ink(ctx, '#e0607a', 2.5)
      rr(ctx, cx - 33, topY + 3, 66, 10, 5); ink(ctx, '#fbf1e6', 2.5)
      ctx.beginPath(); ctx.arc(cx, topY - 26, 7, 0, Math.PI * 2); ink(ctx, '#fbf1e6', 2.5)
    } else if (hat === 'party') {
      ctx.beginPath(); ctx.moveTo(cx, topY - 40); ctx.lineTo(cx - 24, topY + 6); ctx.lineTo(cx + 24, topY + 6); ctx.closePath(); ink(ctx, '#6c8cff', 2.5)
      ctx.fillStyle = '#ffd166'
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx - 9 + i * 9, topY - 16 + i * 11, 3.2, 0, Math.PI * 2); ctx.fill() }
      ctx.beginPath(); ctx.arc(cx, topY - 42, 6, 0, Math.PI * 2); ink(ctx, '#ffd166', 2.5)
    } else if (hat === 'crown') {
      ctx.beginPath()
      ctx.moveTo(cx - 28, topY + 6); ctx.lineTo(cx - 28, topY - 12); ctx.lineTo(cx - 14, topY - 1)
      ctx.lineTo(cx, topY - 18); ctx.lineTo(cx + 14, topY - 1); ctx.lineTo(cx + 28, topY - 12); ctx.lineTo(cx + 28, topY + 6); ctx.closePath(); ink(ctx, '#ffcf47', 2.5)
      ctx.fillStyle = '#ff7eb0'
      for (const dx of [-14, 0, 14]) { ctx.beginPath(); ctx.arc(cx + dx, topY - 1, 3, 0, Math.PI * 2); ctx.fill() }
    } else if (hat === 'tophat') {
      rr(ctx, cx - 32, topY + 2, 64, 9, 4); ink(ctx, '#3a3742', 2.5)
      rr(ctx, cx - 20, topY - 32, 40, 38, 4); ink(ctx, '#3a3742', 2.5)
      ctx.fillStyle = '#e0607a'; rr(ctx, cx - 20, topY - 5, 40, 8, 0); ctx.fill()
    } else if (hat === 'cap') {
      ctx.beginPath(); ctx.arc(cx, topY + 4, 28, Math.PI, Math.PI * 2); ink(ctx, '#37b18d', 2.5)
      ctx.beginPath(); ctx.ellipse(cx + 20, topY + 6, 20, 7, 0, Math.PI, Math.PI * 2); ink(ctx, '#37b18d', 2.5)
      ctx.beginPath(); ctx.arc(cx, topY - 24, 4, 0, Math.PI * 2); ink(ctx, '#2a8a6c', 2)
    }
    ctx.restore()
  }

  // ---------- speech bubble ----------
  function wrapText(ctx, text, maxWidth, maxLines) {
    const words = text.split(/\s+/); const lines = []; let cur = ''
    for (const word of words) {
      let w = word
      while (ctx.measureText(w).width > maxWidth) {
        let cut = w.length - 1
        while (cut > 1 && ctx.measureText((cur ? cur + ' ' : '') + w.slice(0, cut)).width > maxWidth) cut--
        lines.push((cur ? cur + ' ' : '') + w.slice(0, cut)); cur = ''; w = w.slice(cut)
      }
      const attempt = cur ? cur + ' ' + w : w
      if (ctx.measureText(attempt).width <= maxWidth) cur = attempt
      else { lines.push(cur); cur = w }
    }
    if (cur) lines.push(cur)
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{2}$/, '') + '…' }
    return lines
  }
  function drawBubble(ctx, text, cx, headTopY, now, until, clamp) {
    const alpha = Math.max(0, Math.min(1, (until - now) / 400))
    ctx.save(); ctx.globalAlpha = alpha
    ctx.font = '600 28px "Segoe UI", "Malgun Gothic", sans-serif'   // 살짝 축소(32→28)
    const lines = wrapText(ctx, text, 380, 2); const lineH = 36
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 52
    const h = lines.length * lineH + 26
    let x = cx - w / 2; let y = headTopY - h - 28  // 머리 위 중앙
    // 화면 끝 프리셋에서 말풍선이 오버레이 밖으로 나가지 않게 셀-로컬 좌표를 뷰포트 안으로 클램프.
    // clamp={sx,sy,sc,vw,vh}: 셀 화면좌표(sx,sy)·스케일(sc)·뷰포트(vw,vh). 화면좌표 = s* + local*sc.
    if (clamp && clamp.sc) {
      const M = 8
      const loX = (M - clamp.sx) / clamp.sc, hiX = (clamp.vw - M - clamp.sx) / clamp.sc - w
      if (hiX >= loX) x = Math.max(loX, Math.min(hiX, x))
      const loY = (M - clamp.sy) / clamp.sc
      if (y < loY) y = loY   // 위로 넘치면 아래로(캐릭터는 하단 고정이라 대개 가로만 문제)
    }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(60,55,70,0.25)'; ctx.lineWidth = 2
    rr(ctx, x, y, w, h, 24); ctx.fill(); ctx.stroke()
    const tailTip = Math.min(headTopY - 2, y + h + 20)
    const tb = Math.max(x + 18, Math.min(x + w - 18, cx))   // 꼬리 밑변은 상자 아래에 붙임(클램프로 상자가 이동해도 분리 안 됨), 끝은 캐릭터(cx)를 가리킴
    ctx.beginPath(); ctx.moveTo(tb - 16, y + h - 1); ctx.lineTo(cx, tailTip); ctx.lineTo(tb + 16, y + h - 1); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#33313a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const cyB = y + h / 2  // vertically center the text block inside the bubble
    lines.forEach((l, i) => ctx.fillText(l, x + w / 2, cyB + (i - (lines.length - 1) / 2) * lineH))
    ctx.restore()
  }

  // feature anchor points (cell-local coords, y includes the BUBBLE_H offset)
  function anchors(state, now) {
    const f = feat(state)
    const cx = 120
    const bob = bobAt(now, state.seed)
    const hy = 84 + bob
    return {
      ears: { x: cx + 32 + f.earDX, y: BUBBLE_H + hy - 40 + f.earDY },
      eyes: { x: cx + 15 + f.eyeDX, y: BUBBLE_H + hy - 2 + f.eyeDY },
      tail: { x: cx + 80 + f.tailDX, y: BUBBLE_H + (DESK_Y - 58) + f.tailDY }
    }
  }

  // ── 테마 오버레이(책상/키보드/마우스) — 베이스 색 위에 덧그림. now로 불/아우라 애니 ──
  function deskTheme(ctx, name, deskY, W, now) {
    if (name === 'grain') {   // 나이테(원목결)
      ctx.save(); ctx.strokeStyle = 'rgba(90,55,20,0.20)'; ctx.lineWidth = 1.3
      for (let i = 0; i < 6; i++) { const y = deskY + 5 + i * 5; ctx.beginPath(); for (let x = 0; x <= W; x += 14) { const yy = y + Math.sin((x + i * 30) / 40) * 1.7; x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy) } ctx.stroke() }
      ctx.strokeStyle = 'rgba(90,55,20,0.28)'
      for (const ox of [W * 0.24, W * 0.72]) for (let r = 3; r < 12; r += 3) { ctx.beginPath(); ctx.ellipse(ox, deskY + 16, r, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke() }
      ctx.restore()
    } else if (name === 'fire') {   // 불타는 책상(애니)
      FX.burn(ctx, W / 2, deskY + 14, W - 8, 30, now || 0, 'rect')
      ctx.fillStyle = 'rgba(255,140,50,0.10)'; ctx.fillRect(0, deskY, W, 6)
    } else if (name === 'ice') {   // 얼음질감 — 서리 균열 + 광택
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1
      const rnd = (n) => { const v = Math.sin(n * 91.7) * 43758.5; return v - Math.floor(v) }
      for (let i = 0; i < 7; i++) { let x = rnd(i) * W, y = deskY + 5 + rnd(i + 3) * 14; ctx.beginPath(); ctx.moveTo(x, y); for (let g = 0; g < 3; g++) { x += (rnd(i * 4 + g) - 0.5) * 30; y += (rnd(i + g) - 0.5) * 8; ctx.lineTo(x, y) } ctx.stroke() }
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(0, deskY + 1, W, 2)
      ctx.restore()
    }
  }
  function kbTheme(ctx, name, x, y, w, h, now) {
    if (name === 'fire') { FX.burn(ctx, x + w / 2, y + h / 2, w, h, now || 0, 'rect') }
    else if (name === 'aura') { FX.glow(ctx, x + w / 2, y + h / 2, w * 0.6, now || 0, 'rgba(150,120,255,0.85)') }
    else if (name === 'vine') {   // 덩굴 — 케이스 위 넝쿨 + 잎
      ctx.save(); ctx.strokeStyle = '#4b7a3a'; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(x + 2, y + h); ctx.bezierCurveTo(x + w * 0.3, y - 4, x + w * 0.6, y + h + 2, x + w - 2, y - 2); ctx.stroke()
      ctx.fillStyle = '#5f9e4a'
      for (const t of [0.22, 0.48, 0.72, 0.92]) { const lx = x + w * t, ly = (Math.floor(t * 10) % 2 === 0) ? y - 2 : y + h; ctx.beginPath(); ctx.ellipse(lx, ly, 3.4, 2, t * 3, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    }
  }
  function mouseTheme(ctx, name, mox, deskY, now) {
    if (name === 'fire') { FX.burn(ctx, mox, deskY + 26, 26, 34, now || 0, 'round') }
    else if (name === 'vine') {
      ctx.save(); ctx.strokeStyle = '#4b7a3a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(mox - 8, deskY + 30); ctx.quadraticCurveTo(mox, deskY + 14, mox + 8, deskY + 24); ctx.stroke()
      ctx.fillStyle = '#5f9e4a'; ctx.beginPath(); ctx.ellipse(mox + 8, deskY + 24, 3, 1.8, 0.6, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(mox - 2, deskY + 18, 3, 1.8, -0.6, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    } else if (name === 'animal') {   // 쥐 모양 — 귀 2개 + 꼬리 + 눈
      ctx.fillStyle = '#b8b3ac'; ctx.strokeStyle = '#8f8a83'; ctx.lineWidth = 1.2
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(mox + s * 6, deskY + 13, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e6b8c4'; ctx.beginPath(); ctx.arc(mox + s * 6, deskY + 13, 1.9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#b8b3ac' }
      ctx.strokeStyle = '#8f8a83'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'   // 꼬리(뒤로 말림)
      ctx.beginPath(); ctx.moveTo(mox, deskY + 14); ctx.quadraticCurveTo(mox - 16, deskY + 8, mox - 12, deskY + 20); ctx.stroke()
      ctx.fillStyle = '#3a3540'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(mox + s * 3.4, deskY + 20, 1.2, 0, Math.PI * 2); ctx.fill() }   // 눈
    }
  }

  // ---------- main ----------
  function draw(ctx, _animal, state, now) {
    ctx.save()
    ctx.translate(0, BUBBLE_H)
    const pal = furPalette(state.tint)
    const f = feat(state)
    const shp = shapesOf(state)
    const cx = 120
    const deskY = DESK_Y
    const pattern = state.pattern || 'solid'

    const pL = slapProgress(state.lastLeft, now)
    const pR = slapProgress(state.lastRight, now)
    const pM = slapProgress(state.lastMouse, now)
    const bob = bobAt(now, state.seed)
    const hy = 84 + bob
    const active = Math.max(pL, pR, pM)
    // character HP → desk/keyboard/mouse damage + expression (0 = healthy, 1 = destroyed)
    const hpv = state.hp != null ? state.hp : 100
    const dmg01 = Math.max(0, Math.min(1, 1 - hpv / 100))
    const broken = hpv <= 0

    // hit reaction — shake the whole widget while recovering
    const hit = !!(state.hitUntil && now < state.hitUntil)
    if (hit) {
      const amp = Math.min(7, (state.hitUntil - now) / 70)
      ctx.translate(Math.sin(now / 28) * amp, 0)
    }

    // contact shadow
    ctx.fillStyle = 'rgba(40,30,25,0.14)'
    ctx.beginPath(); ctx.ellipse(cx, deskY + 3, 66, 10, 0, 0, Math.PI * 2); ctx.fill()

    // tail (behind body) — 곰의 작고 동그란 꼬리(고양이 꼬리 X). 특수 테마 꼬리(devil/club 등)는 별도 처리.
    ctx.save()
    ctx.translate(f.tailDX, f.tailDY)
    if (shp.tail === 'devil') {   // 악마 꼬리(가늘고 끝 삼각) — 테마용
      ctx.strokeStyle = LINE; ctx.lineWidth = 7; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(cx + 46, deskY - 4); ctx.quadraticCurveTo(cx + 84, deskY - 24, cx + 78, deskY - 52); ctx.stroke()
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + 46, deskY - 4); ctx.quadraticCurveTo(cx + 84, deskY - 24, cx + 78, deskY - 52); ctx.stroke()
      ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(cx + 78, deskY - 60); ctx.lineTo(cx + 71, deskY - 50); ctx.lineTo(cx + 85, deskY - 50); ctx.closePath(); ctx.fill()
    } else if (shp.tail === 'club') {   // 도깨비 방망이 꼬리(나무 몽둥이 + 못)
      const bx0 = cx + 46, by0 = deskY - 4, bx1 = cx + 82, by1 = deskY - 54
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 12; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1, by1); ctx.stroke()
      ctx.strokeStyle = '#9a6a3a'; ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1, by1); ctx.stroke()
      ctx.fillStyle = '#5a5560'
      for (const t of [0.5, 0.68, 0.86]) { const px = bx0 + (bx1 - bx0) * t, py = by0 + (by1 - by0) * t; ctx.beginPath(); ctx.arc(px + 6, py + 3, 2.1, 0, Math.PI * 2); ctx.arc(px - 6, py - 3, 2.1, 0, Math.PI * 2); ctx.fill() }
    } else {   // 기본: 작고 동그란 곰 꼬리(몸 뒤 우측에 살짝 보임)
      const wag = Math.sin(now / 900 + 1) * 2
      const txx = cx + 52 + wag, tyy = deskY - 22
      ctx.beginPath(); ctx.ellipse(txx, tyy, 10, 9, 0, 0, Math.PI * 2); ink(ctx, volume(ctx, pal.body, txx, tyy - 2, 10), 3)
    }
    ctx.restore()

    // body
    ctx.beginPath(); ctx.ellipse(cx, deskY + 10 + bob * 0.4, 58, 54, 0, 0, Math.PI * 2)
    ink(ctx, volume(ctx, pal.body, cx, deskY - 18, 76), 3)
    patternBody(ctx, pattern, pal, cx, deskY, bob)
    drawBodySkin(ctx, shp.body, cx, deskY + 10 + bob * 0.4, pal, now)

    // head group
    ctx.save()
    // ears — nudgeable + selectable shape
    // 판다 스킨은 귀 "색"만 검게(귀 디자인 자체는 그대로 = 다른 스킨처럼 색만 변화). BEAR 상수 오염 방지 위해 지역 변수 사용.
    const earCol = shp.body === 'panda' ? '#232227' : pal.ear
    const earInCol = shp.body === 'panda' ? '#3d3c44' : pal.earIn
    for (const s of [-1, 1]) {
      ctx.save()
      ctx.translate(s * f.earDX, f.earDY)
      // 뿔 종류(antler/devil/goblin)는 "귀 대신" 귀 자리에 들어가므로 둥근 귀 base를 그리지 않음(§ears=귀 위치 대체 가능)
      if (shp.ear === 'round') {   // round bear ear
        ctx.beginPath(); ctx.arc(cx + s * 32, hy - 34, 16, 0, Math.PI * 2); ink(ctx, volume(ctx, earCol, cx + s * 32, hy - 38, 16), 3)
        ctx.fillStyle = earInCol; ctx.beginPath(); ctx.arc(cx + s * 32, hy - 32, 8.5, 0, Math.PI * 2); ctx.fill()
      } else if (shp.ear === 'folded') {
        ctx.beginPath()
        ctx.moveTo(cx + s * 15, hy - 33)
        ctx.quadraticCurveTo(cx + s * 42, hy - 44, cx + s * 41, hy - 24)
        ctx.quadraticCurveTo(cx + s * 30, hy - 19, cx + s * 15, hy - 25)
        ctx.closePath(); ink(ctx, earCol, 3)
        ctx.fillStyle = earInCol; ctx.beginPath()
        ctx.moveTo(cx + s * 22, hy - 29); ctx.quadraticCurveTo(cx + s * 35, hy - 33, cx + s * 34, hy - 25)
        ctx.quadraticCurveTo(cx + s * 28, hy - 23, cx + s * 22, hy - 27); ctx.closePath(); ctx.fill()
      } else if (shp.ear === 'pointed') {   // pointed
        ctx.beginPath()
        ctx.moveTo(cx + s * 16, hy - 30)
        ctx.quadraticCurveTo(cx + s * 34, hy - 60, cx + s * 45, hy - 24)
        ctx.quadraticCurveTo(cx + s * 30, hy - 22, cx + s * 16, hy - 30)
        ctx.closePath(); ink(ctx, earCol, 3)
        ctx.fillStyle = earInCol
        ctx.beginPath()
        ctx.moveTo(cx + s * 22, hy - 30)
        ctx.quadraticCurveTo(cx + s * 33, hy - 48, cx + s * 39, hy - 27)
        ctx.quadraticCurveTo(cx + s * 30, hy - 26, cx + s * 22, hy - 30)
        ctx.closePath(); ctx.fill()
      }
      // 귀 자리를 "대체"하는 뿔(둥근 귀 base 없이 머리에서 자라남) — 사슴뿔/악마뿔
      if (shp.ear === 'antler') {   // 사슴뿔 — 머리에서 자라난 가지뿔
        const bx = cx + s * 24, by = hy - 30
        ctx.strokeStyle = '#a9793f'; ctx.fillStyle = '#c49a5c'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.lineWidth = 4.2
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + s * 6, by - 15, bx + s * 4, by - 30); ctx.stroke()   // 메인 빔
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(bx + s * 2, by - 8); ctx.lineTo(bx + s * 13, by - 12)
        ctx.moveTo(bx + s * 4, by - 18); ctx.lineTo(bx + s * 14, by - 22)
        ctx.moveTo(bx + s * 4, by - 27); ctx.lineTo(bx + s * 10, by - 34)
        ctx.stroke()
        ctx.beginPath(); ctx.arc(bx, by, 3.4, 0, Math.PI * 2); ctx.fill()   // 뿌리 혹(머리에 붙은 느낌)
      } else if (shp.ear === 'devil') {   // 악마뿔 — 바깥으로 휘어 올라가는 붉은 뿔
        const bx = cx + s * 24, by = hy - 30
        ctx.fillStyle = '#c0392b'; ctx.strokeStyle = '#7a231b'; ctx.lineWidth = 1.4; ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(bx - s * 7, by + 3)
        ctx.quadraticCurveTo(bx + s * 3, by - 18, bx + s * 12, by - 27)
        ctx.quadraticCurveTo(bx + s * 2, by - 12, bx + s * 5, by + 4)
        ctx.closePath(); ctx.fill(); ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(bx + s * 5, by - 12, 1.6, 5, s * 0.5, 0, Math.PI * 2); ctx.fill()   // 하이라이트
      }
      ctx.restore()
    }
    if (shp.ear === 'goblin') {   // 도깨비 뿔 — 귀 없이 이마 가운데 울퉁불퉁한 뿔 하나
      const bx = cx, by = hy - 46
      ctx.fillStyle = '#d9a441'; ctx.strokeStyle = '#8a5a1e'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(bx - 7, by + 14)
      ctx.quadraticCurveTo(bx - 6, by - 9, bx, by - 26)
      ctx.quadraticCurveTo(bx + 6, by - 9, bx + 7, by + 14)
      ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.strokeStyle = '#a06a24'; ctx.lineWidth = 1.1
      ctx.beginPath(); ctx.moveTo(bx - 4.5, by); ctx.lineTo(bx + 4.5, by - 1); ctx.moveTo(bx - 3.8, by - 11); ctx.lineTo(bx + 3.8, by - 12); ctx.stroke()   // 마디
    }

    // head base
    ctx.beginPath(); ctx.ellipse(cx, hy, 50, 44, 0, 0, Math.PI * 2)
    ink(ctx, volume(ctx, pal.body, cx, hy - 6, 54), 3)
    patternHead(ctx, pattern, pal, cx, hy)

    // gloss
    ctx.fillStyle = 'rgba(255,255,255,0.30)'
    ctx.beginPath(); ctx.ellipse(cx - 17, hy - 18, 13, 8, -0.5, 0, Math.PI * 2); ctx.fill()

    // muzzle (snout) — lighter rounded patch on the lower face; nose + mouth sit on it
    ctx.beginPath(); ctx.ellipse(cx, hy + 16, 24, 17, 0, 0, Math.PI * 2)
    ctx.fillStyle = volume(ctx, pal.muzzle || pal.belly, cx, hy + 11, 24); ctx.fill()
    ctx.strokeStyle = shade(pal.body, -0.14); ctx.lineWidth = 1.4; ctx.lineJoin = 'round'; ctx.stroke()

    // blush(볼터치) — 기본 곰엔 없음. 특정 스킨 디자인(BLUSH_SKINS)에서만 표시.
    if (BLUSH_SKINS.includes(shp.body)) {
      for (const s of [-1, 1]) {
        const bx = cx + s * 27, by = hy + 12
        const g = ctx.createRadialGradient(bx, by, 1, bx, by, 11)
        g.addColorStop(0, 'rgba(255,150,175,0.85)'); g.addColorStop(1, 'rgba(255,150,175,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(bx, by, 11, 7, 0, 0, Math.PI * 2); ctx.fill()
      }
    }

    // eyes — nudgeable; natural blink
    const blinking = state.blinkUntil && now < state.blinkUntil
    const asleep = !!state.away && !hit && !broken   // 자리비움 → 눈 감고 졸기
    const eyeY = hy - 2 + f.eyeDY
    for (const s of [-1, 1]) {
      const ex = cx + s * (15 + f.eyeDX)
      if (hit || broken) {
        // dizzy "X" eyes (hit reaction / KO)
        ctx.strokeStyle = LINE; ctx.lineWidth = 3; ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(ex - 5, eyeY - 5); ctx.lineTo(ex + 5, eyeY + 5)
        ctx.moveTo(ex + 5, eyeY - 5); ctx.lineTo(ex - 5, eyeY + 5)
        ctx.stroke()
      } else if (asleep) {
        // closed sleeping lids (gentle downward arc)
        ctx.strokeStyle = LINE; ctx.lineWidth = 2.6; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(ex, eyeY - 2, 6, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke()
      } else if (blinking) {
        ctx.strokeStyle = LINE; ctx.lineWidth = 3; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(ex, eyeY, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke()
      } else if (shp.eye === 'happy') {
        // ^-^ smiley closed eyes (upward curve)
        ctx.strokeStyle = LINE; ctx.lineWidth = 3; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(ex, eyeY - 2, 6.5, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke()
      } else if (shp.eye === 'round') {
        ctx.fillStyle = LINE; ctx.beginPath(); ctx.arc(ex, eyeY, 7.6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(ex - 2.6, eyeY - 3, 2.7, 0, Math.PI * 2); ctx.fill()
      } else if (shp.eye === 'fire') {   // 불타는 눈 — 눈을 감싸며 위로 타오름
        ctx.fillStyle = '#3a1a10'; ctx.beginPath(); ctx.arc(ex, eyeY + 1, 4.5, 0, Math.PI * 2); ctx.fill()
        FX.burn(ctx, ex, eyeY, 20, 24, now + (s > 0 ? 130 : 0), 'round')
      } else if (shp.eye === 'glow') {   // 빛나는 눈
        FX.glow(ctx, ex, eyeY, 9, now, 'rgba(120,220,255,0.9)')
        ctx.fillStyle = '#e6f8ff'; ctx.beginPath(); ctx.arc(ex, eyeY, 5.4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#5cc8ff'; ctx.beginPath(); ctx.arc(ex, eyeY, 2.8, 0, Math.PI * 2); ctx.fill()
      } else if (shp.eye === 'cry') {   // 우는 눈 ㅠㅠ — 찡그린 감은 눈 + 두 줄기 눈물 왈칵
        ctx.strokeStyle = LINE; ctx.lineWidth = 2.4; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(ex, eyeY - 1.5, 5, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke()   // ∪ 찡그린 눈
        FX.tear(ctx, ex - 2.6, eyeY + 5, now, (s > 0 ? 0.5 : 0))
        FX.tear(ctx, ex + 2.6, eyeY + 5, now, (s > 0 ? 0.5 : 0) + 0.45)
      } else if (shp.eye === 'brow') {   // 눈썹 짙은 눈
        ctx.fillStyle = LINE; ctx.beginPath(); ctx.arc(ex, eyeY, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ex - 2, eyeY - 2.4, 1.8, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = LINE; ctx.lineWidth = 3.6; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(ex - s * 7, eyeY - 12); ctx.lineTo(ex + s * 6.5, eyeY - 8.5); ctx.stroke()
      } else {
        ctx.fillStyle = LINE; ctx.beginPath(); ctx.ellipse(ex, eyeY, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(ex - 2, eyeY - 3, 2.1, 0, Math.PI * 2); ctx.fill()
        if (shp.eye === 'sparkle') { ctx.beginPath(); ctx.arc(ex + 2, eyeY + 2.6, 1.4, 0, Math.PI * 2); ctx.fill() }
      }
    }

    // worried eyebrows as damage rises (not while blinking/KO)
    if (dmg01 > 0.35 && !hit && !broken) {
      ctx.strokeStyle = LINE; ctx.lineWidth = 2.4; ctx.lineCap = 'round'
      for (const s of [-1, 1]) { const ex = cx + s * (15 + f.eyeDX); ctx.beginPath(); ctx.moveTo(ex - s * 7, eyeY - 12); ctx.lineTo(ex + s * 6, eyeY - 7); ctx.stroke() }
    }
    // nose — dark rounded bear nose (sits on the muzzle)
    ctx.fillStyle = pal.nose || '#453b34'
    ctx.beginPath(); ctx.ellipse(cx, hy + 9, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.30)'
    ctx.beginPath(); ctx.ellipse(cx - 2.4, hy + 7.4, 2.2, 1.4, -0.5, 0, Math.PI * 2); ctx.fill()

    // mouth (below the nose, on the muzzle)
    ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.lineCap = 'round'
    if (broken) {   // KO — open pained mouth
      ctx.fillStyle = '#7a3a44'; ctx.beginPath(); ctx.ellipse(cx, hy + 20, 4.5, 3.8, 0, 0, Math.PI * 2); ctx.fill(); ink(ctx, LINE, 1.6)
    } else if (active > 0.4) {   // slapping — open "!" mouth
      ctx.fillStyle = '#e07d95'; ctx.beginPath(); ctx.ellipse(cx, hy + 20, 4.5, 3 + active * 2, 0, 0, Math.PI * 2); ctx.fill(); ink(ctx, null, 1.6)
    } else if (dmg01 > 0.45) {   // frown
      ctx.beginPath(); ctx.arc(cx, hy + 24, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke()
    } else if (shp.mouth === 'oh') {
      ctx.fillStyle = '#7a3a44'; ctx.beginPath(); ctx.ellipse(cx, hy + 20, 3, 3.4, 0, 0, Math.PI * 2); ctx.fill(); ink(ctx, null, 1.6)
    } else if (shp.mouth === 'wide') {
      ctx.fillStyle = '#e07d95'; ctx.beginPath(); ctx.ellipse(cx, hy + 20, 6, 4.2, 0, 0, Math.PI * 2); ctx.fill(); ink(ctx, LINE, 1.6)
      ctx.fillStyle = '#ff9db0'; ctx.beginPath(); ctx.ellipse(cx, hy + 22, 3, 2, 0, 0, Math.PI * 2); ctx.fill()   // tongue
    } else if (shp.mouth === 'cat') {   // ω wide grin (philtrum + double curve)
      ctx.beginPath(); ctx.moveTo(cx, hy + 14); ctx.lineTo(cx, hy + 17); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx - 4, hy + 17, 4.2, 0.05 * Math.PI, 0.95 * Math.PI); ctx.arc(cx + 4, hy + 17, 4.2, 0.05 * Math.PI, 0.95 * Math.PI); ctx.stroke()
    } else if (shp.mouth === 'devil') {   // 악마입 — 씩 웃는 큰 입 + 송곳니
      ctx.beginPath(); ctx.moveTo(cx - 7, hy + 15.5); ctx.quadraticCurveTo(cx, hy + 24, cx + 7, hy + 15.5); ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#6a4a3a'; ctx.lineWidth = 0.8
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 3.6, hy + 18); ctx.lineTo(cx + s * 5.4, hy + 18.2); ctx.lineTo(cx + s * 4.3, hy + 22.4); ctx.closePath(); ctx.fill(); ctx.stroke() }
      ctx.strokeStyle = LINE; ctx.lineWidth = 2
    } else if (shp.mouth === 'mischief') {   // 장난꾸러기입 — 한쪽 올라간 씩 스마일
      ctx.beginPath(); ctx.moveTo(cx - 5.5, hy + 18.5); ctx.quadraticCurveTo(cx + 1, hy + 20.5, cx + 6.5, hy + 13.5); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx + 6.5, hy + 13.5, 0.9, 0, Math.PI * 2); ctx.stroke()   // 살짝 올라간 입꼬리 점
    } else {   // smile (default) — philtrum + gentle two-curve grin
      ctx.beginPath(); ctx.moveTo(cx, hy + 14); ctx.lineTo(cx, hy + 16.5); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx - 3.5, hy + 16.5, 3.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.arc(cx + 3.5, hy + 16.5, 3.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke()
    }

    if (!hit && !broken) drawHeadSkin(ctx, shp.body, cx, hy, pal, f)   // 판다 등 머리 테마(피격/KO 땐 생략)
    drawHat(ctx, state.hat, cx, hy - 36)
    if (hit || broken) drawDizzyStars(ctx, cx, hy - 52, now)
    if (dmg01 > 0.001) {   // HP bar over the head
      const bw = 46, bx = cx - bw / 2, byy = hy - 46
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(bx, byy, bw, 5)
      ctx.fillStyle = hpv > 30 ? '#7ecb7e' : '#d05555'; ctx.fillRect(bx, byy, bw * Math.max(0, hpv / 100), 5)
    }
    // electrocuted (⚡ 낙뢰 hit) — jittering arcs + blue flash around the cat
    if (state.shockUntil && now < state.shockUntil) {
      const sa = Math.max(0, Math.min(1, (state.shockUntil - now) / 650))
      ctx.save()
      ctx.globalAlpha = 0.16 * sa * (0.5 + 0.5 * Math.sin(now / 45))
      ctx.fillStyle = '#bfe4ff'; ctx.beginPath(); ctx.ellipse(cx, hy + 6, 60, 58, 0, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = `rgba(190,230,255,${0.9 * sa})`; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(150,210,255,0.9)'; ctx.shadowBlur = 8
      for (let k = 0; k < 5; k++) {
        const a0 = now / 40 + k * 1.7, r0 = 42 + Math.sin(now / 30 + k) * 6
        let px = cx + Math.cos(a0) * r0, py = (hy + 6) + Math.sin(a0) * (r0 * 0.72)
        ctx.beginPath(); ctx.moveTo(px, py)
        for (let j = 1; j <= 3; j++) { const a1 = a0 + j * 0.5, r1 = r0 - j * (6 + Math.sin(now / 20 + k + j) * 4); ctx.lineTo(cx + Math.cos(a1) * r1, (hy + 6) + Math.sin(a1) * (r1 * 0.72)) }
        ctx.stroke()
      }
      ctx.restore()
    }
    // 자리비움(away): 크게 보이도록 "💤 자리비움" 배지 + 크고 떠오르는 Z들
    if (state.away && !broken) {
      ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'center'
      // 떠오르는 큰 Z (더 크고 선명하게)
      for (let k = 0; k < 3; k++) {
        const ph = ((now / 950) + k / 3) % 1
        ctx.globalAlpha = Math.max(0, 1 - ph) * 0.95
        ctx.font = `bold ${22 + k * 9}px "Segoe UI", "Malgun Gothic", sans-serif`
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(20,30,50,.7)'; ctx.fillStyle = '#a9cbff'
        ctx.strokeText('Z', cx + 36 + ph * 26, hy - 44 - ph * 46); ctx.fillText('Z', cx + 36 + ph * 26, hy - 44 - ph * 46)
      }
      // 부재중 배지(머리 위 필 형태)
      const by = hy - 78, bw = 116, bh = 30, bx = cx
      ctx.globalAlpha = 0.5 + 0.15 * Math.sin(now / 500)
      ctx.fillStyle = 'rgba(28,38,58,0.92)'; ctx.strokeStyle = 'rgba(150,190,255,0.8)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, bh / 2); ctx.fill(); ctx.stroke()
      ctx.globalAlpha = 1; ctx.fillStyle = '#dbe8ff'; ctx.font = 'bold 15px "Segoe UI", "Malgun Gothic", sans-serif'
      ctx.fillText('💤 자리비움', bx, by)
      ctx.restore()
    }
    ctx.restore()

    // bottom bar (책상 — selectable desk style). 배틀 기지에선 이 바가 "지면 위 받침"이 되고, 그 위에 HP 게이지가 올라감.
    const dsk = deskStyle(state)
    const barGrad = ctx.createLinearGradient(0, deskY, 0, deskY + BAR_VIS)
    barGrad.addColorStop(0, dsk.top); barGrad.addColorStop(1, dsk.bot)
    // 채움 높이를 몸통 바닥(≈deskY+64)까지 확장 → 하단바(DOM 카운터) 숨겨도 몸통이 아래로 삐져나오지 않음
    ctx.fillStyle = barGrad; ctx.fillRect(0, deskY, CELL_W, BAR_VIS + 14)
    ctx.fillStyle = dsk.hi; ctx.fillRect(0, deskY, CELL_W, 3)
    ctx.fillStyle = dsk.lo; ctx.fillRect(0, deskY + 3, CELL_W, 2)
    if (dsk.theme && !state.hideDeskItems) deskTheme(ctx, dsk.theme, deskY, CELL_W, now)   // 테마(나이테/불/얼음) — 배틀 기지에선 생략

    // mouseX는 발(paws)에서도 참조 → 항상 선언. 배틀 기지(hideDeskItems)에선 키보드·마우스·파손 "그리기"만 생략(그 자리에 체력 게이지).
    const mouseX = cx + 74, mj = pM * 2
    if (!state.hideDeskItems) {
    // keyboard (slightly larger) — selectable style
    const kbs = kbStyle(state)
    const kbX = cx - 52, kbW = 104, kbY = deskY + 4, kbH = 20
    rr(ctx, kbX, kbY, kbW, kbH, 5); ink(ctx, kbs.case, 2)
    ctx.fillStyle = kbs.key
    const cols = 8, rows = 3, pad = 5, gap = 2.2
    const kw = (kbW - pad * 2 - gap * (cols - 1)) / cols
    const kh = (kbH - pad * 2 - gap * (rows - 1)) / rows
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { rr(ctx, kbX + pad + k * (kw + gap), kbY + pad + r * (kh + gap), kw, kh, 1.6); ctx.fill() }
    if (kbs.theme) kbTheme(ctx, kbs.theme, kbX, kbY, kbW, kbH, now)   // 불/아우라/덩굴 테마

    // mouse — 곰이 쓰는 방향(버튼이 곰 반대편=아래쪽) + 좌/우 버튼 대비 구분선
    const ms = mouseStyle(state)
    const mox = mouseX + mj, mline = ms.line || ms.seam
    ctx.beginPath(); ctx.ellipse(mox, deskY + 26, 10, 14, 0, 0, Math.PI * 2); ink(ctx, ms.body, 2)
    ctx.strokeStyle = mline; ctx.lineWidth = 1.3; ctx.lineCap = 'round'
    const bTop = deskY + 30   // 버튼 영역 상단(아래쪽)
    ctx.beginPath(); ctx.moveTo(mox - 8.4, bTop); ctx.quadraticCurveTo(mox, bTop + 2, mox + 8.4, bTop); ctx.stroke()   // 버튼–손바닥 경계
    ctx.beginPath(); ctx.moveTo(mox, bTop + 1.5); ctx.lineTo(mox, deskY + 39); ctx.stroke()   // 좌/우 버튼 분리선
    ctx.fillStyle = mline; ctx.beginPath(); ctx.roundRect(mox - 1.1, bTop + 2.5, 2.2, 3.4, 1.1); ctx.fill()   // 스크롤 휠
    if (ms.theme) mouseTheme(ctx, ms.theme, mox, deskY, now)   // 불/쥐모양/덩굴 테마

    // desk / keyboard / mouse DESTRUCTION — gouges, branching cracks, scorch, popped keys (5 stages)
    if (dmg01 > 0.05) {
      const rnd = (i) => { const x = Math.sin(i * 91.7) * 43758.5453; return x - Math.floor(x) }
      const stage = Math.min(5, Math.ceil(dmg01 * 5))
      ctx.save()
      ctx.beginPath(); ctx.rect(0, deskY, CELL_W, BAR_VIS + 4); ctx.clip()   // keep the wreckage on the desk

      // 1) chunks gouged out of the desk surface — dark jagged pits with a chipped rim + depth shadow
      const nHoles = Math.round(dmg01 * 7)
      for (let i = 0; i < nHoles; i++) {
        const hx = rnd(i * 2 + 1) * CELL_W, hy = deskY + 8 + rnd(i * 2 + 5) * (BAR_VIS - 14), rad = (3 + rnd(i + 9) * 6) * (0.6 + dmg01)
        const pts = 6 + Math.floor(rnd(i) * 3)
        ctx.beginPath()
        for (let p = 0; p < pts; p++) { const a = (p / pts) * Math.PI * 2, rr2 = rad * (0.55 + rnd(i * 7 + p) * 0.75), px = hx + Math.cos(a) * rr2, py = hy + Math.sin(a) * rr2 * 0.82; p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py) }
        ctx.closePath()
        ctx.fillStyle = 'rgba(20,14,11,0.92)'; ctx.fill()
        ctx.strokeStyle = 'rgba(255,238,205,0.28)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(hx, hy + rad * 0.25, rad * 0.55, rad * 0.38, 0, 0, Math.PI * 2); ctx.fill()
      }

      // 2) branching cracks — dark fracture core with a bright split highlight
      const nc = Math.round(dmg01 * 8)
      for (let i = 0; i < nc; i++) {
        const x0 = rnd(i) * CELL_W, y0 = deskY + 3 + rnd(i + 7) * (BAR_VIS - 6)
        const drawCrack = (lw, col) => {
          let x = x0, y = y0; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y)
          for (let g = 0; g < 4; g++) { x += (rnd(i * 3 + g) - 0.5) * 26; y += (rnd(i + g) - 0.3) * 9; ctx.lineTo(x, y) }
          ctx.stroke()
          const bx = x0 + (rnd(i + 2) - 0.5) * 14, by = y0 + rnd(i + 4) * 8
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + (rnd(i + 3) - 0.5) * 22, by + rnd(i + 6) * 11); ctx.stroke()
        }
        drawCrack(2.2, `rgba(10,6,4,${0.4 + dmg01 * 0.5})`)
        drawCrack(0.8, `rgba(255,236,202,${0.14 + dmg01 * 0.24})`)
      }

      // 3) scorch smudges at heavy damage
      if (stage >= 4) {
        for (let i = 0; i < stage; i++) {
          const sx = rnd(i + 20) * CELL_W, sy = deskY + 8 + rnd(i + 25) * (BAR_VIS - 12), sr = 8 + rnd(i + 30) * 10
          const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, sr)
          g.addColorStop(0, 'rgba(14,9,9,0.55)'); g.addColorStop(1, 'rgba(14,9,9,0)')
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill()
        }
      }

      // 4) keyboard: dark broken keys, then popped-off keys scattered, then a fracture across it
      const nk = Math.round(dmg01 * 9)
      for (let i = 0; i < nk; i++) {
        const k = Math.floor(rnd(i + 3) * 8), r = Math.floor(rnd(i + 11) * 3)
        ctx.fillStyle = 'rgba(12,10,16,0.9)'; rr(ctx, kbX + pad + k * (kw + gap), kbY + pad + r * (kh + gap), kw, kh, 1.6); ctx.fill()
        ctx.strokeStyle = 'rgba(90,95,110,0.5)'; ctx.lineWidth = 0.6; ctx.stroke()
      }
      if (stage >= 3) {
        ctx.fillStyle = '#5a5f6d'
        for (let i = 0; i < stage - 2; i++) {
          const px = kbX + rnd(i + 40) * kbW, py = deskY + 30 + rnd(i + 44) * 16
          ctx.save(); ctx.translate(px, py); ctx.rotate((rnd(i + 46) - 0.5) * 2)
          rr(ctx, -kw / 2, -kh / 2, kw, kh, 1.6); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 0.6; ctx.stroke(); ctx.restore()
        }
      }
      if (stage >= 4) {
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(kbX + 4, kbY + kbH * 0.3); ctx.lineTo(kbX + kbW * 0.4, kbY + kbH * 0.72); ctx.lineTo(kbX + kbW * 0.7, kbY + kbH * 0.22); ctx.lineTo(kbX + kbW - 4, kbY + kbH * 0.6); ctx.stroke()
      }

      // 5) mouse: crack, then a shattered chunk missing
      if (dmg01 > 0.4) {
        ctx.strokeStyle = 'rgba(30,30,38,0.85)'; ctx.lineWidth = 1; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(mouseX + mj - 5, deskY + 19); ctx.lineTo(mouseX + mj + 2, deskY + 26); ctx.lineTo(mouseX + mj - 2, deskY + 32); ctx.stroke()
      }
      if (stage >= 5) {
        ctx.fillStyle = 'rgba(15,12,18,0.92)'; ctx.beginPath(); ctx.moveTo(mouseX + mj + 2, deskY + 20); ctx.lineTo(mouseX + mj + 9, deskY + 24); ctx.lineTo(mouseX + mj + 4, deskY + 31); ctx.closePath(); ctx.fill()
      }
      ctx.restore()
    }
    }   // /hideDeskItems (배틀 기지: 키보드·마우스·파손 숨김)

    // paws
    const restUp = deskY - 10, kbHit = deskY + 10, mouseHit = deskY + 17
    function pawPad(px, py, pressed) {
      ctx.fillStyle = 'rgba(40,30,25,0.10)'; ctx.beginPath(); ctx.ellipse(px, deskY + 30, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill()   // contact shadow
      drawPaw(ctx, shp.hand, px, py, 11, pal, now)
      if (pressed) { ctx.strokeStyle = 'rgba(120,120,140,0.4)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(px, py + 4, 13, 0, Math.PI * 2); ctx.stroke() }
    }
    pawPad(cx - 22, restUp + (kbHit - restUp) * pL, pL > 0.8)
    if (pM > pR) {
      const px = cx + 22 + (mouseX - (cx + 22)) * Math.min(1, pM * 1.4)
      pawPad(px, restUp + (mouseHit - restUp) * pM, pM > 0.8)
    } else {
      pawPad(cx + 22, restUp + (kbHit - restUp) * pR, pR > 0.8)
    }

    // nameplate — a small dark plate on the front strip of the desk (readable, off the keyboard)
    if (state.name && !state.hideDeskItems) {   // 배틀 기지에선 체력 게이지와 겹치므로 이름표 숨김
      ctx.font = '700 17px "Segoe UI", "Malgun Gothic", sans-serif'
      const tw = ctx.measureText(state.name).width
      const ph = 22, pw = Math.min(168, Math.max(44, tw + 22))
      const nx = cx - pw / 2, ny = deskY + BAR_VIS - ph - 1
      rr(ctx, nx, ny, pw, ph, 9)
      ctx.fillStyle = 'rgba(38,30,26,0.92)'; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffe9c7'; ctx.fillText(state.name, cx, ny + ph / 2 + 0.5)
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
    }

    ctx.restore()

    if (state.bubbleText && now < state.bubbleUntil) {
      drawBubble(ctx, state.bubbleText, cx, BUBBLE_H + hy - 46, now, state.bubbleUntil, state._bubbleClamp)
    }
  }

  window.AnimalArt = { draw, anchors, CELL_W, CELL_H, BUBBLE_H, DESK_Y, SLAP_MS, SKINS, HATS, PATTERNS, DEFAULT_FEAT, EAR_SHAPES, EYE_SHAPES, MOUTH_SHAPES, TAIL_SHAPES, HAND_SHAPES, BODY_SKINS, SKIN_PRESETS, DEFAULT_SHAPE, drawHand, FX, DESK_STYLES, DESK_ORDER, KB_STYLES, KB_ORDER, MOUSE_STYLES, MOUSE_ORDER }
})()
