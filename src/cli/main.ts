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
  generate-site    Emit a deployable directory containing the prebuilt SPA.
  serve            Generate the site and serve it on http://localhost:8080.

Options:
  -o, --output <dir>   Output directory (default: build)
  -p, --port <port>    Port to serve on (default: 8080; serve only)
  -h, --help           Show this help
  -v, --version        Show the version
`;

export async function run(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case undefined:
    case "generate-site": {
      const options = parseOptions(rest, { allowPort: false });
      await generateSite({ output: options.output });
      return;
    }
    case "serve": {
      const options = parseOptions(rest, { allowPort: true });
      await serveSite({ output: options.output, port: options.port });
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
}

function parseOptions(args: string[], config: { allowPort: boolean }): ParsedOptions {
  const options: ParsedOptions = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "-o" || arg === "--output") {
      options.output = readValue(args, (i += 1), arg);
    } else if (arg.startsWith("--output=")) {
      options.output = arg.slice("--output=".length);
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
