import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { devWorkspace } from "./dev/dev-workspace";

// The web app lives in src/web and is emitted to dist/web. The CLI copies that
// directory into the generated output (see src/cli/assembly/assemble.ts).
export default defineConfig({
  root: "src/web",
  // Relative asset URLs so a generated site works under any static-host base
  // path (e.g. a GitHub Pages project site at /structurizr-site/), not just "/".
  base: "./",
  plugins: [react(), tailwindcss(), devWorkspace()],
  resolve: {
    // `@` points at the web app tree so shadcn's `@/components/...` imports resolve
    // (see components.json and lode/architecture/ui.md). `@shared` points at the
    // runtime-agnostic contracts the web app and CLI both import.
    alias: {
      "@": fileURLToPath(new URL("./src/web", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
  },
});
