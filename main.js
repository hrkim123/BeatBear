const { app, BrowserWindow, ipcMain, globalShortcut, screen, Notification, dialog, powerMonitor } = require('electron')
const path = require('path')

let updater = null   // electron-updater instance (set in initAutoUpdate), for restart-to-apply

// Transparent windows on Windows can render a white bar/flash via GPU compositing —
// disabling GPU compositing is a common fix. (Light overlay, negligible perf cost.)
app.disableHardwareAcceleration()

// 투명·클릭통과 오버레이가 "잠깐 사라졌다 다시 나타나는" 깜빡임의 근본 원인:
// Chromium이 다른 창이 잠깐 겹치면 창을 '가려짐(occluded)'으로 오판해 컴포지팅(렌더)을 멈췄다가
// 다시 그린다(창의 isVisible()은 계속 true인데 화면만 blank→repaint). 이 기능을 꺼서 항상 그리게 한다.
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

// 개발 빌드(소스에서 실행 = unpackaged)는 설치된 배포 앱과 저장소·단일인스턴스 락이 겹치지 않도록
// 별도 userData 폴더를 사용한다. → dev로 켜도 배포 앱의 실제 데이터(가챠·덱·설정 등)를 건드리지 않고,
// 둘을 번갈아/동시에 켜도 초기화·충돌이 없다. (배포 설치본은 그대로 'beatbear' 사용)
if (!app.isPackaged) {
  try { app.setPath('userData', app.getPath('userData') + '-dev') } catch (e) {}
}

let uIOhook = null
let UiohookKey = {}
try {
  ({ uIOhook, UiohookKey } = require('uiohook-napi'))
} catch (err) {
  console.error('[beatbear] uiohook-napi load failed — global input hook disabled:', err.message)
}

// Auto-update (electron-updater + GitHub Releases). Only meaningful in a PACKAGED build;
// require is guarded so the app still runs in dev / before `npm install`.
function initAutoUpdate() {
  if (!app.isPackaged) return
  let autoUpdater
  try { ({ autoUpdater } = require('electron-updater')) } catch (e) {
    console.error('[beatbear] electron-updater not installed — auto-update disabled:', e.message); return
  }
  updater = autoUpdater
  // ASK-FIRST flow: never download or install silently, and NEVER install on quit. On launch
  // (and periodic re-checks) we detect a new version, ask the user with a popup, and only then
  // download → install → relaunch.
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  // 차등(differential) 다운로드 비활성 — 블록맵 재조립본이 sha512 검증에 실패해 "업데이트 눌러도 조용히 안 됨"이
  // 되던 문제 방지. 항상 전체 파일을 받아 무결성 일치. (unsigned 빌드에서 특히 자주 깨짐)
  autoUpdater.disableDifferentialDownload = true
  let promptedVersion = null   // ask at most once per version per session
  let downloading = false
  let manualCheck = false      // true while a user-initiated "업데이트 확인" is in flight
  autoUpdater.on('error', (e) => {
    const wasDownloading = downloading
    downloading = false
    console.error('[beatbear] update error:', e && e.message)
    // 다운로드 도중 에러(무결성/네트워크)면 사용자에게 반드시 안내 — 예전엔 자동체크라 조용히 실패해서
    // "업데이트 눌렀는데 안 됨"으로 보였다. 수동 체크든 다운로드 중이든 실패는 팝업으로 알린다.
    if (manualCheck || wasDownloading) {
      manualCheck = false
      dialog.showMessageBox({ type: 'error', buttons: ['확인'], noLink: true, title: 'BeatBear 업데이트', message: wasDownloading ? '업데이트 다운로드에 실패했습니다.' : '업데이트 확인에 실패했습니다.', detail: ((e && e.message) || '네트워크 상태를 확인해 주세요.') + '\n\n계속 실패하면 GitHub 릴리스에서 최신 설치본을 직접 받아 실행해 주세요.' }).catch(() => {})
    }
  })
  autoUpdater.on('update-available', (info) => { const wasManual = manualCheck; manualCheck = false; promptUpdate(info && info.version, wasManual) })
  autoUpdater.on('update-not-available', () => {
    if (manualCheck) {
      manualCheck = false
      dialog.showMessageBox({ type: 'info', buttons: ['확인'], noLink: true, title: 'BeatBear 업데이트', message: '최신 버전입니다.', detail: `현재 v${app.getVersion()}을(를) 사용 중입니다.` }).catch(() => {})
    }
  })
  autoUpdater.on('update-downloaded', () => {
    // user already consented → apply now (silent install + relaunch)
    setImmediate(() => { try { autoUpdater.quitAndInstall(true, true) } catch (e) {} })
  })

  // Ask the user whether to update; on "예" download it (update-downloaded then relaunches).
  function promptUpdate(version, force) {
    const v = version ? `v${version}` : '새 버전'
    if (downloading) return
    if (!force && promptedVersion === version) return   // auto-checks dedupe; a MANUAL "업데이트 확인" always re-prompts
    promptedVersion = version
    dialog.showMessageBox({
      type: 'info',
      buttons: ['업데이트', '나중에'],
      defaultId: 0, cancelId: 1, noLink: true,
      title: 'BeatBear 업데이트',
      message: `${v}이(가) 있습니다.`,
      detail: '지금 업데이트를 받고 재시작할까요?'
    }).then((r) => {
      if (r.response === 0) { downloading = true; try { autoUpdater.downloadUpdate() } catch (e) { downloading = false } }
    }).catch(() => {})
  }
  updater.promptUpdate = promptUpdate
  // Manual "업데이트 확인" from settings: check now; update-available → ask-first prompt,
  // update-not-available → "최신 버전입니다" popup, error → failure popup.
  updater.checkManual = function () {
    if (downloading) { dialog.showMessageBox({ type: 'info', buttons: ['확인'], noLink: true, title: 'BeatBear 업데이트', message: '업데이트를 이미 받는 중입니다.' }).catch(() => {}); return }
    manualCheck = true
    Promise.resolve(autoUpdater.checkForUpdates()).then((r) => {
      // fallback: if a cached result meant no event fired, still give feedback from the promise
      if (!manualCheck) return
      manualCheck = false
      const info = r && r.updateInfo, v = info && info.version
      if (v && v !== app.getVersion()) promptUpdate(v, true)
      else dialog.showMessageBox({ type: 'info', buttons: ['확인'], noLink: true, title: 'BeatBear 업데이트', message: '최신 버전입니다.', detail: `현재 v${app.getVersion()}을(를) 사용 중입니다.` }).catch(() => {})
    }).catch((e) => {
      if (!manualCheck) return
      manualCheck = false
      dialog.showMessageBox({ type: 'error', buttons: ['확인'], noLink: true, title: 'BeatBear 업데이트', message: '업데이트 확인에 실패했습니다.', detail: (e && e.message) || '네트워크 상태를 확인해 주세요.' }).catch(() => {})
    })
  }

  try { autoUpdater.checkForUpdates() } catch (e) { console.error('[beatbear] update check failed:', e.message) }
  // re-check while the app stays open (long sessions) — still ask-first, once per version
  setInterval(() => { try { autoUpdater.checkForUpdates() } catch (e) {} }, 30 * 60 * 1000)
}

