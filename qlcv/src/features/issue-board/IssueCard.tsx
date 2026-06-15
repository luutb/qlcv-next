import type { Issue } from "./issue-board.types";

export function IssueCard({ issue }: { issue: Issue }) {
  return <article>{issue.title}</article>;
}
