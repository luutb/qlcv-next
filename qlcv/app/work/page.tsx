import { Suspense } from "react";
import { WorkBoardPage } from "@/features/work-board/WorkBoardPage";

export default function WorkRoute() {
  return (
    <Suspense fallback={null}>
      <WorkBoardPage />
    </Suspense>
  );
}
