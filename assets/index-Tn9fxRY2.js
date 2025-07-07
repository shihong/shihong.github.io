;(function () {
  const r = document.createElement('link').relList
  if (r && r.supports && r.supports('modulepreload')) return
  for (const e of document.querySelectorAll('link[rel="modulepreload"]')) n(e)
  new MutationObserver((e) => {
    for (const t of e)
      if (t.type === 'childList')
        for (const s of t.addedNodes) s.tagName === 'LINK' && s.rel === 'modulepreload' && n(s)
  }).observe(document, { childList: !0, subtree: !0 })
  function a(e) {
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
  function n(e) {
    if (e.ep) return
    e.ep = !0
    const t = a(e)
    fetch(e.href, t)
  }
})()
const i = 'uniqid',
  u = 'nodeVideo',
  l = { iceServers: [] },
  o = window.cast.receiver.CastReceiverManager.getInstance(),
  p = 'urn:x-cast:oeuvre.signal'
o.onReady = function (d) {
  const r = o.getCastMessageBus(p)
  o.setApplicationState('Receiver Loaded')
  const a = new RTCPeerConnection(l)
  ;(a.ontrack = (n) => {
    if (n.streams && n.streams[0]) {
      const e = document.getElementById(u)
      e.srcObject = n.streams[0]
    }
  }),
    (a.onicecandidate = (n) => {
      n.candidate &&
        r.send(JSON.stringify({ type: 'ice-candidate', candidate: n.candidate, roomId: i }))
    }),
    r.send(JSON.stringify({ type: 'join-room', data: { roomId: i } })),
    r.send(JSON.stringify({ type: 'request', data: { event: 'webrtc', roomId: i } })),
    (r.onMessage = async function (n) {
      const e = JSON.parse(n.data)
      switch ((r.send(JSON.stringify({ type: 'echo', data: n.data })), e.type)) {
        case 'offer':
          const t = e.data.offer
          console.log('offer'), await a.setRemoteDescription(t)
          const s = await a.createAnswer()
          await a.setLocalDescription(s),
            r.send(JSON.stringify({ type: 'answer', data: { answer: s, roomId: i } }))
          break
        case 'ice-candidate':
          const c = e.data.candidate
          r.send(JSON.stringify({ type: 'ice-candidate', data: { candidate: c, roomId: i } })),
            console.log('ice-candidate')
          try {
            await a.addIceCandidate(c)
          } catch (f) {
            console.error('Error adding received ice candidate', f)
          }
          break
      }
    })
}
o.start()
