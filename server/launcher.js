// BeatBear 데디케이트 서버 런처 (모델2: 서버가 곧 방)
// ─────────────────────────────────────────────────────────────────────────────
// 이 파일을 pkg로 exe(beatbear-server.exe)로 빌드하면, 실행할 때마다
//   1) GitHub 최신 "릴리스"의 태그(=버전) + server.js 를 받아와서
//   2) 그 버전으로 서버를 띄운다.
// → exe 자체는 재다운로드할 필요 없이, 켤 때마다 항상 "최신 버전" 서버가 뜬다.
//   (클라도 자동 업데이트로 최신 → 버전 게이트가 자동으로 일치)
// 오프라인/실패 시: 마지막 캐시 → exe에 내장된 번들 순으로 폴백한다.
const https = require('https')
const fs = require('fs')
const path = require('path')
const os = require('os')
const ws = require('ws')   // pkg가 exe에 번들 — 받아온 server.js 에 주입해서 씀

const OWNER = 'hrkim123'
const REPO = 'BeatBear'
const PORT = process.env.PORT || 8787
const CACHE_DIR = path.join(process.env.LOCALAPPDATA || os.homedir(), 'beatbear-server-cache')

function ensureDir(d) { try { fs.mkdirSync(d, { recursive: true }) } catch {} }

function httpsGet(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'))
    const req = https.get(url, { headers: { 'User-Agent': 'beatbear-server-launcher', Accept: 'application/vnd.github+json' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return httpsGet(res.headers.location, redirects + 1).then(resolve, reject)
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)) }
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (c) => (data += c))
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(10000, () => req.destroy(new Error('timeout')))
  })
}

// GitHub 최신 릴리스에서 태그(버전) + 해당 태그의 server.js 를 받아온다.
async function fetchLatest() {
  const relJson = await httpsGet(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`)
  const tag = JSON.parse(relJson).tag_name
  if (!tag) throw new Error('릴리스 태그 없음')
  const version = String(tag).replace(/^v/, '')
  const code = await httpsGet(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${tag}/server/server.js`)
  if (!code || !/WebSocketServer/.test(code)) throw new Error('server.js 내용 이상')
  return { version, code }
}

function readCache() {
  try {
    const code = fs.readFileSync(path.join(CACHE_DIR, 'server.js'), 'utf8')
    const version = fs.readFileSync(path.join(CACHE_DIR, 'version.txt'), 'utf8').trim()
    if (code && version) return { version, code }
  } catch {}
  return null
}
function writeCache(version, code) {
  ensureDir(CACHE_DIR)
  try {
    fs.writeFileSync(path.join(CACHE_DIR, 'server.js'), code)
    fs.writeFileSync(path.join(CACHE_DIR, 'version.txt'), version)
  } catch {}
}
// exe 에 번들된 server.js + package.json (pkg assets) 최후 폴백
function readBundled() {
  try {
    const code = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8')
    let version = ''
    try { version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version } catch {}
    if (code) return { version, code }
  } catch {}
  return null
}

// 받아온 server.js 코드를 "번들 ws + 주입 버전" 환경에서 실행.
// (pkg exe 안에선 임의 경로의 require('ws') 가 안 되므로, 우리가 가진 ws 를 넘겨준다.)
function runServer(version, code) {
  process.env.SERVER_VERSION = version || ''
  process.env.PORT = String(PORT)
  const shimRequire = (name) => {
    if (name === 'ws') return ws
    if (/package\.json$/.test(name)) return { version }
    return require(name)
  }
  const mod = { exports: {} }
  const wrapped = new Function('require', 'module', 'exports', '__dirname', '__filename', 'process', code)
  wrapped(shimRequire, mod, mod.exports, __dirname, 'server.js', process)
}

function printAddresses() {
  const nets = os.networkInterfaces()
  const addrs = []
  for (const list of Object.values(nets)) for (const n of list || []) {
    if (n.family === 'IPv4' && !n.internal) addrs.push(n.address)
  }
  console.log('────────────────────────────────────────────')
  console.log('같은 PC:  ws://localhost:' + PORT)
  for (const a of addrs) console.log('같은 랜:  ws://' + a + ':' + PORT)
  console.log('다른 네트워크: 공유기 포트포워딩/터널/VPS 필요 (README 참고)')
  console.log('친구에게 위 주소 중 하나를 알려주세요. (Ctrl+C 로 종료)')
  console.log('────────────────────────────────────────────')
}

;(async () => {
  console.log('🐻 BeatBear 데디케이트 서버 런처')
  let src = null, origin = ''
  try {
    src = await fetchLatest(); origin = 'GitHub 최신 릴리스'
    writeCache(src.version, src.code)
  } catch (e) {
    console.log('⚠ 최신 버전 받기 실패(' + e.message + ') — 캐시/번들로 폴백합니다.')
    src = readCache(); if (src) origin = '캐시'
    if (!src) { src = readBundled(); if (src) origin = 'exe 내장(번들)' }
  }
  if (!src) {
    console.error('❌ 서버 코드를 찾을 수 없습니다. 인터넷 연결 후 다시 실행해주세요.')
    process.exit(1)
  }
  console.log(`▶ 서버 버전 v${src.version} (${origin})로 시작합니다.`)
  try { runServer(src.version, src.code); printAddresses() } catch (e) {
    console.error('❌ 서버 시작 실패:', e && e.message ? e.message : e)
    process.exit(1)
  }
})()
