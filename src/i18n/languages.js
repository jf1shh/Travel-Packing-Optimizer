// ── Language definitions shared between context.jsx and components ──────────
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', native: '日本語', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', native: '中文', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', dir: 'ltr' },
  { code: 'ko', name: 'Korean', native: '한국어', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'it', name: 'Italian', native: 'Italiano', dir: 'ltr' },
];

export const LANG_MAP = Object.fromEntries(LANGUAGES.map(l => [l.code, l]));
