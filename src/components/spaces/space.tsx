import { useSpaceStreaming } from '@/utils/stream'
import React, { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface SpaceData {
  id: string
  title: string
  status: string
  token?: string
  websocket_url?: string
}

interface SpaceComponentProps {
  spaceId: string
}

const SpaceComponent: React.FC<SpaceComponentProps> = ({ spaceId }) => {
  const [spaceData, setSpaceData] = React.useState<SpaceData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const audioRef = useRef<HTMLDivElement>(null)

  const {
    startSpace,
    stopSpace,
    toggleMute,
    isConnected,
    isMuted,
    remoteStreams,
  } = useSpaceStreaming()

  // Fetch space data
  const fetchSpaceData = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${spaceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch space data')
      }

      const data = await response.json()
      setSpaceData(data)
    } catch (error) {
      console.error('Error fetching space:', error)
      toast.error('Failed to load space')
    }
  }, [spaceId])

  // Start the space (make it live)
  const handleStartSpace = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${spaceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          status: 'LIVE',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start space')
      }

      const data = await response.json()
      setSpaceData(data)

      // If token and websocket_url are provided, connect immediately
      if (data.token && data.websocket_url) {
        await startSpace(data.token, data.websocket_url)
        toast.success('Space is now live!')
      }
    } catch (error) {
      console.error('Error starting space:', error)
      toast.error('Failed to start space')
    } finally {
      setIsLoading(false)
    }
  }

  // Join an existing live space
  const handleJoinSpace = async () => {
    console.log('2')
    if (!spaceData?.token || !spaceData?.websocket_url) {
      toast.error('Space connection details not available')
      return
    }

    setIsLoading(true)
    try {
      await startSpace(spaceData.token, spaceData.websocket_url)
    } catch (error) {
      console.error('Error joining space:', error)
      toast.error('Failed to join space')
    } finally {
      setIsLoading(false)
    }
  }

  // End the space
  const handleEndSpace = async () => {
    try {
      // First disconnect from WebRTC
      stopSpace()

      // Then update space status in backend
      const response = await fetch(`/api/posts/${spaceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          status: 'ENDED',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to end space')
      }

      toast.success('Space ended')
      await fetchSpaceData()
    } catch (error) {
      console.error('Error ending space:', error)
      toast.error('Failed to end space')
    }
  }

  // Play remote audio streams
  useEffect(() => {
    if (audioRef.current && remoteStreams.length > 0) {
      // Clear existing audio elements
      audioRef.current.innerHTML = ''

      // Create audio element for each remote stream
      remoteStreams.forEach((stream, index) => {
        const audio = document.createElement('audio')
        audio.srcObject = stream
        audio.autoplay = true
        audio.id = `remote-audio-${index}`
        audioRef.current?.appendChild(audio)
        console.log(`Playing remote stream ${index}`)
      })
    }
  }, [remoteStreams])

  // Load space data on mount and clean up when spaceId changes
  useEffect(() => {
    fetchSpaceData()

    return () => {
      stopSpace()
    }
  }, [spaceId, fetchSpaceData, stopSpace])

  if (!spaceData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading space...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        {/* Space Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold">{spaceData.title}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isConnected
                  ? 'bg-green-100 text-green-800'
                  : spaceData.status === 'LIVE'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isConnected ? 'Connected' : spaceData.status}
            </span>
            {isConnected && (
              <span className="text-sm text-gray-600">
                {remoteStreams.length} speaker(s)
              </span>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              ✓ Connected to space - Your audio is {isMuted ? 'muted' : 'live'}
            </p>
          </div>
        )}

        {/* Audio Container (hidden, plays remote streams) */}
        <div ref={audioRef} style={{ display: 'none' }} />

        {/* Controls */}
        <div className="space-y-3">
          {!isConnected && spaceData.status !== 'LIVE' && (
            <button
              onClick={handleStartSpace}
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? 'Starting...' : 'Start Space'}
            </button>
          )}

          {!isConnected && spaceData.status === 'LIVE' && (
            <button
              onClick={handleJoinSpace}
              disabled={isLoading}
              className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? 'Joining...' : 'Join Space'}
            </button>
          )}

          {isConnected && (
            <>
              <button
                onClick={toggleMute}
                className={`w-full rounded-lg px-6 py-3 font-medium transition ${
                  isMuted
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isMuted ? '🔇 Unmute' : '🎤 Mute'}
              </button>

              <button
                onClick={handleEndSpace}
                className="w-full rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
              >
                End Space
              </button>
            </>
          )}
        </div>

        {/* Debug Info (remove in production) */}
        {
          <div className="mt-6 rounded bg-gray-100 p-4 text-xs">
            <p>Space ID: {spaceData.id}</p>
            <p>Status: {spaceData.status}</p>
            <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Token: {spaceData.token ? 'Present' : 'None'}</p>
            <p>WebSocket URL: {spaceData.websocket_url || 'None'}</p>
          </div>
        }
      </div>
    </div>
  )
}

export default SpaceComponent
