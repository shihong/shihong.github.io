;(function () {
  const a = document.createElement('link').relList
  if (a && a.supports && a.supports('modulepreload')) return
  for (const e of document.querySelectorAll('link[rel="modulepreload"]')) o(e)
  new MutationObserver((e) => {
    for (const t of e)
      if (t.type === 'childList')
        for (const c of t.addedNodes) c.tagName === 'LINK' && c.rel === 'modulepreload' && o(c)
  }).observe(document, { childList: !0, subtree: !0 })
  function s(e) {
    const t = {}
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === 'use-credentials'
        ? (t.credentials = 'include')
        : e.crossOrigin === 'anonymous'
        ? (t.credentials = 'omit')
        : (t.credentials = 'same-origin'),
      t
    )
  }
  function o(e) {
    if (e.ep) return
    e.ep = !0
    const t = s(e)
    fetch(e.href, t)
  }
})()
const i = 'uniqid',
  M = { iceServers: [] },
  l = cast.framework.CastReceiverContext.getInstance(),
  g = l.getPlayerManager(),
  u = cast.debug.CastDebugLogger.getInstance(),
  m = document.querySelector('video'),
  n = 'urn:x-cast:oeuvre.signal',
  d = l.getCurrentSession(),
  y = ({ isLoading: r }) => {
    document.querySelector('.loader').style.display = r ? 'block' : 'none'
  }
m.addEventListener('loadeddata', () => y({ isLoading: !1 }))
g.setMessageInterceptor(cast.framework.messages.MessageType.READY, (r) => {
  r.media.entity || (r.media.entity = r.media.contentId),
    (document.querySelector('.loader').innerHTML = 'loaded'),
    y({ isLoading: !0 }),
    u.setEnabled(!0),
    u.showDebugLogs(!0),
    u.clearDebugLogs(),
    u.setLevel(cast.debug.LoggerLevel.DEBUG)
  const a = new RTCPeerConnection(M)
  return (
    l.addCustomMessageListener(n, async (s) => {
      const o = { category: 'echo', data: s.data }
      switch ((d.sendMessage(n, o), JSON.parse(s.data).type)) {
        case 'offer':
          const t = o.data.offer
          console.log('offer'), await a.setRemoteDescription(t)
          const c = await a.createAnswer()
          await a.setLocalDescription(c),
            d.sendMessage(n, { type: 'answer', data: { answer: c, roomId: i } })
          break
        case 'ice-candidate':
          const p = o.data.candidate
          d.sendMessage(n, { type: 'ice-candidate', data: { candidate: p, roomId: i } }),
            console.log('ice-candidate')
          try {
            await a.addIceCandidate(p)
          } catch (w) {
            console.error('Error adding received ice candidate', w)
          }
          break
      }
    }),
    (a.onicecandidate = (s) => {
      s.candidate && d.sendMessage(n, { type: 'ice-candidate', candidate: s.candidate, roomId: i })
    }),
    new Promise((s, o) => {
      ;(document.querySelector('.loader').innerHTML = 'tracking...'),
        (a.ontrack = (e) => {
          e.streams && e.streams[0] && ((m.srcObject = e.streams[0]), s(e))
        }),
        d.sendMessage(n, { type: 'join-room', data: { roomId: i } }),
        d.sendMessage(n, { type: 'request', data: { event: 'webrtc', roomId: i } })
    })
  )
})
const L =
  ({ shouldPlay: r }) =>
  (a) => (m[r ? 'play' : 'pause'](), g.broadcastStatus(!0), a)
g.setMessageInterceptor(cast.framework.messages.MessageType.PAUSE, L({ shouldPlay: !1 }))
g.setMessageInterceptor(cast.framework.messages.MessageType.PLAY, L({ shouldPlay: !0 }))
const f = new cast.framework.CastReceiverOptions()
f.skipPlayersLoad = !0
f.disableIdleTimeout = !0
f.supportedCommands = cast.framework.messages.Command.ALL_BASIC_MEDIA
l.start(f)
