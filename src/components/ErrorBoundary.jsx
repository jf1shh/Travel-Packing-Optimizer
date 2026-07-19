import React from 'react';
import { Logger } from '../services/logger';
import { useT } from '../i18n/context.jsx';

function ErrorFallback({ error: _error }) {
  const { t } = useT();
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#ef4444' }}>{t('error.title')}</h1>
      <p style={{ color: 'var(--text-secondary, #666)' }}>
        {t('error.description')}
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color, #3b82f6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {t('error.reload')}
        </button>
        <button 
          onClick={() => Logger.exportLogs()}
          style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color, #ccc)', color: 'var(--text-primary, #333)', borderRadius: '8px', cursor: 'pointer' }}
        >
          {t('error.downloadReport')}
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Logger.error(`React Error Boundary Caught: ${error.message}`, {
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
