// 메뉴 전용 창(별도 BrowserWindow)의 preload.
// 오버레이 본체와 완전히 분리된 창이라, 메뉴를 열고 닫아도 오버레이의 z-order·포커스를 건드리지 않는다
// (= 투명 오버레이 재합성으로 생기던 깜빡임 원천 차단).
const { contextBridge, ipcRenderer } = require('electron')

let rid = 0
const pending = new Map()
ipcRenderer.on('menu-invoke-result', (_e, m) => { const p = pending.get(m.rid); if (p) { pending.delete(m.rid); p(m.val) } })

contextBridge.exposeInMainWorld('beatbearMenu', {
  onInit: (cb) => ipcRenderer.on('menu-init', (_e, d) => cb(d)),       // 창이 뜰 때 초기 스냅샷 + 앵커
  onSnap: (cb) => ipcRenderer.on('menu-snap', (_e, d) => cb(d)),       // 상태 갱신 푸시(오버레이 → 메뉴)
  onClose: (cb) => ipcRenderer.on('menu-close', () => cb()),           // 바깥에서 닫힘 지시
  action: (fn, args) => ipcRenderer.send('menu-action', { fn, args }), // 반환값 없는 동작(대부분)
  invoke: (fn, args) => new Promise((res) => {                          // 반환값 필요한 동작(가챠·조합)
    const id = ++rid
    pending.set(id, res)
    ipcRenderer.send('menu-invoke', { rid: id, fn, args })
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); res(null) } }, 4000)
  }),
  close: () => ipcRenderer.send('menu-closed')                          // 메뉴가 스스로 닫힘(Esc·바깥클릭·닫기버튼)
})
