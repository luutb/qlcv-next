import type { Task, TaskStatus } from "../api";

export type BoardColumn = { id: string; name: string; tone: string; tasks: Task[]; status?: TaskStatus };
export type BoardSource = "workflow" | "status-fallback";
export type IssueBoardData = { columns: BoardColumn[]; source: BoardSource };
export const taskStatuses: { id: TaskStatus; name: string; tone: string }[] = [
  { id: "TODO", name: "To do", tone: "todo" },
  { id: "DOING", name: "Đang xử lý", tone: "progress" },
  { id: "DONE", name: "Done", tone: "done" },
  { id: "CANCELLED", name: "Đã huỷ", tone: "cancelled" },
];
export const priorities = { LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn cấp" };

/** Reorder the full column, including cards currently hidden by a filter. */
export function planMove(columns: BoardColumn[], taskId: string, targetId: string, beforeId?: string) {
  const source = columns.find((column) => column.tasks.some((task) => task.id === taskId));
  const target = columns.find((column) => column.id === targetId);
  const task = source?.tasks.find((item) => item.id === taskId);
  if (!source || !target || !task || beforeId === taskId) return null;
  const targetTasks = target.tasks.filter((item) => item.id !== taskId);
  const index = beforeId ? targetTasks.findIndex((item) => item.id === beforeId) : targetTasks.length;
  targetTasks.splice(index < 0 ? targetTasks.length : index, 0, task);
  const sourceTasks = source.id === target.id ? targetTasks : source.tasks.filter((item) => item.id !== taskId);
  const items = source.id === target.id
    ? targetTasks.map((item, position) => ({ id: item.id, position }))
    : [
        ...sourceTasks.map((item, position) => ({ id: item.id, position })),
        ...targetTasks.map((item, position) => ({ id: item.id, position })),
      ];
  return { source, target, task, items };
}
