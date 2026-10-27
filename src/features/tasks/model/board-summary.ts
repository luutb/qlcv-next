import type { BoardColumn } from "./board";

export type BoardSummary = {
  total: number;
  complete: number;
  inProgress: number;
  review: number;
  toDo: number;
  cancelled: number;
  percent: number;
};

export function summarizeBoard(columns: BoardColumn[]): BoardSummary {
  const summary: Omit<BoardSummary, "percent"> = {
    total: 0,
    complete: 0,
    inProgress: 0,
    review: 0,
    toDo: 0,
    cancelled: 0,
  };

  for (const column of columns) {
    const name = column.name.trim().toLocaleLowerCase();
    for (const task of column.tasks) {
      summary.total += 1;
      if (task.status === "DONE" || column.status === "DONE" || column.tone === "done" || name.includes("hoàn thành") || name === "done") summary.complete += 1;
      else if (task.status === "CANCELLED" || column.status === "CANCELLED") summary.cancelled += 1;
      else if (column.tone === "review" || name.includes("review") || name.includes("duyệt")) summary.review += 1;
      else if (task.status === "DOING" || column.status === "DOING" || column.tone === "progress") summary.inProgress += 1;
      else summary.toDo += 1;
    }
  }

  return { ...summary, percent: summary.total ? Math.round((summary.complete / summary.total) * 100) : 0 };
}
