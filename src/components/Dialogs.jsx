import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Shared overlay shell for the dialog variants below -- matches the glass
// modal pattern already used by PackingList's fold-tip popup and
// OutfitEditor's edit dialog, so these read as one visual system instead of
// native browser alert()/confirm()/prompt() popups.
const Overlay = ({ children, onDismiss, labelledBy }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onDismiss) onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return createPortal(
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget && onDismiss) onDismiss(); }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: '1.5rem',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="glass"
        style={{ backgroundColor: 'var(--surface-color)', padding: '1.75rem', maxWidth: '440px', width: '100%' }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const DialogButton = React.forwardRef(({ variant = 'default', ...props }, ref) => {
  const styles = {
    default: { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' },
    primary: { background: 'var(--accent-color)', border: 'none', color: 'white', fontWeight: 600 },
    danger: { background: '#ef4444', border: 'none', color: 'white', fontWeight: 600 },
  }[variant];
  return <button ref={ref} {...props} style={{ ...styles, padding: '0.6rem 1.25rem', borderRadius: '10px', boxShadow: 'none' }} />;
});

/** Replaces window.confirm(). */
export const ConfirmDialog = ({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) => {
  const confirmRef = useRef(null);
  useEffect(() => { confirmRef.current?.focus(); }, []);
  return (
    <Overlay onDismiss={onCancel} labelledBy="confirm-dialog-title">
      {title && <h3 id="confirm-dialog-title" style={{ marginBottom: '0.75rem' }}>{title}</h3>}
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <DialogButton onClick={onCancel}>{cancelLabel}</DialogButton>
        <DialogButton ref={confirmRef} variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</DialogButton>
      </div>
    </Overlay>
  );
};

/** Replaces window.prompt() for free-text input. */
export const PromptDialog = ({ title, message, defaultValue = '', placeholder, submitLabel, cancelLabel, onSubmit, onCancel }) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState(defaultValue);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = (e) => { e.preventDefault(); onSubmit(value); };
  return (
    <Overlay onDismiss={onCancel} labelledBy="prompt-dialog-title">
      <form onSubmit={submit}>
        {title && <h3 id="prompt-dialog-title" style={{ marginBottom: '0.75rem' }}>{title}</h3>}
        {message && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{message}</p>}
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: '100%', marginBottom: '1.5rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <DialogButton type="button" onClick={onCancel}>{cancelLabel}</DialogButton>
          <DialogButton type="submit" variant="primary">{submitLabel}</DialogButton>
        </div>
      </form>
    </Overlay>
  );
};

/** Replaces window.prompt(msg, url) used as a clipboard-write fallback -- a
 * read-only, select-on-focus field so the user can still copy manually. */
export const CopyFallbackDialog = ({ title, message, value, closeLabel, onClose }) => {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  return (
    <Overlay onDismiss={onClose} labelledBy="copy-fallback-title">
      {title && <h3 id="copy-fallback-title" style={{ marginBottom: '0.75rem' }}>{title}</h3>}
      {message && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{message}</p>}
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value}
        onFocus={(e) => e.target.select()}
        style={{ width: '100%', marginBottom: '1.5rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DialogButton variant="primary" onClick={onClose}>{closeLabel}</DialogButton>
      </div>
    </Overlay>
  );
};

/** Lightweight auto-dismissing toast -- replaces alert() for simple notices. */
export const Toast = ({ message, type = 'info', onDismiss, duration = 3000 }) => {
  useEffect(() => {
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [onDismiss, duration]);

  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' },
    info: { bg: 'var(--surface-color)', border: 'var(--border-color)', text: 'var(--text-primary)' },
  }[type];

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 2100, backgroundColor: colors.bg, border: `1px solid ${colors.border}`,
        color: colors.text, padding: '0.85rem 1.5rem', borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)', maxWidth: '90vw', textAlign: 'center',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        fontWeight: 500, fontSize: '0.9rem',
      }}
    >
      {message}
    </div>,
    document.body
  );
};
