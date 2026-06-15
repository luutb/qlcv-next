import type { Issue } from "./issue-board.types";

export function IssueDrawer({ issue }: { issue?: Issue | null }) {
  if (!issue) {
    return null;
  }

  return <aside>{issue.title}</aside>;
}
