import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");
const violations = [];

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(fullPath));
    else if (/\.(ts|tsx)$/.test(entry.name)) result.push(fullPath);
  }
  return result;
}

function relative(file) { return path.relative(process.cwd(), file); }
function add(file, rule) { violations.push(`${relative(file)}: ${rule}`); }

for (const file of await filesIn(root)) {
  const source = await readFile(file, "utf8");
  const filePath = relative(file);

  if (filePath.startsWith("src/app/") && file.endsWith("/page.tsx")) {
    if (/fetch\s*\(|process\.env|from ["']@\/services|from ["']@\/api/.test(source)) add(file, "route page must orchestrate; move transport/config/business logic to a feature or service");
  }
  if (filePath.includes("/components/atoms/")) {
    if (/from ["']@\/features|from ["']@\/services|from ["']next\//.test(source)) add(file, "atom cannot depend on feature, service, or framework routing");
  }
  if (filePath.includes("/components/molecules/")) {
    if (/fetch\s*\(|process\.env|from ["']@\/features|from ["']@\/services/.test(source)) add(file, "molecule cannot call APIs, read env, or depend on feature services");
  }
  if (filePath.startsWith("src/features/") && filePath.includes("/ui/") && /process\.env/.test(source)) add(file, "feature UI cannot read environment directly");
}

const requiredFiles = ["src/config/environment.ts", "src/services/http/index.ts", "src/services/endpoints/index.ts", "src/features/dashboard/index.ts", "src/features/projects/index.ts", "src/components/atoms/index.ts", "src/components/molecules/index.ts", "src/components/templates/index.ts"];
for (const requiredFile of requiredFiles) {
  try { await stat(path.resolve(requiredFile)); } catch { violations.push(`${requiredFile}: required architecture boundary is missing`); }
}

if (violations.length) {
  console.error("Frontend architecture check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}
console.log("Frontend architecture check passed: route, layer, env, service and feature boundaries are present.");
