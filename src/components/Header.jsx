import React from 'react';

const Header = ({ theme, toggleTheme, onOpenWardrobe }) => {
  return (
    <header>
      <div>
        <h1 className="animate-slide-up" style={{ marginBottom: '0.25rem' }}>Travel Packer</h1>
        <p className="animate-slide-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s' }}>
          Smart packing for every adventure
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={onOpenWardrobe}
          className="animate-slide-up"
          style={{ animationDelay: '0.2s', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          My Closet 👕
        </button>
        <button 
          className="theme-toggle animate-slide-up" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{ animationDelay: '0.2s' }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header;