let win = null          // transparent overlay
let settingsWin = null  // normal settings window
let winOrigin = { x: 0, y: 0 } // top-left of the (multi-monitor) overlay in screen coords
let chatting = false          // while true, the overlay is allowed to stay focused (for typing)
let humanActive = false       // true while the WASD-controllable human weapon is summoned
let gatlingActive = false     // true while a gatling turret is deployed (needs the Q fire key forwarded)
let antMechaActive = false    // true while 10 ants are ready to merge OR the ant mecha is active (WASD/Q/E)

// user-configurable slot hotkeys (from the settings window). mod = 'alt' | 'ctrlalt' | 'ctrlshift';
// keys are names (Z/X/C, 1/2/3, F6…) mapped to uiohook physical keycodes.
let slotMod = 'alt'
let slotModKey = null         // 'custom' 일 때 조합키로 쓸 uiohook 키코드(사용자 지정 임의 키)
let slotKeyMap = {}           // uiohook keycode -> slot number (1/2/3)
function buildSlotKeys(keys) {
  const m = {}
  ;(keys || []).forEach((name, i) => { const code = UiohookKey[name]; if (code != null) m[code] = i + 1 })
  return m
}
function slotModMatches(ctrl, alt, shift, caps) {
  if (slotMod === 'none') return true   // 조합키 없이 슬롯 키만으로 발동
  if (slotMod === 'ctrlalt') return ctrl && alt
  if (slotMod === 'ctrlshift') return ctrl && shift
  if (slotMod === 'caps') return caps   // hold CapsLock
  return alt && !ctrl   // 'alt' (not AltGr)
}
function applyKeybinds(kb) {
  if (kb && typeof kb.mod === 'string') {
    if (['alt', 'ctrlalt', 'ctrlshift', 'caps', 'none'].includes(kb.mod)) { slotMod = kb.mod; slotModKey = null }
    else if (UiohookKey[kb.mod] != null) { slotMod = 'custom'; slotModKey = UiohookKey[kb.mod] }   // 사용자 지정 임의 키(예: Space, F13, Alt…)
  }
  if (kb && Array.isArray(kb.keys) && kb.keys.length) slotKeyMap = buildSlotKeys(kb.keys)
}

