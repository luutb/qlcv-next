import type { ReactNode } from "react";
type WorkspaceTemplateProps = { variant?: "dashboard" | "project"; sidebar: ReactNode; topbar: ReactNode; children: ReactNode; detail?: ReactNode };
export function WorkspaceTemplate({ variant = "dashboard", sidebar, topbar, children, detail }: WorkspaceTemplateProps) {
  if (variant === "project") return <div className="project-workspace">{topbar}<div className="project-body">{sidebar}<main id="main-content" className="project-main" tabIndex={0} aria-label="Nội dung công việc">{children}</main>{detail}</div></div>;
  return <div className="workhub-shell">{sidebar}<div className="workhub-main">{topbar}{children}</div></div>;
}
