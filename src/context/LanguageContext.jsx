import { createContext, useContext, useState, useEffect } from 'react'
import { en } from '../i18n/en'
import { mr } from '../i18n/mr'
import { storage } from '../services/storage'
import { LANGUAGES } from '../utils/constants'

const translations = { en, mr }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => storage.getLang() || 'en')

  const setLanguage = (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang)
      storage.setLang(newLang)
    }
  }

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'mr' : 'en'
    setLanguage(nextLang)
  }

  // Helper function to resolve dot-notated key e.g. "auth.login"
  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.')
    let current = translations[lang]

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        return fallback || keyPath
      }
    }

    return current
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        languages: LANGUAGES,
        setLanguage,
        toggleLanguage,
        t,
        isMarathi: lang === 'mr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
