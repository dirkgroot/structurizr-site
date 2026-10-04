import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Two Vitest projects: CLI/shared run in Node, the React web app runs in jsdom with
// Testing Library. This is a separate config from vite.config.ts so the web app
// build root (src/web) does not leak into test discovery.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/web", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: [
            "src/cli/**/*.test.ts",
            "src/shared/**/*.test.ts",
            "test/e2e/**/*.test.ts",
            "dev/**/*.test.ts",
          ],
        },
      },
      {
        plugins: [react()],
        test: {
          name: "web",
          environment: "jsdom",
          include: ["src/web/**/*.test.ts", "src/web/**/*.test.tsx"],
          setupFiles: ["./test/setup/web.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/web/vite-env.d.ts",
        // Generated from the Structurizr OpenAPI spec; type-only.
        "src/shared/workspace/schema.d.ts",
        // Vendored shadcn/ui components and generated hooks are not unit tested;
        // see lode/architecture/ui.md.
        "src/web/components/ui/**",
        "src/web/hooks/**",
      ],
    },
  },
});
