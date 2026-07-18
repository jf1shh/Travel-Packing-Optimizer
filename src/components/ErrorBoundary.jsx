import React from 'react';
import { Logger } from '../services/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our custom local IndexedDB logger
    Logger.error(`React Error Boundary Caught: ${error.message}`, {
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#ef4444' }}>Oops, something went wrong.</h1>
          <p style={{ color: 'var(--text-secondary, #666)' }}>
            The application encountered a fatal error. We've saved the crash details locally.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color, #3b82f6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Reload Application
            </button>
            <button 
              onClick={() => Logger.exportLogs()}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color, #ccc)', color: 'var(--text-primary, #333)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Download Crash Report
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
