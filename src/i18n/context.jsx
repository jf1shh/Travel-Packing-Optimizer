import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LANG_MAP } from './languages.js';

// ── Language code constants (re-export for convenience) ─────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export { LANGUAGES, LANG_MAP } from './languages.js';

const STORAGE_KEY = 'travelPackerLang';

// ── Detect best browser/OS language ──────────────────────────────────────────
const detectBrowserLanguage = () => {
  try {
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const short = navLang.split('-')[0];
    if (LANG_MAP[short]) return short;
    if (LANG_MAP[navLang]) return navLang;
  } catch { /* best-effort */ }
  return 'en';
};

// ── Lazy-load translation JSON ──────────────────────────────────────────────
const translationCache = {};

const loadTranslations = async (lang) => {
  if (translationCache[lang]) return translationCache[lang];
  const mod = await import(`./translations/${lang}.json`);
  translationCache[lang] = mod.default || mod;
  return translationCache[lang];
};

// ── Context ──────────────────────────────────────────────────────────────────
const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANG_MAP[saved]) return saved;
    return detectBrowserLanguage();
  });
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadTranslations(lang).then(t => {
      if (!cancelled) {
        setTranslations(t);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [lang]);

  const setLang = useCallback((code) => {
    if (!LANG_MAP[code]) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  }, []);

  // RTL direction
  useEffect(() => {
    const dir = LANG_MAP[lang]?.dir || 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback((key, fallback) => {
    return translations[key] || fallback || key;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, loading, dir: LANG_MAP[lang]?.dir || 'ltr' }}>
      {children}
    </I18nContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useT = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for tests / outside provider: return noop
    return { t: (k, fb) => fb || k, lang: 'en', setLang: () => {}, loading: false, dir: 'ltr' };
  }
  return ctx;
};

export default I18nContext;
