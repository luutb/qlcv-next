export const platformSections = [
  { id: "overview", title: "Tổng quan", icon: "grid", capability: "platform.overview.read", description: "Theo dõi tenant, tài khoản và hoạt động của nền tảng." },
  { id: "tenants", title: "Tenant", icon: "folder", capability: "platform.tenants.read", description: "Thông tin đơn vị, thành viên, tài nguyên và gói cước trong cùng một nơi." },
  { id: "plans", title: "Gói cước", icon: "trend", capability: "platform.plans.read", description: "Cấu hình phí niêm yết, chu kỳ và hạn mức theo từng gói." },
  { id: "system", title: "Hệ thống", icon: "settings", capability: "platform.access", description: "Tài khoản quản trị, nhật ký hệ thống và quyền đang có hiệu lực." },
] as const;
export type PlatformSection = typeof platformSections[number]["id"];
export type PlatformDestination = PlatformSection | "organizations" | "accounts" | "audit" | "settings";
export type PlatformSystemView = "accounts" | "audit" | "settings";
export function resolvePlatformSection(value?: string | string[]): PlatformSection {
  if (value === "organizations") return "tenants";
  if (value === "accounts" || value === "audit" || value === "settings") return "system";
  return platformSections.find((section) => section.id === value)?.id ?? "overview";
}
export function resolveSystemView(section?: string | string[], view?: string | string[]): PlatformSystemView {
  const value = section === "accounts" || section === "audit" || section === "settings" ? section : view;
  return value === "audit" || value === "settings" ? value : "accounts";
}
export function platformHref(preview: boolean, section: PlatformDestination) {
  const resolved = resolvePlatformSection(section);
  const params = new URLSearchParams({ section: resolved });
  if (section === "accounts" || section === "audit" || section === "settings") params.set("view", section);
  return `${preview ? "/admin/platform-preview" : "/platform"}?${params}`;
}
export const tenantTabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "members", label: "Thành viên & Admin" },
  { id: "resources", label: "Tài nguyên" },
  { id: "subscription", label: "Gói cước" },
  { id: "activity", label: "Lịch sử" },
] as const;
export type TenantTab = typeof tenantTabs[number]["id"];
export function resolveTenantTab(value?: string | string[]): TenantTab { return tenantTabs.find((tab) => tab.id === value)?.id ?? "overview"; }
export function tenantHref(preview: boolean, id: string, tab: TenantTab = "overview") { return `${platformHref(preview, "tenants")}&tenant=${encodeURIComponent(id)}&tab=${tab}`; }
