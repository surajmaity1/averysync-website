import { toast } from 'sonner'

const doOffer = async (p2pConnection: any, websocket: any) => {
  console.log('Starting negotiation (doOffer)...')
  try {
    console.log('Creating offer...')
    const offer = await p2pConnection.createOffer()
    console.log('Setting local description...')
    await p2pConnection.setLocalDescription(offer)

    console.log('Sending offer via WebSocket...')
    websocket.send(
      JSON.stringify({
        type: 'offer',
        sdp: offer.sdp,
      }),
    )
  } catch (e) {
    console.error('Error creating offer:', e)
  }
}

export const startStreaming = async (p2pConnection: any, websocket: any) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log('inside came')
    toast.error(
      'Camera/Mic API is blocked. You must access this site via HTTPS or localhost.',
    )
    return
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  })

  console.log('stream id', stream.id)

  p2pConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  })

  stream.getTracks().forEach((track) => {
    console.log(`Adding track with label: ${track.label}`)
    p2pConnection.addTrack(track, stream)
  })

  p2pConnection.onicecandidate = (event: any) => {
    if (event.candidate) {
      console.log('Sending ICE candidate')
      websocket.send(
        JSON.stringify({ type: 'candidate', candidate: event.candidate }),
      )
    }
  }

  p2pConnection.ontrack = (event: any) => {
    console.log(
      `Remote stream received: ${event.track.label} , ${event.track.kind}`,
    )
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = 'localhost:8999'
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmZmODQ3N2YtMDhiZi00MzczLWIyMWQtMjMxY2VjZDdlNmYxIiwidXNlcm5hbWUiOiJmZmY4NDc3Zi0wOGJmLTQzNzMtYjIxZC0yMzFjZWNkN2U2ZjEiLCJyb29tX2lkIjoiN2YxNjY5YjUtNTVkOC00NmM3LWI2YzgtMjA0OTAzNGZkOTNlIiwiaXNfc3BlYWtlciI6dHJ1ZSwiaXNzIjoiZGphbmdvLWJhY2tlbmQiLCJleHAiOjE3NzE2Mzg2NTEuMTMxMzgyN30.P8BhznQl8QFyHUdDiYrnM7SFy2vmbfOeslIrQwIy3E8'
  const webSocketURL = `${protocol}//${host}/ws?token=${token}`

  websocket = new WebSocket(webSocketURL)

  websocket.onopen = async () => {
    console.log('WebSocket connection opened')
    await doOffer(p2pConnection, websocket)
  }
  console.log('coming 3')
  websocket.onmessage = async (event: any) => {
    const msg = JSON.parse(event.data)
    console.log('Received WebSocket message:', msg.type)
    console.log('coming 3.1')
    if (msg.type === 'answer') {
      console.log("Processing 'answer' message...")
      try {
        await p2pConnection.setRemoteDescription({
          type: 'answer',
          sdp: msg.sdp,
        })
        console.log('Remote description set successfully')
        console.log('Status: WebRTC Connected')
        console.log('coming 4')
      } catch (err) {
        console.error('SetRemoteDescription Error:', err)
      }
    } else if (msg.type === 'candidate') {
      console.log('Received ICE candidate')
      try {
        await p2pConnection.addIceCandidate(msg.candidate)
      } catch (e) {
        console.error('Error adding received ice candidate', e)
      }
    } else if (msg.type === 'negotiate') {
      console.log('Renegotiation requested by server')
      // Avoid race conditions: only renegotiate if we are stable
      if (p2pConnection.signalingState === 'stable') {
        await doOffer(p2pConnection, websocket)
      } else {
        console.log(
          'Ignored renegotiation request because signaling state is ' +
            p2pConnection.signalingState,
        )
      }
    }
  }

  websocket.onerror = (e: any) => {
    console.error('WebSocket error:', e)
  }

  websocket.onclose = () => {
    console.log('WebSocket connection closed')
    p2pConnection.close()
  }

  console.log('end')
}
