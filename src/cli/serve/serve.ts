import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, normalize, resolve, sep } from "node:path";

/** Port `serve` listens on when no `--port` is given. */
export const DEFAULT_PORT = 8080;

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export interface ServeOptions {
  port?: number;
}

export interface RunningServer {
  /** The port actually bound; resolves an ephemeral `port: 0` to the real one. */
  port: number;
  close(): Promise<void>;
}

/**
 * Serve `outputDir` as a static site. Unknown extensionless paths fall back to
 * `index.html` so client-side routes render the SPA shell; unknown files 404.
 * Requests are confined to `outputDir`.
 */
export async function serve(outputDir: string, options: ServeOptions = {}): Promise<RunningServer> {
  const root = resolve(outputDir);
  const server = createServer((request, response) => {
    void handleRequest(root, request, response);
  });

  const requestedPort = options.port ?? DEFAULT_PORT;
  await new Promise<void>((resolveListen, rejectListen) => {
    const onError = (error: Error): void => rejectListen(error);
    server.once("error", onError);
    server.listen(requestedPort, () => {
      server.off("error", onError);
      resolveListen();
    });
  });

  const address = server.address();
  const boundPort = typeof address === "object" && address !== null ? address.port : requestedPort;

  return {
    port: boundPort,
    close: () =>
      new Promise<void>((resolveClose, rejectClose) => {
        server.close((error) => (error ? rejectClose(error) : resolveClose()));
      }),
  };
}

async function handleRequest(
  root: string,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" });
    response.end();
    return;
  }

  const filePath = await resolveFile(root, request.url ?? "/");
  if (filePath === undefined) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": contentType(filePath) });
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => response.destroy());
  stream.pipe(response);
}

async function resolveFile(root: string, url: string): Promise<string | undefined> {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return undefined;
  }

  const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  const candidate = resolve(root, `.${normalize(relative)}`);
  if (isInside(root, candidate) && (await isFile(candidate))) {
    return candidate;
  }

  if (extname(pathname) === "") {
    const index = resolve(root, "index.html");
    if (await isFile(index)) {
      return index;
    }
  }

  return undefined;
}

function isInside(root: string, candidate: string): boolean {
  return candidate === root || candidate.startsWith(root + sep);
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function contentType(path: string): string {
  return CONTENT_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
}
