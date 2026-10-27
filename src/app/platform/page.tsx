import { PlatformScreen } from "@/features/platform";
export default async function Page({ searchParams }: { searchParams: Promise<{ section?: string | string[]; tenant?: string | string[]; tab?: string | string[]; view?: string | string[] }> }) {
  const query = await searchParams;
  return <PlatformScreen section={query.section} tenant={query.tenant} tab={query.tab} view={query.view} />;
}
