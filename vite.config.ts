import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { devWorkspace } from "./dev/dev-workspace.ts";

// The web app lives in src/web and is emitted to dist/web. The CLI copies that
// directory into the generated output (see src/cli/assembly/assemble.ts).
export default defineConfig({
  root: "src/web",
  plugins: [react(), tailwindcss(), devWorkspace()],
  resolve: {
    // `@` points at the web app tree so shadcn's `@/components/...` imports resolve
    // (see components.json and lode/architecture/ui.md).
    alias: {
      "@": fileURLToPath(new URL("./src/web", import.meta.url)),
    },
  },
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
  },
});
