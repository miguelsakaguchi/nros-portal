import { createRequire } from "node:module";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { spawn } from "node:child_process";

globalThis.require = createRequire(import.meta.url);

const testDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(testDir, "../.test-dist");
const outputFile = path.join(outputDir, "auth-regressions.test.mjs");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await build({
  entryPoints: [path.join(testDir, "auth-regressions.test.ts")],
  outdir: outputDir,
  outExtension: { ".js": ".mjs" },
  platform: "node",
  bundle: true,
  format: "esm",
  sourcemap: "inline",
  external: [
    "*.node",
    "express",
    "cors",
    "pino",
    "pino-http",
    "pino-pretty",
    "cookie-parser",
    "drizzle-orm",
    "@workspace/db",
    "better-sqlite3",
    "canvas",
    "fsevents",
    "lightningcss",
    "pg-native",
  ],
});

try {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--test", outputFile], {
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Test process exited with ${signal ? `signal ${signal}` : `code ${code}`}`,
        ),
      );
    });
  });
} finally {
  await rm(outputDir, { recursive: true, force: true });
}