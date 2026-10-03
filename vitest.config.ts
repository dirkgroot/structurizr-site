import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Two Vitest projects: CLI/shared run in Node, the React SPA runs in jsdom with
// Testing Library. This is a separate config from vite.config.ts so the SPA
// build root (src/spa) does not leak into test discovery.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/cli/**/*.test.ts", "src/shared/**/*.test.ts"],
        },
      },
      {
        plugins: [react()],
        test: {
          name: "spa",
          environment: "jsdom",
          include: ["src/spa/**/*.test.ts", "src/spa/**/*.test.tsx"],
          setupFiles: ["./test/setup/spa.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/spa/vite-env.d.ts"],
    },
  },
});