// Only ever allow ONE overlay — prevents stale/ghost windows from stacking up
// (repeated launches otherwise leave leftover windows that look like a stray bar).
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win && !win.isDestroyed()) { win.show(); win.focus() }
  })
}

// Windows clamps a single transparent window to ONE monitor, so the overlay covers one
// display at a time. `curDisp` is which. Ctrl+Shift+. (or the settings button) cycles it.
let curDisp = 0

function activeDisplay() {
  const all = screen.getAllDisplays()
  return all[Math.min(curDisp, all.length - 1)] || screen.getPrimaryDisplay()
}

// 창을 모니터보다 WIN_PAD(px)만큼 크게(오른쪽·아래로 화면 밖 오버행). 창 rect가 모니터 rect와
// 정확히 일치하면 Windows가 '보더리스 전체화면 최적화(독점 전체화면 유사)'로 오인해, 포커스 시 컴포지팅
// 모드를 전환하며 blank flash(깜빡임)가 난다. 1px 키워 exact-fullscreen 판정을 피한다. 원점(x,y)은
// 그대로라 winOrigin·hotzone 좌표 계산은 불변, 오버행은 화면 밖이라 보이지 않는다.
const WIN_PAD = 1
function overlayBounds(b) { return { x: b.x, y: b.y, width: b.width + WIN_PAD, height: b.height + WIN_PAD } }
function createWindow() {
  const displays = screen.getAllDisplays()
  curDisp = displays.findIndex((d) => d.id === screen.getPrimaryDisplay().id)
  if (curDisp < 0) curDisp = 0
  const b = activeDisplay().bounds
  winOrigin = { x: b.x, y: b.y }
  win = new BrowserWindow({
    x: b.x, y: b.y, width: b.width + WIN_PAD, height: b.height + WIN_PAD,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,    // 오버레이는 절대 활성화(foreground)되지 않음(WS_EX_NOACTIVATE). 클릭은 그대로 받되
                         // 포커스를 훔치지 않아 focus/blur 시 전체화면 투명 레이어드 창의 재-blend 깜빡임이 사라진다.
                         // 채팅 입력 시에만 setFocusable(true)로 잠시 허용(openChatFocus) 후 복귀(chat-close).
    resizable: true,     // must be resizable or Windows clamps us to the work area (can't
    movable: false,      // cover the taskbar). frame:false means no user-facing resize grips.
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false   // 오버레이는 항상 비포커스(클릭통과)라, 블러 시 렌더/타이머 스로틀로 애니메이션이 멈추거나 끊기는 것 방지
    }
  })
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  win.setTitle('')
  win.once('ready-to-show', () => {
    win.showInactive() // show WITHOUT activating (no caption bar)
    // Windows clamps the initial size to the work area; re-assert full monitor bounds so the
    // overlay actually covers the taskbar (needed for ants/cracks/missiles down there).
    const fb = activeDisplay().bounds
    win.setBounds(overlayBounds(fb))
  })
  win.setAlwaysOnTop(true, 'screen-saver')
  win.setIgnoreMouseEvents(true, { forward: true }) // click-through; forward mousemove for hover
  stripWin11Chrome(win)
  win.webContents.on('did-finish-load', sendLayout)
  win.on('closed', () => { win = null })
}

// Move the overlay to the next monitor (cycles). Repositions the window, recenters the
// cat, and updates all the coordinate math.
function moveToNextDisplay() {
  if (!win || win.isDestroyed()) return
  const all = screen.getAllDisplays()
  if (all.length < 2) return
  curDisp = (curDisp + 1) % all.length
  const b = all[curDisp].bounds
  winOrigin = { x: b.x, y: b.y }
  win.setBounds(overlayBounds(b))
  stripWin11Chrome(win) // re-assert no-border after the move, just in case
  hotzone = defaultHotzone()
  sendLayout()
}

// Tell the renderer where the current monitor's work area is (relative to the overlay
// origin) so the cat widget starts bottom-center of that screen.
function sendLayout() {
  if (!win || win.isDestroyed()) return
  const wa = activeDisplay().workArea
  win.webContents.send('layout', {
    primary: { x: wa.x - winOrigin.x, y: wa.y - winOrigin.y, w: wa.width, h: wa.height }
  })
}

