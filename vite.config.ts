import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// The SPA lives in src/spa and is emitted to dist/spa. The CLI copies that
// directory into the generated output (see src/cli/assembly/assemble.ts).
export default defineConfig({
  root: "src/spa",
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@` points at the SPA tree so shadcn's `@/components/...` imports resolve
    // (see components.json and lode/architecture/ui.md).
    alias: {
      "@": fileURLToPath(new URL("./src/spa", import.meta.url)),
    },
  },
  build: {
    outDir: "../../dist/spa",
    emptyOutDir: true,
  },
});
