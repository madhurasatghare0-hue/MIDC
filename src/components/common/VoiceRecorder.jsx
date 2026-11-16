import { AlertCircle, Eraser, Info, Mic, MicOff, Square } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useSpeechToText } from '../../hooks/useSpeechToText'

const ERROR_KEYS = {
  'not-allowed': 'voice.errNotAllowed',
  'audio-capture': 'voice.errMic',
  'no-speech': 'voice.errNoSpeech',
  network: 'voice.errNetwork',
  unknown: 'voice.errGeneric',
}

/**
 * <VoiceRecorder value={text} onChange={setText} rows={4} />
 */
export default function VoiceRecorder({ value = '', onChange, rows = 4, placeholder }) {
  const { lang, t } = useLanguage()
  const { isSupported, isListening, interimTranscript, error, start, stop, reset } = useSpeechToText({
    lang,
    onFinal: (text) => onChange?.(text),
  })

  const handleMic = () => {
    if (isListening) {
      stop()
      return
    }
    reset(value) // continue after any typed text
    start()
  }

  const handleClear = () => {
    stop()
    reset('')
    onChange?.('')
  }

  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-50/60 p-4 sm:p-5">
      {/* ===== Mic row ===== */}
      {isSupported ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleMic}
            aria-pressed={isListening}
            aria-label={isListening ? t('voice.stop') : t('voice.start')}
            className="relative h-16 w-16 shrink-0 cursor-pointer rounded-full"
          >
            {isListening && <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />}
            <span
              className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white transition ${
                isListening
                  ? 'bg-gradient-to-b from-red-500 to-red-700 shadow-[0_8px_20px_-8px_rgb(214_69_61/0.6)]'
                  : 'bg-gradient-to-b from-brand-500 to-brand-700 shadow-brand hover:from-brand-600 hover:to-brand-800'
              }`}
            >
              {isListening ? <Square className="h-6 w-6 fill-white" /> : <Mic className="h-7 w-7" />}
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-ink-900">
              {isListening ? t('voice.listening') : t('voice.tapToSpeak')}
            </p>
            <p className="mt-0.5 text-xs text-ink-500">{t('voice.languageNote')}</p>

            {/* Sound bars while listening */}
            {isListening && (
              <div className="mt-2 flex h-5 items-end gap-1">
                {[40, 80, 55, 100, 65, 85, 45].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 animate-pulse rounded-full bg-red-500"
                    style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {value && !isListening && (
            <button
              type="button"
              onClick={handleClear}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-ink-500 transition hover:bg-white hover:text-brand-700"
            >
              <Eraser className="h-4 w-4" />
              {t('voice.clear')}
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('voice.unsupported')}</span>
        </div>
      )}

      {/* ===== Error ===== */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t(ERROR_KEYS[error] || 'voice.errGeneric')}</span>
        </div>
      )}

      {/* ===== Editable transcript ===== */}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={isListening}
        rows={rows}
        placeholder={placeholder || t('voice.tapToSpeak')}
        className="mt-4 w-full resize-none rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm leading-relaxed text-ink-900 outline-none transition placeholder:text-ink-400 read-only:bg-cream-50 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />

      {/* Live (not yet final) words */}
      {isListening && interimTranscript && (
        <p className="mt-2 text-sm italic text-ink-400">{interimTranscript}…</p>
      )}

      {/* Citizen review reminder */}
      {value && !isListening && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t('voice.reviewHint')}
        </p>
      )}
    </div>
  )
}