#!/usr/bin/env node
import { run } from "./main";

run(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`structurizr-site: ${message}`);
  process.exitCode = 1;
});
