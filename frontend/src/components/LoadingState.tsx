/**
 * LoadingState
 *
 * Full-area centered spinner used inside any page child section.
 * Fills whatever parent container it sits in (use inside a flex / grid cell
 * that has an explicit height, or it will naturally size to its content).
 *
 * Usage:
 *   <LoadingState message="Loading transactions…" />
 *   <LoadingState />   ← uses default message
 */

import React from 'react';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import './LoadingState.css';

interface LoadingStateProps {
  /** Text shown below the spinner. Defaults to "Loading…" */
  message?: string;
  /** Optional extra className on the root element */
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading…',
  className = '',
}) => {
  return (
    <div className={`loading-state ${className}`} role="status" aria-live="polite">
      <HourglassTopRoundedIcon className="loading-state__icon" aria-hidden="true" />
      <p className="loading-state__message">{message}</p>
    </div>
  );
};

export default LoadingState;
