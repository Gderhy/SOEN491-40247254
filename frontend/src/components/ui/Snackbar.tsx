/**
 * Snackbar / Toast notification system
 *
 * Three exports:
 *   1. SnackbarProvider  – mount once at the app root
 *   2. useSnackbar       – hook to fire toasts from anywhere
 *   3. SnackbarContainer – (internal) renders the live region
 *
 * Usage:
 *   // 1. Wrap your app (already done in App.tsx after setup)
 *   <SnackbarProvider>
 *     <App />
 *   </SnackbarProvider>
 *
 *   // 2. Fire a toast from any component
 *   const { showSnackbar } = useSnackbar();
 *   showSnackbar({ message: 'Saved!', severity: 'success' });
 *   showSnackbar({ title: 'Error', message: err.message, severity: 'error' });
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import '../../styles/snackbar.css';

/* ── Types ──────────────────────────────────────────────────── */

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';
export type SnackbarPlacement =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right';

export interface SnackbarOptions {
  /** Short optional title rendered in bold above the message */
  title?: string;
  /** Main notification text */
  message: string;
  /** Visual variant (default: 'info') */
  severity?: SnackbarSeverity;
  /** Auto-dismiss duration in ms (default: 4000). Pass 0 to disable. */
  duration?: number;
}

interface SnackbarItem extends Required<Omit<SnackbarOptions, 'title'>> {
  id: string;
  title?: string;
  exiting: boolean;
}

/* ── Context ────────────────────────────────────────────────── */

interface SnackbarContextValue {
  showSnackbar: (options: SnackbarOptions) => void;
  closeSnackbar: (id: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/* ── Icons ──────────────────────────────────────────────────── */

const ICONS: Record<SnackbarSeverity, React.ReactNode> = {
  success: <CheckCircleOutlineRoundedIcon className="snackbar__icon" />,
  error:   <ErrorOutlineRoundedIcon       className="snackbar__icon" />,
  warning: <WarningAmberRoundedIcon       className="snackbar__icon" />,
  info:    <InfoOutlinedIcon              className="snackbar__icon" />,
};

/* ── Provider ───────────────────────────────────────────────── */

export interface SnackbarProviderProps {
  children: React.ReactNode;
  /** Where toasts appear (default: 'bottom-center') */
  placement?: SnackbarPlacement;
  /** Max toasts shown simultaneously (default: 5) */
  maxItems?: number;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
  placement = 'bottom-right',
  maxItems = 5,
}) => {
  const [items, setItems] = useState<SnackbarItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const closeSnackbar = useCallback((id: string) => {
    /* Trigger exit animation */
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, exiting: true } : item))
    );
    /* Remove after animation */
    const t = setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== id));
      timers.current.delete(id);
    }, 220);
    timers.current.set(`${id}-exit`, t);
  }, []);

  const showSnackbar = useCallback(
    (options: SnackbarOptions) => {
      const id = `snack-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: SnackbarItem = {
        id,
        title: options.title,
        message: options.message,
        severity: options.severity ?? 'info',
        duration: options.duration ?? 4000,
        exiting: false,
      };

      setItems(prev => {
        const next = [...prev, item];
        /* Trim oldest if over limit */
        return next.length > maxItems ? next.slice(next.length - maxItems) : next;
      });

      if (item.duration > 0) {
        const t = setTimeout(() => closeSnackbar(id), item.duration);
        timers.current.set(id, t);
      }
    },
    [closeSnackbar, maxItems]
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      <SnackbarContainer
        items={items}
        placement={placement}
        onClose={closeSnackbar}
      />
    </SnackbarContext.Provider>
  );
};

/* ── Hook ───────────────────────────────────────────────────── */

/**
 * Returns `showSnackbar` and `closeSnackbar`.
 * Must be used inside <SnackbarProvider>.
 */
export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used inside <SnackbarProvider>');
  }
  return ctx;
}

/* ── Container (internal) ───────────────────────────────────── */

interface SnackbarContainerProps {
  items: SnackbarItem[];
  placement: SnackbarPlacement;
  onClose: (id: string) => void;
}

const SnackbarContainer: React.FC<SnackbarContainerProps> = ({
  items,
  placement,
  onClose,
}) => {
  if (items.length === 0) return null;

  return (
    <div
      className={`snackbar-container snackbar-container--${placement}`}
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map(item => (
        <SnackbarItem key={item.id} item={item} onClose={onClose} />
      ))}
    </div>
  );
};

/* ── Single item ────────────────────────────────────────────── */

interface SnackbarItemProps {
  item: SnackbarItem;
  onClose: (id: string) => void;
}

const SnackbarItem: React.FC<SnackbarItemProps> = ({ item, onClose }) => {
  return (
    <div
      role="status"
      className={[
        'snackbar',
        `snackbar--${item.severity}`,
        item.exiting ? 'snackbar--exiting' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {ICONS[item.severity]}

      <div className="snackbar__content">
        {item.title && <div className="snackbar__title">{item.title}</div>}
        <div className="snackbar__message">{item.message}</div>
      </div>

      <button
        className="snackbar__close"
        onClick={() => onClose(item.id)}
        aria-label="Dismiss notification"
      >
        <CloseRoundedIcon style={{ fontSize: '1rem' }} />
      </button>

      {item.duration > 0 && (
        <div
          className="snackbar__progress"
          style={{ animationDuration: `${item.duration}ms` }}
        />
      )}
    </div>
  );
};
