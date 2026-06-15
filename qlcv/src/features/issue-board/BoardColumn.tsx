import type { IssueBoardColumn as IssueBoardColumnType } from "./issue-board.types";

export function BoardColumn({ column }: { column: IssueBoardColumnType }) {
  return <section>{column.title}</section>;
}
