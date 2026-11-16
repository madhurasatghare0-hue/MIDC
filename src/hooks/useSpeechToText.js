import { useCallback, useEffect, useRef, useState } from 'react'

// Chrome / Edge expose the prefixed version
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

const LANG_MAP = { en: 'en-IN', mr: 'mr-IN' }

/**
 * Browser speech-to-text (Web Speech API).
 *
 * const { isSupported, isListening, transcript, interimTranscript,
 *         error, start, stop, toggle, reset } = useSpeechToText({ lang, onFinal })
 *
 * - lang:     'en' | 'mr' (portal language)
 * - onFinal:  called with the full transcript every time a phrase is finalised
 * - error:    null | 'not-allowed' | 'audio-capture' | 'no-speech' | 'network' | 'unknown'
 */
export function useSpeechToText({ lang = 'en', onFinal } = {}) {
  const isSupported = Boolean(SpeechRecognitionAPI)

  const recognitionRef = useRef(null)
  const wantListeningRef = useRef(false) // user intent (survives Chrome auto-stop)
  const finalTextRef = useRef('')
  const onFinalRef = useRef(onFinal)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)

  // Always call the latest onFinal without re-creating recognition
  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])

  // Create one recognition instance per language
  useEffect(() => {
    if (!isSupported) return undefined

    const rec = new SpeechRecognitionAPI()
    rec.lang = LANG_MAP[lang] || lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalTextRef.current = `${finalTextRef.current} ${text}`.replace(/\s+/g, ' ').trim()
          setTranscript(finalTextRef.current)
          onFinalRef.current?.(finalTextRef.current)
        } else {
          interim += text
        }
      }
      setInterimTranscript(interim)
    }

    rec.onerror = (event) => {
      if (event.error === 'aborted') return
      // Silence: stop instead of restarting forever
      if (event.error === 'no-speech') {
        wantListeningRef.current = false
        setError('no-speech')
        return
      }
      wantListeningRef.current = false
      setError(
        ['not-allowed', 'service-not-allowed'].includes(event.error)
          ? 'not-allowed'
          : ['audio-capture', 'network'].includes(event.error)
            ? event.error
            : 'unknown'
      )
    }

    rec.onend = () => {
      setInterimTranscript('')
      // Chrome ends sessions after pauses → resume if user hasn't pressed stop
      if (wantListeningRef.current) {
        try {
          rec.start()
          return
        } catch {
          wantListeningRef.current = false
        }
      }
      setIsListening(false)
    }

    recognitionRef.current = rec

    return () => {
      wantListeningRef.current = false
      rec.onend = null
      rec.onresult = null
      rec.onerror = null
      try {
        rec.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
      setIsListening(false)
      setInterimTranscript('')
    }
  }, [lang, isSupported])

  const start = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec || wantListeningRef.current) return
    setError(null)
    wantListeningRef.current = true
    try {
      rec.start()
    } catch {
      /* already started */
    }
  }, [])

  const stop = useCallback(() => {
    wantListeningRef.current = false
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(() => {
    if (wantListeningRef.current) stop()
    else start()
  }, [start, stop])

  // Clear, or seed with existing typed text so speech appends to it
  const reset = useCallback((initialText = '') => {
    finalTextRef.current = initialText.trim()
    setTranscript(finalTextRef.current)
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    toggle,
    reset,
  }
}