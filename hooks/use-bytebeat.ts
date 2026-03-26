"use client"

import * as React from "react"
import { buildFnBody, compileFormula } from "@/lib/bytebeat"

interface BytebeatState {
  isPlaying: boolean
  time: number
  sampleRate: number
  volume: number
  formula: string
  error: string | null
  waveformData: number[]
}

function createWorkletBlobUrl(
  sampleRate: number,
  contextSampleRate: number
): string {
  const ratio = sampleRate / contextSampleRate
  const code = `
class BytebeatProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._fn = null
    this._time = 0
    this._ratio = ${ratio}
    this._wave = new Array(256).fill(128)
    this._waveIdx = 0
    this._pending = 0

    this.port.onmessage = ({ data }) => {
      if (data.type === 'fn') {
        try {
          const fn = new Function('t', data.body)
          fn(0)
          this._fn = fn
        } catch {
          this._fn = null
        }
      } else if (data.type === 'reset') {
        this._time = 0
      }
    }
  }

  process(inputs, outputs) {
    const ch = outputs[0][0]
    if (!ch) return true

    for (let i = 0; i < ch.length; i++) {
      let sample = 128
      if (this._fn) {
        try { sample = this._fn(Math.floor(this._time)) & 255 } catch {}
      }
      ch[i] = (sample - 128) / 128

      if (i % 16 === 0) {
        this._wave[this._waveIdx] = sample
        this._waveIdx = (this._waveIdx + 1) % 256
      }

      this._time += this._ratio
      this._pending++
    }

    if (this._pending >= 4096) {
      this._pending = 0
      this.port.postMessage({
        type: 'data',
        waveform: this._wave.slice(),
        time: Math.floor(this._time),
      })
    }

    return true
  }
}

registerProcessor('bytebeat-processor', BytebeatProcessor)
`
  return URL.createObjectURL(
    new Blob([code], { type: "application/javascript" })
  )
}

export function useBytebeat() {
  const [state, setState] = React.useState<BytebeatState>({
    isPlaying: false,
    time: 0,
    sampleRate: 8000,
    volume: 1,
    formula: "t*(42&t>>10)",
    error: null,
    waveformData: [],
  })

  const audioContextRef = React.useRef<AudioContext | null>(null)
  const audioWorkletNodeRef = React.useRef<AudioWorkletNode | null>(null)
  const gainNodeRef = React.useRef<GainNode | null>(null)

  const stateRef = React.useRef(state)
  stateRef.current = state

  const setFormula = React.useCallback((formula: string) => {
    const valid = compileFormula(formula) !== null
    setState((state) => ({
      ...state,
      formula,
      error: valid ? null : "Invalid formula",
    }))
    if (valid && audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({
        type: "fn",
        body: buildFnBody(formula),
      })
    }
  }, [])

  const setSampleRate = React.useCallback((sampleRate: number) => {
    setState((state) => ({ ...state, sampleRate }))
  }, [])

  const setVolume = React.useCallback((volume: number) => {
    setState((state) => ({ ...state, volume }))
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [])

  const play = React.useCallback(async () => {
    const { isPlaying, formula, sampleRate } = stateRef.current
    if (isPlaying) return

    if (!compileFormula(formula)) {
      setState((prev) => ({ ...prev, error: "Invalid formula" }))
      return
    }

    const audioContext = new AudioContext()
    audioContextRef.current = audioContext

    const blobUrl = createWorkletBlobUrl(sampleRate, audioContext.sampleRate)
    try {
      await audioContext.audioWorklet.addModule(blobUrl)
    } finally {
      URL.revokeObjectURL(blobUrl)
    }

    const node = new AudioWorkletNode(audioContext, "bytebeat-processor")
    audioWorkletNodeRef.current = node

    const gain = audioContext.createGain()
    gain.gain.value = stateRef.current.volume
    gainNodeRef.current = gain

    node.port.postMessage({ type: "fn", body: buildFnBody(formula) })

    node.port.onmessage = ({
      data,
    }: MessageEvent<{ type: string; waveform: number[]; time: number }>) => {
      if (data.type === "data") {
        setState((prev) => ({
          ...prev,
          time: data.time,
          waveformData: data.waveform,
        }))
      }
    }

    node.connect(gain)
    gain.connect(audioContext.destination)
    setState((prev) => ({ ...prev, isPlaying: true, error: null }))
  }, [])

  const stop = React.useCallback(() => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect()
      audioWorkletNodeRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    setState((state) => ({ ...state, isPlaying: false }))
  }, [])

  const reset = React.useCallback(() => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ type: "reset" })
    }
    stop()
    setState((prev) => ({ ...prev, time: 0, waveformData: [] }))
  }, [stop])

  React.useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    ...state,
    setFormula,
    setSampleRate,
    setVolume,
    play,
    stop,
    reset,
  }
}
