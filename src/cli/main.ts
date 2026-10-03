import { createRequire } from "node:module";
import { generateSite } from "./commands/generate-site.js";
import { serveSite } from "./commands/serve-site.js";

// Injected at build time for the compiled binary (see packaging/binary/build.mjs).
// When running from source, the guard is false and the version comes from package.json.
declare const __STRUCTURIZR_SITE_VERSION__: string | undefined;

function readVersion(): string {
  if (typeof __STRUCTURIZR_SITE_VERSION__ !== "undefined") {
    return __STRUCTURIZR_SITE_VERSION__;
  }
  const require = createRequire(import.meta.url);
  return (require("../../package.json") as { version: string }).version;
}

const USAGE = `Usage: structurizr-site <command> [options]

Commands:
  generate-site    Emit a deployable directory containing the prebuilt web app.
  serve            Generate the site and serve it on http://localhost:8080.

Options:
  -o, --output <dir>            Output directory (default: build)
  -p, --port <port>             Port to serve on (default: 8080; serve only)
  -w, --workspace-file <path>   Structurizr workspace file (.dsl or .json) to export;
                                omit to emit the web app only
      --structurizr <command>   Structurizr backend command (default: structurizr on PATH)
  -h, --help                    Show this help
  -v, --version                 Show the version
`;

export async function run(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case undefined:
    case "generate-site": {
      const options = parseOptions(rest, { allowPort: false });
      await generateSite({
        output: options.output,
        workspaceFile: options.workspaceFile,
        structurizr: options.structurizr,
      });
      return;
    }
    case "serve": {
      const options = parseOptions(rest, { allowPort: true });
      await serveSite({
        output: options.output,
        port: options.port,
        workspaceFile: options.workspaceFile,
        structurizr: options.structurizr,
      });
      return;
    }
    case "-h":
    case "--help":
      process.stdout.write(USAGE);
      return;
    case "-v":
    case "--version":
      process.stdout.write(`${readVersion()}\n`);
      return;
    default:
      throw new Error(`unknown command "${command}"\n\n${USAGE}`);
  }
}

interface ParsedOptions {
  output?: string;
  port?: number;
  workspaceFile?: string;
  structurizr?: string;
}

function parseOptions(args: string[], config: { allowPort: boolean }): ParsedOptions {
  const options: ParsedOptions = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "-o" || arg === "--output") {
      options.output = readValue(args, (i += 1), arg);
    } else if (arg.startsWith("--output=")) {
      options.output = arg.slice("--output=".length);
    } else if (arg === "-w" || arg === "--workspace-file") {
      options.workspaceFile = readValue(args, (i += 1), arg);
    } else if (arg.startsWith("--workspace-file=")) {
      options.workspaceFile = arg.slice("--workspace-file=".length);
    } else if (arg === "--structurizr") {
      options.structurizr = readValue(args, (i += 1), arg);
    } else if (arg.startsWith("--structurizr=")) {
      options.structurizr = arg.slice("--structurizr=".length);
    } else if (config.allowPort && (arg === "-p" || arg === "--port")) {
      options.port = parsePort(readValue(args, (i += 1), arg));
    } else if (config.allowPort && arg.startsWith("--port=")) {
      options.port = parsePort(arg.slice("--port=".length));
    } else {
      throw new Error(`unknown option "${arg}"`);
    }
  }
  return options;
}

function readValue(args: string[], index: number, option: string): string {
  const value = args[index];
  if (value === undefined) {
    throw new Error(`missing value for ${option}`);
  }
  return value;
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`invalid port "${value}"`);
  }
  return port;
}
