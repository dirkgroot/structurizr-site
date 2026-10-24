import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

export interface StaticServerOptions {
  /** Directory being served. */
  root: string;
  /** URL prefix the site is mounted under, e.g. `/docs`; defaults to `/`. */
  mount?: string;
  /** File served (with 404 status) at unknown paths, GitHub-Pages style. */
  fallback?: string;
}

/**
 * A static file server with the hosting semantics a generated site faces:
 * plain static files, optionally mounted under a base path, optionally with
 * a 404.html fallback the way GitHub Pages project sites serve one.
 */
export class StaticServer {
  private server: http.Server | undefined;
  private readonly mount: string;
  private port = 0;

  constructor(private readonly options: StaticServerOptions) {
    this.mount = normalizeMount(options.mount);
  }

  async start(): Promise<void> {
    this.server = http.createServer((request, response) => this.respond(request, response));
    await new Promise<void>((resolve) => this.server!.listen(0, "127.0.0.1", resolve));
    this.port = (this.server!.address() as AddressInfo).port;
  }

  /** Absolute URL for a site path; a `#fragment` passes through. */
  url(sitePath = "/"): string {
    if (!this.server) throw new Error("server is not running");
    const [pathname = "/", fragment] = sitePath.split("#");
    const joined =
      this.mount === "/"
        ? ensureLeadingSlash(pathname)
        : `${this.mount}${pathname === "/" ? "/" : ensureLeadingSlash(pathname)}`;
    return `http://127.0.0.1:${this.port}${joined}${fragment === undefined ? "" : `#${fragment}`}`;
  }

  async stop(): Promise<void> {
    if (!this.server) return;
    await new Promise<void>((resolve, reject) => {
      this.server!.close((error) => (error ? reject(error) : resolve()));
    });
    this.server = undefined;
  }

  private respond(request: http.IncomingMessage, response: http.ServerResponse): void {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    let sitePath: string;
    try {
      sitePath = decodeURIComponent(url.pathname);
    } catch {
      this.respondText(response, 400, "bad request");
      return;
    }

    if (this.mount !== "/" && !isUnder(sitePath, this.mount)) {
      this.respondText(response, 404, "not found");
      return;
    }
    if (this.mount !== "/") sitePath = sitePath.slice(this.mount.length) || "/";

    // Guard against path traversal: the resolved path must stay in root.
    const resolved = path.resolve(this.options.root, `.${sitePath}`);
    if (resolved !== this.options.root && !resolved.startsWith(this.options.root + path.sep)) {
      this.respondText(response, 404, "not found");
      return;
    }

    const file = this.locate(resolved);
    if (file === undefined) {
      this.respondText(response, 404, "not found");
      return;
    }
    this.respondFile(response, file.file, file.status);
  }

  /** The file to serve for a requested path: a direct hit, the fallback, or nothing. */
  private locate(resolved: string): { file: string; status: number } | undefined {
    const direct = this.asFile(resolved);
    if (direct) return { file: direct, status: 200 };
    if (this.options.fallback) {
      const fallback = path.join(this.options.root, this.options.fallback);
      if (this.asFile(fallback) === fallback) return { file: fallback, status: 404 };
    }
    return undefined;
  }

  /** A directory request resolves to its index.html; anything else must be an existing file. */
  private asFile(candidate: string): string | undefined {
    const target =
      fs.existsSync(candidate) && fs.statSync(candidate).isDirectory() ? path.join(candidate, "index.html") : candidate;
    return fs.existsSync(target) && fs.statSync(target).isFile() ? target : undefined;
  }

  private respondFile(response: http.ServerResponse, file: string, status: number): void {
    let body: Buffer;
    try {
      body = fs.readFileSync(file);
    } catch {
      this.respondText(response, 500, "internal server error");
      return;
    }
    response.writeHead(status, {
      "Content-Type": MIME_TYPES[path.extname(file)] ?? "application/octet-stream",
      "Content-Length": body.length,
    });
    response.end(body);
  }

  private respondText(response: http.ServerResponse, status: number, message: string): void {
    response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(message);
  }
}

function isUnder(sitePath: string, mount: string): boolean {
  return sitePath === mount || sitePath.startsWith(`${mount}/`);
}

function normalizeMount(mount: string | undefined): string {
  if (!mount || mount === "/") return "/";
  const withSlash = ensureLeadingSlash(mount);
  return withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
}

function ensureLeadingSlash(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
