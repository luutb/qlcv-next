'use client';

import React from 'react';
import { Label } from '@/types/label.types';

interface LabelBadgeProps {
  label: Partial<Label> | {
    name: string;
    color: string;
    bg_color: string;
    icon?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-1.5 text-base',
  lg: 'px-4 py-2 text-lg'
};

export function LabelBadge({ label, size = 'sm', showIcon = true, className = '' }: LabelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${sizeClasses[size]} ${className}`}
      style={{
        color: label.color,
        backgroundColor: label.bg_color,
        border: `1px solid ${label.color}33`
      }}
    >
      {showIcon && label.icon && (
        <span className="flex-shrink-0">{label.icon}</span>
      )}
      <span className="truncate">{label.name}</span>
    </span>
  );
}
