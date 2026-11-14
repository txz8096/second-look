import { readFile } from "node:fs/promises";
import path from "node:path";

// The sample report is the skill's report template, served as is. There is no
// second copy: edit plugins/second-look/skills/second-look/report-template.html.
export const dynamic = "force-static";

const TEMPLATE = path.join(
  process.cwd(),
  "plugins/second-look/skills/second-look/report-template.html",
);

export async function GET() {
  return new Response(await readFile(TEMPLATE, "utf8"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
