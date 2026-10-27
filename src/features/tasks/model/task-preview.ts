import type { Task } from "../api";

export function taskDeadline(task: Pick<Task, "due_at" | "due_date" | "status">, now = new Date()) {
  const completed = task.status === "DONE" || task.status === "CANCELLED";
  // The current backend also sends a date-only due_at. Treat that as a whole day.
  if (task.due_at && /T/.test(task.due_at)) {
    const date = new Date(task.due_at);
    if (!Number.isNaN(date.getTime())) return {
      value: task.due_at,
      label: date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      overdue: !completed && date.getTime() < now.getTime(),
    };
  }
  const value = (task.due_date || task.due_at)?.slice(0, 10);
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10))) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { value, label: date.toLocaleDateString("vi-VN"), overdue: !completed && date < today };
    }
  }
  return { value: undefined, label: "Chưa có hạn", overdue: false };
}

export function personInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words.at(-1)![0]}` : words[0]?.slice(0, 2) || "?").toLocaleUpperCase("vi-VN");
}
