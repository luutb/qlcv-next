import type { ReactNode } from "react";
export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "neutral" }) { return <span className={`shared-status-badge tone-${tone}`}>{children}</span>; }
