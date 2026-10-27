import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";

export function ProjectSidebar() { return <WorkhubSidebar activeHref="/work" variant="project" />; }
export function ProjectTopbar() { return <WorkhubTopbar variant="project" />; }
