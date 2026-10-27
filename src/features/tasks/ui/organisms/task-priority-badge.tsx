import type { TaskPriority } from "../../api";
import { priorities } from "../../model/board";

const symbols: Record<TaskPriority, string> = { LOW: "↓", MEDIUM: "=", HIGH: "↑", URGENT: "!" };

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`priority task-priority p-${priority.toLowerCase()}`}>
    <span className="priority-symbol" aria-hidden="true">{symbols[priority]}</span>
    <span className="sr-only">Ưu tiên: </span>{priorities[priority]}
  </span>;
}
