import type { ReactNode } from "react";
import { AdminPanelSettings, Assessment, Assignment, Category, Dashboard, Description, Home, Inventory2, People, Person, ReceiptLong, Settings, TaskAlt, ViewKanban, WorkHistory } from "@mui/icons-material";
import type { KnownRole } from "./roles";

export type NavItem = { label: string; href: string; icon: ReactNode; roles?: KnownRole[]; always?: boolean };

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <Dashboard fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Work Board", href: "/work", icon: <TaskAlt fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Workflow Board", href: "/projects/board", icon: <ViewKanban fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Projects", href: "/projects", icon: <Assignment fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Customers", href: "/customers", icon: <Category fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Documents", href: "/documents", icon: <Description fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Time Entries", href: "/time-entries", icon: <WorkHistory fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Invoices", href: "/invoices", icon: <ReceiptLong fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Labels", href: "/labels", icon: <Inventory2 fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER"] },
  { label: "Audit Logs", href: "/audit-logs", icon: <Assessment fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "OKR", href: "/okr", icon: <Home fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Reports", href: "/reports", icon: <Assessment fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  { label: "Workflow Templates", href: "/settings/workflow-templates", icon: <Settings fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER"] },
  { label: "User Management", href: "/users", icon: <People fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER"] },
  { label: "Profile", href: "/settings/profile", icon: <Person fontSize="small" />, always: true },
  { label: "Tenant Settings", href: "/admin/tenant-settings", icon: <Settings fontSize="small" />, roles: ["SUPER_ADMIN"] },
  { label: "Admin Purge", href: "/admin/purge", icon: <AdminPanelSettings fontSize="small" />, roles: ["SUPER_ADMIN"] },
];

export function getVisibleNavItems(role: string) {
  return NAV_ITEMS.filter((item) => item.always || item.roles?.includes(role as KnownRole));
}
