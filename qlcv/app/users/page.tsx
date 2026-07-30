import { Suspense } from "react";
import { UsersListPage } from "../../src/features/users/list/UsersListPage";

export default function UsersRoute() {
  return (
    <Suspense fallback={null}>
      <UsersListPage />
    </Suspense>
  );
}
