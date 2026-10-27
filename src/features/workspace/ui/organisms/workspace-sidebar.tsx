"use client";

import { useOrganizationName } from "@/features/administration/hooks";
import { useState } from "react";
import { canAccessRoute, AccountDialog } from "@/features/auth";
import Link from "next/link";
import { workspaceNavigation } from "@/config/navigation";
import { WorkhubAvatar, WorkhubIcon } from "@/components/atoms";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";

export function WorkhubSidebar({ activeHref, variant = "dashboard" }: { activeHref: string; variant?: "dashboard" | "project" }) {
  const user = useCurrentUserQuery();
  const organization = useOrganizationName();
  const [accountOpen, setAccountOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const projects = useProjectsQuery({ limit: 5, offset: 0 });
  const isProject = variant === "project";
  return <aside className={isProject ? "project-sidebar" : "workhub-sidebar"}>
    <div className="workspace-brand-row"><Link href="/" className="workhub-logo"><span className="workhub-logo-mark"><WorkhubIcon name="grid" size={16} /></span><strong>WorkHub</strong></Link><button className="workspace-nav-toggle" type="button" aria-expanded={navigationOpen} aria-controls="workspace-navigation" onClick={() => setNavigationOpen((open) => !open)}><WorkhubIcon name="menu" size={20} /><span>Điều hướng</span></button></div>
    <nav id="workspace-navigation" className={`workhub-nav${navigationOpen ? " is-open" : ""}`} aria-label="Điều hướng chính">{workspaceNavigation.filter(([, , href]) => canAccessRoute(user.data, href)).map(([label, icon, href]) => <Link aria-current={href === activeHref ? "page" : undefined} className={`workhub-nav-link ${href === activeHref ? "is-active" : ""}`} href={href} key={label} onClick={() => setNavigationOpen(false)}><WorkhubIcon name={icon} size={18} /><span>{label}</span></Link>)}</nav>
    {canAccessRoute(user.data, "/projects") && <div className={isProject ? "project-recent" : "workhub-side-projects"}><p>Dự án</p>{projects.data?.projects.map((item, index) => <Link href={`/projects/board?project_id=${item.id}`} key={item.id}><span className={`mini-project mini-${index}`}>{item.name[0]}</span>{item.name}</Link>)}{projects.error && <p>Không tải được dự án.</p>}</div>}
    <div className="workhub-upgrade"><strong>{organization.data?.name ?? "Không gian làm việc"}</strong><p>{user.data?.tenant_plan ?? "Quản lý công việc cùng đội ngũ của bạn."}</p><button className="workspace-settings-link" onClick={() => setAccountOpen(true)}>Quản lý tài khoản</button></div>
    {!isProject && <button onClick={() => setAccountOpen(true)} className="workhub-account"><WorkhubAvatar initials={user.data?.username.slice(0, 2).toUpperCase() ?? "?"} tone="blue" /><span><strong>{user.data?.username ?? "Tài khoản"}</strong><small>{user.data?.email ?? "Đăng nhập để tiếp tục"}</small></span><WorkhubIcon name="chevron" size={15} /></button>}
  {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}</aside>;
}
