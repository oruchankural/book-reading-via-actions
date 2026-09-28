import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en.ts'
import { tr } from './locales/tr.ts'

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
] as const

const STORAGE_KEY = 'lang'

const stored = localStorage.getItem(STORAGE_KEY)
const fallback = navigator.language.startsWith('tr') ? 'tr' : 'en'
const initial = LANGUAGES.some((l) => l.code === stored) ? (stored ?? fallback) : fallback

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, tr: { translation: tr } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  document.documentElement.lang = lng
})

export default i18n
