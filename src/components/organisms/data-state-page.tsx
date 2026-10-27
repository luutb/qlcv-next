import Link from "next/link";

type DataStatePageProps = { eyebrow: string; title: string; description: string; endpoint: string; actionLabel?: string; actionHref?: string };

export function DataStatePage({ eyebrow, title, description, endpoint, actionLabel = "Về tổng quan", actionHref = "/" }: DataStatePageProps) {
  return <main id="main-content" className="state-page"><Link className="back-link" href="/">← Tổng quan</Link><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="state-description">{description}</p><section className="state-card" aria-labelledby="state-title"><span className="state-icon" aria-hidden="true">—</span><div><h2 id="state-title">Chưa có dữ liệu runtime</h2><p>Màn hình đã sẵn sàng cho contract canonical <code>{endpoint}</code>. Dữ liệu chỉ xuất hiện sau khi API trả response hợp lệ; không suy diễn từ danh sách phân trang hoặc fixture.</p></div></section><Link className="quiet-button state-action" href={actionHref}>{actionLabel}</Link></main>;
}
