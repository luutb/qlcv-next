import type { ButtonHTMLAttributes, ReactNode } from "react";
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; label: string };
export function IconButton({ children, label, className = "", ...props }: IconButtonProps) { return <button {...props} className={`shared-icon-button ${className}`} type={props.type ?? "button"} aria-label={label}>{children}</button>; }
