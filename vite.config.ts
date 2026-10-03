import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The SPA lives in src/spa and is emitted to dist/spa. The CLI copies that
// directory into the generated output (see src/cli/assembly/assemble.ts).
export default defineConfig({
  root: "src/spa",
  plugins: [react()],
  build: {
    outDir: "../../dist/spa",
    emptyOutDir: true,
  },
});
