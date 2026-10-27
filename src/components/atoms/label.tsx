import type { LabelHTMLAttributes, ReactNode } from "react";
export function Label({ children, className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) { return <label {...props} className={`shared-label ${className}`}>{children}</label>; }
