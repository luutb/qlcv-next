"use client";

import { useEffect } from "react";
import { WorkhubIcon } from "@/components/atoms";

export function ProjectDetailDrawer({ name, onClose }: { name: string | null; onClose: () => void }) {
  useEffect(() => { if (!name) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [name, onClose]);
  if (!name) return null;
  return <><button className="drawer-overlay" type="button" aria-label="Đóng chi tiết dự án" onClick={onClose} /><aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`Chi tiết ${name}`}><header><span className="project-logo"><WorkhubIcon name="folder" size={24} /></span><div><p className="eyebrow">Project overview</p><h2>{name}</h2></div><button className="drawer-close" type="button" aria-label="Đóng" onClick={onClose}>×</button></header><nav className="drawer-tabs" aria-label="Các tab dự án"><button className="active" type="button">Tổng quan</button><button type="button">Công việc</button><button type="button">Thành viên</button><button type="button">Báo cáo</button></nav><section className="drawer-content"><div className="drawer-progress"><strong>78%</strong><span>Tiến độ dự án</span></div><div className="drawer-stats"><div><small>Công việc</small><strong>12/16</strong></div><div><small>Ngân sách</small><strong>185 triệu</strong></div><div><small>Hạn hoàn thành</small><strong>30/11/2026</strong></div></div><h3>Mô tả dự án</h3><p>Dữ liệu chi tiết dự án sẽ được kết nối từ project aggregate khi endpoint trả về đầy đủ.</p><h3>Thành viên</h3><p className="drawer-empty">Chưa có dữ liệu thành viên từ API.</p></section></aside></>;
}
