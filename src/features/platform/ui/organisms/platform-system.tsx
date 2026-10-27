import Link from "next/link";
import { platformHref, type PlatformSystemView } from "../../model/platform-navigation";
import { PlatformAccounts } from "./platform-accounts";
import { PlatformAudit } from "./platform-audit";
import { PlatformSettings } from "./platform-settings";
export function PlatformSystem({ preview, view }: { preview: boolean; view: PlatformSystemView }) {
  return <><nav className="tenant-detail-tabs" aria-label="Hạng mục hệ thống">{([{ id: "accounts", label: "Tài khoản quản trị" }, { id: "audit", label: "Nhật ký hệ thống" }, { id: "settings", label: "Cài đặt & quyền" }] as const).map((item) => <Link key={item.id} href={platformHref(preview, item.id)} aria-current={view === item.id ? "page" : undefined}>{item.label}</Link>)}</nav><div key={view}>{view === "accounts" && <PlatformAccounts preview={preview} />}{view === "audit" && <PlatformAudit preview={preview} />}{view === "settings" && <PlatformSettings preview={preview} />}</div></>;
}
