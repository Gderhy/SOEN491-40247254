/**
 * Drawer – generic reusable slide-in panel
 *
 * Usage:
 *   <Drawer open={open} title="Edit Item" onClose={handleClose}>
 *     {children}
 *   </Drawer>
 *
 *   Optionally pass a `footer` prop to render actions in the sticky footer.
 */

import React, { useEffect } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import '../../styles/drawer.css';

export type DrawerPlacement = 'right' | 'left';

export interface DrawerProps {
  /** Whether the drawer is visible */
  open: boolean;
  /** Panel title displayed in the header */
  title: React.ReactNode;
  /** Optional subtitle below the title */
  subtitle?: React.ReactNode;
  /** Called when the user clicks the backdrop or the close button */
  onClose: () => void;
  /** Main scrollable content */
  children: React.ReactNode;
  /** Sticky footer content (usually action buttons) */
  footer?: React.ReactNode;
  /** Which side the drawer slides in from (default: 'right') */
  placement?: DrawerPlacement;
  /** Override the panel width (default: 480px) */
  width?: number | string;
  /** Extra class names for the panel element */
  className?: string;
  /** aria-label for the dialog (falls back to the title string) */
  ariaLabel?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  placement = 'right',
  width = 480,
  className = '',
  ariaLabel,
}) => {
  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const panelStyle: React.CSSProperties = {
    ['--drawer-width' as string]: typeof width === 'number' ? `${width}px` : width,
  };

  const label = ariaLabel ?? (typeof title === 'string' ? title : undefined);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${open ? ' drawer-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={panelStyle}
        className={[
          'drawer',
          `drawer--${placement}`,
          open ? 'drawer--open' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Header */}
        <div className="drawer__header">
          <div>
            <h2 className="drawer__title">{title}</h2>
            {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
          </div>
          <button
            className="drawer__close-btn"
            onClick={onClose}
            aria-label="Close panel"
          >
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        {/* Body */}
        <div className="drawer__body">{children}</div>

        {/* Footer */}
        {footer && <div className="drawer__footer">{footer}</div>}
      </aside>
    </>
  );
};

export default Drawer;
