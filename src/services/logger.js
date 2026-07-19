import { get, set } from 'idb-keyval';

const LOG_KEY = 'app_error_logs';
const MAX_LOGS = 500;

export const Logger = {
  init: () => {
    // Catch global unhandled errors
    window.addEventListener('error', (event) => {
      Logger.error(`Uncaught Error: ${event.message}`, {
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error ? event.error.stack : null
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Logger.error(`Unhandled Promise Rejection: ${event.reason}`, {
        stack: event.reason && event.reason.stack ? event.reason.stack : null
      });
    });
  },

  error: async (message, details = {}) => {
    try {
      let logs = await get(LOG_KEY);
      if (!logs || !Array.isArray(logs)) logs = [];

      const newLog = {
        timestamp: new Date().toISOString(),
        message,
        details,
        userAgent: navigator.userAgent
      };

      logs.push(newLog);

      if (logs.length > MAX_LOGS) {
        logs = logs.slice(logs.length - MAX_LOGS);
      }

      await set(LOG_KEY, logs);
      console.error("[Logger]", message, details); // Still log to console for local dev
    } catch (e) {
      console.error("Failed to write to local logger", e);
    }
  },

  exportLogs: async () => {
    try {
      const logs = await get(LOG_KEY);
      if (!logs || logs.length === 0) {
        console.log("[Logger] No errors found in the local log.");
        return;
      }

      const logText = logs.map(l => {
        let entry = `[${l.timestamp}] ERROR: ${l.message}\n`;
        if (l.details) entry += `Details: ${JSON.stringify(l.details, null, 2)}\n`;
        entry += `UserAgent: ${l.userAgent}\n`;
        return entry + '-'.repeat(40) + '\n';
      }).join('\n');

      const blob = new Blob([logText], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `travel-optimizer-crash-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("[Logger] Failed to export logs", e);
    }
  }
};
