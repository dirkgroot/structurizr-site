import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Per-test scratch directory. Everything a spec or fixture writes lives here
 * and is removed when the test finishes.
 */
export class Sandbox {
  private constructor(readonly path: string) {}

  static async create(): Promise<Sandbox> {
    return new Sandbox(await fs.promises.mkdtemp(path.join(os.tmpdir(), "structurizr-site-spec-")));
  }

  /** Writes content into the sandbox and returns its absolute path. */
  async write(file: string, content: string): Promise<string> {
    const target = path.join(this.path, file);
    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    await fs.promises.writeFile(target, content);
    return target;
  }

  async dispose(): Promise<void> {
    await fs.promises.rm(this.path, { recursive: true, force: true });
  }
}
