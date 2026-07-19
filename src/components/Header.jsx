import React from 'react';
import { useT } from '../i18n/context.jsx';
import { LANGUAGES } from '../i18n/languages.js';

const Header = ({ theme, toggleTheme, onOpenWardrobe }) => {
  const { t, lang, setLang } = useT();
  
  return (
    <header>
      <div>
        <h1 className="animate-slide-up" style={{ marginBottom: '0.25rem' }}>{t('app.title')}</h1>
        <p className="animate-slide-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s' }}>
          {t('app.tagline')}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="animate-slide-up"
          style={{
            animationDelay: '0.2s',
            padding: '0.4rem 0.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            maxWidth: '110px',
          }}
          aria-label="Select language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
        <button 
          onClick={onOpenWardrobe}
          className="animate-slide-up"
          style={{ animationDelay: '0.2s', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {t('app.myCloset')} 👕
        </button>
        <button 
          className="theme-toggle animate-slide-up" 
          onClick={toggleTheme}
          aria-label={t('common.toggleTheme')}
          style={{ animationDelay: '0.2s' }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header;
