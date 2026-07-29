const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('beatbear', {
  // 이 PC의 계정 이름(기본 닉네임으로 사용) — 저장된 이름이 없을 때만 씀.
  // ⚠️ 샌드박스 preload에선 require('os')가 막혀 preload가 통째로 죽으므로 process.env만 사용.
  osUser: (() => { try { return (process.env.USERNAME || process.env.USER || process.env.USERPROFILE || '').replace(/^.*[\\/]/, '').trim().slice(0, 20) } catch { return '' } })(),
  // developer unlock: ONLY the machine with env var BEATBEAR_DEV=1 gets everything unlocked.
  // Friends don't have it set, so they can't fake it. Set once with: setx BEATBEAR_DEV 1
  isDev: (process.env.BEATBEAR_DEV || '').trim() === '1',   // trim: cmd `set X=1 &&`는 "1 "(뒤 공백) 저장될 수 있음
  appVersion: (() => { try { return ipcRenderer.sendSync('get-version') || '' } catch { return '' } })(),
  // ----- overlay window -----
  onInput(cb) { ipcRenderer.on('input', (_e, kind) => cb(kind)) },
  onChatOpen(cb) { ipcRenderer.on('chat-open', () => cb()) },
  chatClosed() { ipcRenderer.send('chat-close') },
  openSettings() { ipcRenderer.send('open-settings') },
  onCommand(cb) { ipcRenderer.on('command', (_e, msg) => cb(msg)) },
  onCursor(cb) { ipcRenderer.on('cursor', (_e, p) => cb(p)) },
  onLayout(cb) { ipcRenderer.on('layout', (_e, l) => cb(l)) },
  setHotzone(z) { ipcRenderer.send('hotzone', z) },
  humanControl(active) { ipcRenderer.send('human-control', !!active) },
  gatlingControl(active) { ipcRenderer.send('gatling-control', !!active) },
  antMechaControl(active) { ipcRenderer.send('antmecha-control', !!active) },
  setKeybinds(kb) { ipcRenderer.send('set-keybinds', kb) },
  setDesktopMode(on) { ipcRenderer.send('desktop-mode', !!on) },   // 바탕화면 모드(최상단 ↔ 맨 뒤)
  pushState(state) { ipcRenderer.send('to-settings', state) },
  quit() { ipcRenderer.send('quit') },

  // ----- settings window -----
  toOverlay(msg) { ipcRenderer.send('to-overlay', msg) },
  checkUpdate() { ipcRenderer.send('check-update') },
  onState(cb) { ipcRenderer.on('state', (_e, s) => cb(s)) }
})
