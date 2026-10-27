import type { ButtonHTMLAttributes, ReactNode } from "react";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "quiet" | "danger" };
export function Button({ children, variant = "primary", className = "", type = "button", ...props }: ButtonProps) { return <button {...props} className={`shared-button shared-button-${variant} ${className}`} type={type}>{children}</button>; }
