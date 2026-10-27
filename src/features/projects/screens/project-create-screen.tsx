import Link from "next/link";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { ProjectCreateForm } from "../ui/organisms/project-create-form";

export function ProjectCreateScreen() {
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/projects" />} topbar={<WorkhubTopbar />}>
    <main id="main-content" className="projects-directory">
      <header className="projects-directory-heading"><div><Link href="/projects">← Danh sách dự án</Link><h1>Tạo dự án</h1><p>Đặt tên và mã riêng để bắt đầu quản lý công việc.</p></div></header>
      <section className="projects-directory-surface project-create-surface" aria-label="Thông tin dự án"><ProjectCreateForm /></section>
    </main>
  </WorkspaceTemplate>;
}
