"use client";

export function TaskDetailDrawer({ title, onClose }: { title: string | null; onClose: () => void }) {
  if (!title) return null;
  return <><button className="drawer-overlay" type="button" aria-label="Đóng chi tiết công việc" onClick={onClose} /><aside className="detail-drawer task-drawer" role="dialog" aria-modal="true" aria-label={`Chi tiết ${title}`}><header><div><p className="eyebrow">Task detail</p><h2>{title}</h2></div><button className="drawer-close" type="button" aria-label="Đóng" onClick={onClose}>×</button></header><section className="drawer-content"><p className="drawer-empty">Chi tiết công việc và thao tác chỉnh sửa sẽ được nạp từ task detail API.</p></section></aside></>;
}
