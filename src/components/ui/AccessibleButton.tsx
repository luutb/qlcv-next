'use client';

import React, { forwardRef } from 'react';
import { Button, ButtonProps, Tooltip } from '@mui/material';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  tooltip?: string;
  loadingText?: string;
  loading?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      tooltip,
      loadingText = 'Đang xử lý...',
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const button = (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? loadingText : children}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip title={tooltip} arrow>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

AccessibleButton.displayName = 'AccessibleButton';

interface AccessibleIconButtonProps extends ButtonProps {
  'aria-label': string;
  tooltip?: string;
  icon: React.ReactNode;
}

export const AccessibleIconButton = forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
  ({ 'aria-label': ariaLabel, tooltip, icon, ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        {...props}
      >
        {icon}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip title={tooltip} arrow>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

AccessibleIconButton.displayName = 'AccessibleIconButton';

export default AccessibleButton;