// Windows 11 draws a 1–2px accent BORDER around the active window (a light bar most
// visible at the top when focused) and rounds the corners. Electron exposes no option
// for these, so set the DWM attributes directly: DWMWA_BORDER_COLOR = NONE and
// DWMWA_WINDOW_CORNER_PREFERENCE = DONOTROUND.
function stripWin11Chrome(bw) {
  if (process.platform !== 'win32') return
  let hwnd
  try {
    const buf = bw.getNativeWindowHandle()
    hwnd = (buf.length >= 8 ? buf.readBigUInt64LE(0) : BigInt(buf.readUInt32LE(0))).toString()
  } catch (e) { console.error('[beatbear] hwnd read failed:', e.message); return }
  const ps = [
    'Add-Type -Namespace D -Name W -MemberDefinition \'[DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(System.IntPtr h,int a,ref int v,int s);\'',
    `$h=[System.IntPtr]::new([long]${hwnd})`,
    '$ncoff=1; [D.W]::DwmSetWindowAttribute($h,2,[ref]$ncoff,4)',   // DWMWA_NCRENDERING_POLICY = DISABLED (no caption/frame ever)
    '$none=-2; [D.W]::DwmSetWindowAttribute($h,34,[ref]$none,4)',   // DWMWA_BORDER_COLOR = NONE
    '$dnr=1;  [D.W]::DwmSetWindowAttribute($h,33,[ref]$dnr,4)'      // corners: DO NOT ROUND
  ].join('; ')
  require('child_process').execFile(
    'powershell', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { windowsHide: true },
    (err) => { if (err) console.error('[beatbear] DWM strip failed:', err.message) }
  )
}

// hamburger toggles: open if closed, close if open
function toggleSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.close(); return }
  openSettings()
}

function openSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.show(); settingsWin.moveTop(); settingsWin.focus(); return
  }
  settingsWin = new BrowserWindow({
    width: 460,
    height: 600,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,   // the overlay is screen-saver-level topmost; the settings window
    show: false,         // must sit ABOVE it or it opens hidden behind (the "two clicks" bug)
    title: 'BeatBear 설정',
    backgroundColor: '#1a1a24',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  settingsWin.setMenuBarVisibility(false)
  // Put the settings window in the SAME top band as the overlay (screen-saver) so it sits
  // ABOVE the transparent overlay and can't drop behind it (which read as "disappearing"
  // when you clicked away and back). Safe now that disableHardwareAcceleration fixed the
  // border/white-bar repaint. Re-assert top on focus so clicking it always keeps it up.
  settingsWin.setAlwaysOnTop(true, 'screen-saver')
  settingsWin.loadFile(path.join(__dirname, 'renderer', 'settings.html'))
  settingsWin.once('ready-to-show', () => { settingsWin.show(); settingsWin.moveTop(); settingsWin.focus() })
  settingsWin.on('focus', () => { if (settingsWin && !settingsWin.isDestroyed()) settingsWin.moveTop() })
  settingsWin.on('closed', () => { settingsWin = null; reassertOverlay() })
}

function sendInput(kind) {
  if (win && !win.isDestroyed()) win.webContents.send('input', kind)
}

// 바탕화면 모드: 최상단 대신 "가장 뒤"로 — 다른 창들이 위에 오고, 창을 다 내리면 바탕화면에서만 보인다.
let desktopMode = false
// 창을 z-order 맨 뒤(HWND_BOTTOM)로. 네이티브 모듈 없이 stripWin11Chrome과 동일한 HWND+PowerShell(user32) 기법.
function pushToBottom() {
  if (process.platform !== 'win32' || !win || win.isDestroyed()) return
  let hwnd
  try { const buf = win.getNativeWindowHandle(); hwnd = (buf.length >= 8 ? buf.readBigUInt64LE(0) : BigInt(buf.readUInt32LE(0))).toString() } catch (e) { return }
  const ps = [
    'Add-Type -Namespace D -Name Z -MemberDefinition \'[DllImport("user32.dll")] public static extern bool SetWindowPos(System.IntPtr h,System.IntPtr a,int x,int y,int cx,int cy,uint f);\'',
    `$h=[System.IntPtr]::new([long]${hwnd})`,
    '$b=[System.IntPtr]::new(1)',                 // HWND_BOTTOM
    '[D.Z]::SetWindowPos($h,$b,0,0,0,0,0x13)'     // SWP_NOMOVE|SWP_NOSIZE|SWP_NOACTIVATE
  ].join('; ')
  require('child_process').execFile('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { windowsHide: true }, () => {})
}
// 창을 z-order 최상단(HWND_TOPMOST)으로 명시 재삽입. focusable:false(non-activating) 상태에선
// setAlwaysOnTop만으론 작업표시줄(자체 topmost) 위로 안 올라가, 땅 파임 영역이 작업표시줄에 가려진다.
// SWP_NOACTIVATE로 포커스는 안 뺏으면서 topmost 밴드 맨 위로 재삽입 → 작업표시줄 위로 복귀.
function pushToTop() {
  if (process.platform !== 'win32' || !win || win.isDestroyed()) return
  let hwnd
  try { const buf = win.getNativeWindowHandle(); hwnd = (buf.length >= 8 ? buf.readBigUInt64LE(0) : BigInt(buf.readUInt32LE(0))).toString() } catch (e) { return }
  const ps = [
    'Add-Type -Namespace D -Name Z -MemberDefinition \'[DllImport("user32.dll")] public static extern bool SetWindowPos(System.IntPtr h,System.IntPtr a,int x,int y,int cx,int cy,uint f);\'',
    `$h=[System.IntPtr]::new([long]${hwnd})`,
    '$b=[System.IntPtr]::new(-1)',                // HWND_TOPMOST
    '[D.Z]::SetWindowPos($h,$b,0,0,0,0,0x13)'     // SWP_NOMOVE|SWP_NOSIZE|SWP_NOACTIVATE
  ].join('; ')
  require('child_process').execFile('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { windowsHide: true }, () => {})
}
// 창 레이어 적용: 바탕화면 모드=맨 뒤(topmost 해제), 아니면=스크린세이버급 최상단 + 작업표시줄 위 강제.
// 단, 바탕화면 모드라도 모달(햄버거 메뉴·채팅·배틀팝업 등 forceInteractive)이 열려 있으면 최상단으로 올림 → 메뉴가 다른 창 뒤로 안 밀림.
function applyLayer() {
  if (!win || win.isDestroyed()) return
  if (desktopMode && !forceInteractive) { win.setAlwaysOnTop(false); pushToBottom() }
  else { win.setAlwaysOnTop(true, 'screen-saver'); pushToTop() }
}
// Re-assert the overlay's chrome-free state. Windows re-draws the accent border on the
// topmost window when ANOTHER window (settings/chat) closes, so call this on those events.
function reassertOverlay() {
  if (!win || win.isDestroyed()) return
  applyLayer()   // 바탕화면 모드면 최상단 대신 맨 뒤 유지
  win.setIgnoreMouseEvents(!interactive, { forward: true })
  stripWin11Chrome(win) // DWMWA_BORDER_COLOR = NONE again
}

// 세션/디스플레이 변화(원격 데스크톱 연결·종료, 잠금 해제, 모니터 구성 변경) 후 오버레이 복구.
// 이때 디스플레이 bounds가 바뀌면 winOrigin/창 좌표가 어긋나 커서→hotzone 매핑이 깨져
// 클릭이 통과(버튼 먹통)한다. 여기서 창 bounds·winOrigin을 현재 디스플레이로 다시 맞추고
// 오버레이 상태와 전역 입력 훅을 재부착한다.
let recoverScheduled = false, recoverFull = false
// full=true(절전복귀·잠금해제·모니터 추가/제거) → 무조건 복구+훅 재부착.
// full=false(display-metrics-changed) → 창 bounds가 실제로 바뀐 경우에만 복구.
//   ↳ 다른 앱 전체화면·작업표시줄 자동숨김 등으로 work-area만 바뀌면 bounds는 그대로라 아무것도 안 함(깜빡임 방지).
function recoverOverlay(full) {
  if (!win || win.isDestroyed()) return
  let boundsChanged = false
  try {
    const b = activeDisplay().bounds
    winOrigin = { x: b.x, y: b.y }
    const tb = overlayBounds(b), cur = win.getBounds()
    if (cur.x !== tb.x || cur.y !== tb.y || cur.width !== tb.width || cur.height !== tb.height) {
      win.setBounds(tb); boundsChanged = true
    }
  } catch (e) { console.error('[beatbear] recover bounds failed:', e && e.message); boundsChanged = true }
  if (full || boundsChanged || !win.isVisible()) {   // 실제 변화/숨김일 때만 다시 그림 → 불필요한 깜빡임 제거
    reassertOverlay()
    try { win.showInactive() } catch {}
    if (desktopMode) pushToBottom()   // showInactive 후 다시 맨 뒤로(바탕화면 모드 유지)
  }
  if (full || boundsChanged) {   // 전역 입력 훅 재부착은 실제 복구 상황에서만(세션 전환 후 훅이 떨어질 수 있음)
    if (uIOhook) { try { uIOhook.stop() } catch {} ; try { uIOhook.start() } catch (e) { console.error('[beatbear] rehook failed:', e && e.message) } }
  }
}
function scheduleRecover(full) {   // 디스플레이 이벤트가 연달아 오므로 살짝 디바운스
  if (full) recoverFull = true
  if (recoverScheduled) return
  recoverScheduled = true
  setTimeout(() => { recoverScheduled = false; const f = recoverFull; recoverFull = false; recoverOverlay(f) }, 600)
}

function openChatFocus() {
  if (!win || win.isDestroyed()) return
  chatting = true          // allow the overlay to stay focused while typing
  interactive = true
  win.setIgnoreMouseEvents(false)
  win.setFocusable(true)   // 채팅 입력 위해 일시적으로 포커스 허용(평소엔 focusable:false)
  win.show(); win.focus()
  win.webContents.send('chat-open')
}

// Poll the real cursor: feed it to the renderer (for missile homing) and flip the
// overlay interactive only while the cursor is over the widget "hotzone" (or chatting/
// editing). This is more reliable than forwarded mousemove for click-through windows.
let hotzone = null          // { x, y, w, h } in window coords
let hotzoneExtra = null     // [{ x, y, w, h }] extra clickable rects (per-opponent dim buttons)
let forceInteractive = false
let interactive = false
let pollTimer = null
// The widget defaults to bottom-center; main computes the same rect so click-through
// works immediately without waiting on the renderer (which only updates it on drag).
// Must match renderer: cellW=240, cellH=CELL_H(10+152+54=216), +BAR_SPACE(40) = 256.
function defaultHotzone() {
  const wa = activeDisplay().workArea
  const w = 240, h = 256
  const px = wa.x - winOrigin.x, py = wa.y - winOrigin.y
  return { x: Math.round(px + (wa.width - w) / 2), y: Math.round(py + wa.height - h - 12), w, h }
}
function startCursorPoll() {
  if (pollTimer) return
  if (!hotzone) hotzone = defaultHotzone()
  pollTimer = setInterval(() => {
    if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return
    const p = screen.getCursorScreenPoint()
    const cx = p.x - winOrigin.x, cy = p.y - winOrigin.y
    win.webContents.send('cursor', { x: cx, y: cy })
    let want = forceInteractive
    if (!want && hotzone) {
      want = cx >= hotzone.x && cx <= hotzone.x + hotzone.w &&
             cy >= hotzone.y && cy <= hotzone.y + hotzone.h
    }
    if (!want && hotzoneExtra) {   // per-opponent 👁 buttons drawn near each peer are clickable too
      for (const r of hotzoneExtra) { if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) { want = true; break } }
    }
    if (want !== interactive) {
      interactive = want
      win.setIgnoreMouseEvents(!want, { forward: true })
      // 바탕화면 모드: 고양이를 클릭(상호작용)하면 창이 앞으로 올라올 수 있으니, 상호작용이 끝나면 다시 맨 뒤로.
      // (단, 메뉴 등 모달이 열려 있으면 위로 유지 — forceInteractive)
      if (!want && desktopMode && !forceInteractive) pushToBottom()
    }
  }, 24)
}

app.whenReady().then(() => {
  if (!gotTheLock) return // a second instance — bail before creating any window
  app.setAppUserModelId('com.hrkim.beatbear') // Windows needs this for notifications to show
  createWindow()
  startCursorPoll()
  initAutoUpdate()

  // 원격 데스크톱 연결/종료·잠금해제·절전복귀·모니터 구성 변경 후 오버레이 복구
  try {
    powerMonitor.on('resume', () => scheduleRecover(true))
    powerMonitor.on('unlock-screen', () => scheduleRecover(true))
    screen.on('display-metrics-changed', () => scheduleRecover(false))   // work-area만 바뀐 경우(전체화면/작업표시줄)엔 복구 안 함 → 깜빡임 방지
    screen.on('display-added', () => scheduleRecover(true))
    screen.on('display-removed', () => scheduleRecover(true))
  } catch (e) { console.error('[beatbear] recover listeners failed:', e && e.message) }

  // Ctrl+Shift+B(채팅) 등록. 재시작 직후엔 죽은 이전 인스턴스가 아직 단축키를 OS에 반납 안 해 실패할 수 있으므로
  // 성공할 때까지 잠깐씩 재시도(업데이트/재시작·dev 재기동에서 "채팅 안 열림" 방지).
  ;(function registerChatHotkey(tries) {
    if (!app.isReady()) return
    let ok = false
    try { ok = globalShortcut.isRegistered('Control+Shift+B') || globalShortcut.register('Control+Shift+B', openChatFocus) } catch (e) {}
    if (ok) return
    if (tries < 12) setTimeout(() => registerChatHotkey(tries + 1), 500)
    else console.error('[beatbear] failed to register chat hotkey Ctrl+Shift+B (12회 재시도 실패)')
  })(0)

  if (uIOhook) {
    const keysDown = new Set()
    const isCtrl = () => keysDown.has(UiohookKey.Ctrl) || keysDown.has(UiohookKey.CtrlRight)
    const isAlt = () => keysDown.has(UiohookKey.Alt) || keysDown.has(UiohookKey.AltRight)
    const isShift = () => keysDown.has(UiohookKey.Shift) || keysDown.has(UiohookKey.ShiftRight)
    const isCaps = () => keysDown.has(UiohookKey.CapsLock)   // held (not the toggle state)
    // slot 1/2/3 hotkeys are user-configurable (settings → 단축키). Default Alt+Z/X/C. We only OBSERVE
    // keys (can't block), so combos must avoid OS/browser shortcuts — the UI warns about that.
    if (!Object.keys(slotKeyMap).length) slotKeyMap = buildSlotKeys(['Z', 'X', 'C'])
    const slotHeld = new Set()   // slot keys whose combo press we forwarded (for hold-to-charge weapons)
    // WASD forwarded to the overlay ONLY while a controllable human is active (privacy: we don't
    // leak key identity otherwise). The renderer toggles this via the 'human-control' ipc below.
    const MOVE_KEYS = { [UiohookKey.W]: 'w', [UiohookKey.A]: 'a', [UiohookKey.S]: 's', [UiohookKey.D]: 'd', [UiohookKey.E]: 'e', [UiohookKey.Q]: 'q', [UiohookKey.R]: 'r', [UiohookKey.Shift]: 'shift', [UiohookKey.ShiftRight]: 'shift', [UiohookKey.G]: 'g', [UiohookKey.H]: 'h' }   // Shift = 🐉 비행 부스트, G/H = dev 가짜 빔 테스트
    uIOhook.on('keydown', (e) => {
      // ignore OS auto-repeat while a key is held — act only on the initial press
      if (keysDown.has(e.keycode)) return
      keysDown.add(e.keycode)
      sendInput('key')
      const modOk = slotMod === 'custom' ? (slotModKey != null && keysDown.has(slotModKey)) : slotModMatches(isCtrl(), isAlt(), isShift(), isCaps())
      if (slotKeyMap[e.keycode] && modOk) {
        slotHeld.add(e.keycode)
        if (win && !win.isDestroyed()) win.webContents.send('command', { t: 'fire-slot', slot: slotKeyMap[e.keycode], down: true })
      }
      if ((humanActive || gatlingActive || antMechaActive) && MOVE_KEYS[e.keycode] && win && !win.isDestroyed()) {
        win.webContents.send('command', { t: 'human-key', key: MOVE_KEYS[e.keycode], down: true })
      }
      // Ctrl+` : toggle the ant mecha's human ⇄ ant form (only while a mecha is active)
      if (antMechaActive && e.keycode === UiohookKey.Backquote && isCtrl() && win && !win.isDestroyed()) {
        win.webContents.send('command', { t: 'mecha-transform' })
      }
      // Ctrl+` : 🐉 초사이언 변신/해제 (인간 소환체 활성 시)
      if (humanActive && e.keycode === UiohookKey.Backquote && isCtrl() && win && !win.isDestroyed()) {
        win.webContents.send('command', { t: 'human-transform' })
      }
    })
    uIOhook.on('keyup', (e) => {
      keysDown.delete(e.keycode)
      // always forward key-up so movement can't get stuck if the human is dismissed mid-hold
      if (MOVE_KEYS[e.keycode] && win && !win.isDestroyed()) {
        win.webContents.send('command', { t: 'human-key', key: MOVE_KEYS[e.keycode], down: false })
      }
      // release a held slot key (hold-to-charge weapons like 낙뢰) — forward regardless of modifiers
      if (slotHeld.has(e.keycode) && slotKeyMap[e.keycode]) {
        slotHeld.delete(e.keycode)
        if (win && !win.isDestroyed()) win.webContents.send('command', { t: 'fire-slot', slot: slotKeyMap[e.keycode], down: false })
      }
    })
    uIOhook.on('mousedown', (e) => {
      sendInput('mouse')
      // left click (uiohook button 1) → boost missiles + start holding (gatling continuous fire)
      if (e && e.button === 1 && win && !win.isDestroyed()) {
        win.webContents.send('command', { t: 'boost' })
        win.webContents.send('command', { t: 'lmb', down: true })
      }
    })
    uIOhook.on('mouseup', (e) => {
      if (e && e.button === 1 && win && !win.isDestroyed()) win.webContents.send('command', { t: 'lmb', down: false })
    })
    // mouse wheel / scroll intentionally does NOT count
    try { uIOhook.start() } catch (err) {
      console.error('[beatbear] failed to start global hook:', err.message)
    }
  }
})

ipcMain.on('get-version', (e) => { try { e.returnValue = app.getVersion() } catch { e.returnValue = '' } })
ipcMain.on('human-control', (_e, active) => { humanActive = !!active })
ipcMain.on('gatling-control', (_e, active) => { gatlingActive = !!active })
ipcMain.on('antmecha-control', (_e, active) => { antMechaActive = !!active })
ipcMain.on('set-keybinds', (_e, kb) => applyKeybinds(kb))
ipcMain.on('open-settings', toggleSettings)
ipcMain.on('desktop-mode', (_e, on) => { desktopMode = !!on; applyLayer() })   // 바탕화면 모드 토글(최상단 ↔ 맨 뒤)
// 메뉴 열림 동안만 오버레이를 포커스 가능하게(평소 focusable:false → 입력칸 타이핑·복붙 불가 회귀 방지).
ipcMain.on('set-focusable', (_e, on) => {
  if (!win || win.isDestroyed()) return
  win.setFocusable(!!on)
  // 이 IPC는 이제 "텍스트 입력칸이 실제로 포커스되거나 단축키 캡처 중"일 때만 호출됨(menu-ui). 그때만 활성화 → 일반 메뉴 조작엔 깜빡임 없음.
  if (on) { try { win.focus() } catch (e) {} }                                            // 입력/캡처: 키보드 위해 활성화
  else { try { if (win.isFocused()) win.blur() } catch (e) {}; reassertOverlay() }        // 해제: (포커스됐을 때만) 비활성화 + non-activating·클릭통과 복귀
})
ipcMain.on('apply-update', () => { if (updater) { try { updater.quitAndInstall(true, true) } catch (e) {} } })
ipcMain.on('check-update', () => {
  if (updater && updater.checkManual) { updater.checkManual(); return }
  dialog.showMessageBox({
    type: 'info', buttons: ['확인'], noLink: true, title: 'BeatBear 업데이트',
    message: app.isPackaged ? '업데이트 기능을 사용할 수 없습니다.' : '개발 모드에서는 업데이트를 확인할 수 없습니다.',
    detail: `현재 버전: v${app.getVersion()}`
  }).catch(() => {})
})
// renderer reports the widget rect (window coords) + whether to force interactive (chat/edit)
ipcMain.on('hotzone', (_e, z) => {
  hotzone = z && z.rect ? z.rect : null
  hotzoneExtra = z && Array.isArray(z.extra) ? z.extra : null
  const nf = !!(z && z.force)
  if (nf !== forceInteractive) { forceInteractive = nf; if (desktopMode) applyLayer() }   // 모달(메뉴 등) 열림/닫힘 → 바탕화면 모드 z-order 갱신(열리면 위로, 닫히면 뒤로)
})
ipcMain.on('quit', () => app.quit())
ipcMain.on('chat-close', () => {
  chatting = false
  if (win && !win.isDestroyed()) { win.blur(); win.setFocusable(false); reassertOverlay() }   // 채팅 종료 → 다시 non-activating으로
})

// relay settings-window commands → overlay
ipcMain.on('to-overlay', (_e, msg) => {
  if (!win || win.isDestroyed()) return
  if (msg && msg.t === 'chat') { openChatFocus(); return } // needs focus
  if (msg && msg.t === 'next-monitor') { moveToNextDisplay(); return }
  win.webContents.send('command', msg)
})
// relay overlay state → settings window
ipcMain.on('to-settings', (_e, msg) => {
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.webContents.send('state', msg)
})

app.on('will-quit', () => globalShortcut.unregisterAll())
app.on('window-all-closed', () => {
  if (uIOhook) { try { uIOhook.stop() } catch {} }
  app.quit()
})
