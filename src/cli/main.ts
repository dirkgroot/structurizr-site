import { createRequire } from "node:module";
import { generateSite } from "./commands/generate-site.js";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string };

const USAGE = `Usage: structurizr-site <command> [options]

Commands:
  generate-site    Emit a deployable directory containing the prebuilt SPA.

Options:
  -o, --output <dir>   Output directory (default: build)
  -h, --help           Show this help
  -v, --version        Show the version
`;

export async function run(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case undefined:
    case "generate-site":
      await generateSite({ output: parseOutput(rest) });
      return;
    case "-h":
    case "--help":
      process.stdout.write(USAGE);
      return;
    case "-v":
    case "--version":
      process.stdout.write(`${pkg.version}\n`);
      return;
    default:
      throw new Error(`unknown command "${command}"\n\n${USAGE}`);
  }
}

function parseOutput(args: string[]): string | undefined {
  let output: string | undefined;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "-o" || arg === "--output") {
      output = args[i + 1];
      if (output === undefined) {
        throw new Error(`missing value for ${arg}`);
      }
      i += 1;
    } else if (arg.startsWith("--output=")) {
      output = arg.slice("--output=".length);
    } else {
      throw new Error(`unknown option "${arg}"`);
    }
  }
  return output;
}
