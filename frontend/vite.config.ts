import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

function parseEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function resolveClerkPublishableKey(
  envDir: string,
  mergedFromLoadEnv: Record<string, string>,
): string {
  let key = mergedFromLoadEnv.VITE_CLERK_PUBLISHABLE_KEY ?? "";
  if (key) return key;
  for (const fname of [".env.local", ".env"]) {
    const parsed = parseEnvFile(path.join(envDir, fname));
    if (parsed.VITE_CLERK_PUBLISHABLE_KEY) return parsed.VITE_CLERK_PUBLISHABLE_KEY;
  }
  return "";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, frontendRoot, "");
  const clerkPublishableKey = resolveClerkPublishableKey(frontendRoot, env);

  if (mode === "development") {
    console.log(`[vite] VITE_CLERK_PUBLISHABLE_KEY resolved length: ${clerkPublishableKey.length}`);
  }

  return {
    envDir: frontendRoot,
    root: frontendRoot,
    define: {
      "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(clerkPublishableKey),
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
