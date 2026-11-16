import TestInfo from "./TestInfo";

/**
 * Server component: reads ?level= on the server so the level content is in the
 * HTML search engines download (the old client-only version sent "Loading...").
 */
export default async function TestInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string | string[] }>;
}) {
  const { level } = await searchParams;
  const parsed = parseInt(Array.isArray(level) ? level[0] : level || "1", 10);
  const levelNumber = Number.isFinite(parsed) ? Math.min(5, Math.max(1, parsed)) : 1;

  // TestInfo uses a 0-based index
  return <TestInfo initialLevel={levelNumber - 1} />;
}
