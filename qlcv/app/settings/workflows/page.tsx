import { redirect } from "next/navigation";

export default function LegacyWorkflowSettingsRoute() {
  redirect("/settings/workflow-templates");
}
