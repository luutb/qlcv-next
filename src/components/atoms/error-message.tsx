import type { ReactNode } from "react";
export function ErrorMessage({ children }: { children: ReactNode }) { return <p className="shared-error-message" role="alert">{children}</p>; }
