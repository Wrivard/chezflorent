import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Silence request logging and avoid spawning the pino-pretty worker thread
    // during tests (keeps the run output clean and lets the process exit).
    env: { LOG_LEVEL: "silent" },
    testTimeout: 20000,
    hookTimeout: 20000,
    // The suite shares a single Postgres connection and mutates real rows, so
    // run files sequentially to keep state predictable.
    fileParallelism: false,
  },
});
