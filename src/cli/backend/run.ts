import { spawn } from "node:child_process";
import { resolveStructurizr } from "./resolve.js";

/** A spawn result with captured stdout/stderr. */
export interface RunResult {
  stdout: string;
  stderr: string;
}

/** Injectable `spawn` seam so tests can assert invocations without a real backend. */
export type SpawnFn = (command: string, args: string[]) => Promise<RunResult>;

/** Resolve an external command: an explicit `override` wins, else the default. */
export function resolveCommand(override: string | undefined, fallback: string): string {
  return override?.trim() || fallback;
}

/**
 * Run the Structurizr backend with `args`. The backend command is resolved per
 * `resolveStructurizr`; `override` (the `--structurizr` option) wins when given.
 */
export async function runStructurizr(
  args: string[],
  options: { override?: string } = {},
  spawnFn: SpawnFn = defaultSpawn,
): Promise<RunResult> {
  const command = resolveStructurizr(options.override);
  return spawnFn(command, args);
}

/**
 * Spawn `command`, capturing stdout/stderr. Rejects on a non-zero exit, with the
 * backend's own output, and with an actionable message when the command is missing.
 * `label` names the tool in the "not found" message. Exported for direct testing
 * of the process seam.
 */
export async function defaultSpawn(
  command: string,
  args: string[],
  label = "Structurizr backend",
): Promise<RunResult> {
  return new Promise<RunResult>((resolvePromise, reject) => {
    const child = spawn(command, args);
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        reject(
          new Error(`${label} "${command}" not found; install it, or pass --structurizr <command>`),
        );
        return;
      }
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }
      const detail = stderr.trim() || stdout.trim();
      reject(
        new Error(`${label} "${command}" exited with code ${code}${detail ? `: ${detail}` : ""}`),
      );
    });
  });
}
