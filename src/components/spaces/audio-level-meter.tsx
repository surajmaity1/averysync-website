import { useEffect, useRef } from 'react'

// One AudioContext shared by every meter — browsers cap concurrent contexts,
// and a space renders one meter per participant.
let sharedContext: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !window.AudioContext) return null
  if (!sharedContext) sharedContext = new AudioContext()
  // Contexts start suspended until a user gesture; joining a space is one,
  // but resume defensively on every meter mount.
  if (sharedContext.state === 'suspended') void sharedContext.resume()
  return sharedContext
}

const BAR_COUNT = 4
// Per-bar sensitivity so the bars don't move in lockstep.
const BAR_GAIN = [0.55, 1, 0.8, 0.45]
/** RMS level above which the participant reads as "speaking". */
const SPEAKING_THRESHOLD = 0.04
/** Resting bar height (scaleY) — the "calm" state: mic on, nobody talking. */
const CALM_SCALE = 0.25

const SPEAKING_COLOR = '#22c55e' // green-500
const CALM_COLOR = '#9ca3af' // gray-400

type AudioLevelMeterProps = {
  /** The participant's audio stream; null/undefined renders nothing. */
  stream: MediaStream | null | undefined
  /** Muted participants show no meter — the mic badge already says muted. */
  muted: boolean
}

/**
 * A tiny 4-bar equalizer showing live voice activity for one participant:
 * bars dance while they speak, sit calm (low, gray) while their mic is on
 * but silent, and disappear entirely when muted.
 *
 * Levels are read from an AnalyserNode inside requestAnimationFrame and
 * written straight to the bar elements' styles — no React state, so the
 * ~60 fps updates never re-render the participant list.
 */
export const AudioLevelMeter = ({ stream, muted }: AudioLevelMeterProps) => {
  const barsRef = useRef<Array<HTMLSpanElement | null>>([])

  useEffect(() => {
    if (!stream || muted) return

    const ctx = getAudioContext()
    if (!ctx) return

    let source: MediaStreamAudioSourceNode
    try {
      source = ctx.createMediaStreamSource(stream)
    } catch {
      return // stream without audio tracks
    }
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    const samples = new Uint8Array(analyser.fftSize)

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    let raf = 0
    let level = 0
    const tick = () => {
      analyser.getByteTimeDomainData(samples)
      let sum = 0
      for (let i = 0; i < samples.length; i++) {
        const v = (samples[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / samples.length)
      // Attack fast, decay slow — keeps the bars from flickering on speech gaps.
      level = Math.max(rms * 3, level * 0.85)
      const speaking = level > SPEAKING_THRESHOLD

      barsRef.current.forEach((el, i) => {
        if (!el) return
        // Under reduced motion the bars don't dance; speaking still reads
        // through the color change below.
        const scale = reduceMotion
          ? CALM_SCALE
          : Math.min(1, CALM_SCALE + level * BAR_GAIN[i] * 2.2)
        el.style.transform = `scaleY(${scale})`
        el.style.backgroundColor = speaking ? SPEAKING_COLOR : CALM_COLOR
      })
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      source.disconnect()
      analyser.disconnect()
    }
  }, [stream, muted])

  if (!stream || muted) return null

  return (
    <span
      className="flex h-3 items-end gap-px"
      aria-hidden="true"
      title="Voice activity"
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el
          }}
          className="h-full w-[3px] origin-bottom rounded-full bg-gray-400 transition-transform duration-75"
          style={{ transform: `scaleY(${CALM_SCALE})` }}
        />
      ))}
    </span>
  )
}
