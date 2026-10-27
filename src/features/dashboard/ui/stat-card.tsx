import Link from "next/link";
import { WorkhubIcon } from "@/components/atoms";

type StatCardProps = { title: string; value: string; icon: string; tone: string; href: string; trend?: string };

export function StatCard({ title, value, icon, tone, href, trend }: StatCardProps) {
  return <Link className="workhub-metric stat-card-link" href={href}><span className={`metric-icon metric-${tone}`}><WorkhubIcon name={icon} size={22} /></span><div><p>{title}</p><strong>{value}</strong><small>{trend ?? "Dữ liệu từ API"}</small></div></Link>;
}
