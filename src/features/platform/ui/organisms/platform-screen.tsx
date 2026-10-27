"use client";

import "../platform.css";
import "../tenant.css";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout, useCurrentUserQuery } from "@/features/auth";
import { authorizationCacheScope, isPlatformAdministrator } from "@/features/auth/model/current-user";
import { platformHref, platformSections, resolvePlatformSection, resolveSystemView } from "../../model/platform-navigation";
import { PlatformLayout } from "../platform-layout";
import { PlatformOverview } from "./platform-overview";
import { PlatformTenants } from "./platform-tenants";
import { PlatformPlans } from "./platform-plans";
import { TenantDetailScreen } from "./tenant-detail";
import { PlatformSystem } from "./platform-system";

export function PlatformScreen({ preview = false, section: sectionParam, tenant, tab, view }: { preview?: boolean; section?: string | string[]; tenant?: string | string[]; tab?: string | string[]; view?: string | string[] }) {
  const user = useCurrentUserQuery();
  const router = useRouter();
  const client = useQueryClient();
  const section = resolvePlatformSection(sectionParam);
  const active = platformSections.find((item) => item.id === section) ?? platformSections[0];
  const navigation = platformSections.filter((item) => preview || (isPlatformAdministrator(user.data) && user.data?.actions?.[item.capability] === true)).map((item) => ({ ...item, href: platformHref(preview, item.id) }));
  const signOut = async () => { const revoked = await logout(); await client.cancelQueries(); client.clear(); router.replace(revoked ? "/login" : "/login?reason=logout-failed"); };
  return <PlatformLayout title={active.title} description={active.description} username={user.data?.username ?? ""} preview={preview} navigation={navigation} activeSection={section} onSignOut={signOut}>
    <div key={`${section}:${authorizationCacheScope(user.data)}`}>
      {section === "overview" && <PlatformOverview preview={preview} />}
      {section === "tenants" && (typeof tenant === "string" && tenant ? <TenantDetailScreen key={tenant} tenantId={tenant} tab={tab} preview={preview} /> : <PlatformTenants preview={preview} />)}
      {section === "plans" && <PlatformPlans preview={preview} />}
      {section === "system" && <PlatformSystem preview={preview} view={resolveSystemView(sectionParam, view)} />}
    </div>
  </PlatformLayout>;
}
