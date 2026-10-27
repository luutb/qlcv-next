"use client";

// Layout dedicated to platform pages; receives identity and navigation as props.
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { WorkhubIcon } from "@/components/atoms";

type Props = { children: ReactNode; title: string; description: string; username: string; preview: boolean; navigation: ReadonlyArray<{ id: string; href: string; title: string; icon: string }>; activeSection: string; onSignOut: () => void };
export function PlatformLayout({ children, title, description, username, preview, navigation, activeSection, onSignOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="platform-shell">
    <aside className="platform-sidebar">
      <div className="platform-brand"><span><WorkhubIcon name="grid" size={21} /></span><div><strong>WorkHub</strong><small>Quản trị hệ thống</small></div></div>
      <button className="platform-menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="platform-navigation"><WorkhubIcon name="menu" size={18} /> Điều hướng</button>
      <div className="platform-scope"><span /><div><strong>{preview ? "Xem trước Super Admin" : "Super Admin"}</strong><small>Không gian quản trị nền tảng</small></div></div>
      <nav id="platform-navigation" className={menuOpen ? "is-open" : ""} aria-label="Quản trị hệ thống">{navigation.map((item) => <Link key={item.id} href={item.href} aria-current={activeSection === item.id ? "page" : undefined} onClick={() => setMenuOpen(false)}><WorkhubIcon name={item.icon} size={19} /><span>{item.title}</span>{activeSection === item.id && <WorkhubIcon name="arrow" size={15} />}</Link>)}</nav>
      <div className="platform-sidebar-note"><WorkhubIcon name="settings" size={19} /><strong>Phạm vi được tách riêng</strong><p>Quản lý tài khoản và cấu hình hệ thống. Dữ liệu nghiệp vụ được xử lý trong khu Admin.</p></div>
      <div className="platform-identity"><span>{username.slice(0, 2).toUpperCase() || "?"}</span><div><strong>{username || "Tài khoản quản trị"}</strong><small>{preview ? "Đang xem trước giao diện" : "Quản trị nền tảng"}</small></div></div>
    </aside>
    <div className="platform-main"><header className="platform-topbar"><div><span>Hệ thống</span><span aria-hidden="true">/</span><strong>{title}</strong></div><div>{preview && <Link href="/admin">Về khu Admin</Link>}<button type="button" onClick={onSignOut}>Đăng xuất</button></div></header>
      <main id="main-content" className="platform-content"><div className="platform-page-heading"><div><h1>{activeSection === "overview" ? "Tổng quan hệ thống" : title}</h1><p>{description}</p></div><span className="platform-environment">{preview ? "Bản xem trước" : "Quản trị nền tảng"}</span></div>
        {preview && <div className="platform-connection-notice" role="status"><span className="platform-notice-icon"><WorkhubIcon name="settings" size={20} /></span><div><strong>Bạn đang xem trước giao diện Super Admin</strong><p>Các biểu mẫu có thể mở để xem thiết kế. Chế độ này không gọi API hệ thống hoặc lưu thay đổi.</p></div></div>}
        {children}
        <footer className="platform-footer"><span>WorkHub · Quản trị nền tảng</span><span>Admin và Super Admin có phạm vi truy cập riêng</span></footer>
      </main>
    </div>
  </div>;
}
