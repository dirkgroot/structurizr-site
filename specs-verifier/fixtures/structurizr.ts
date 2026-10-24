/**
 * Shell-script shims that stand in for the real `structurizr` CLI, covering
 * failure paths without Java (the technique cli/tests/cli.rs uses).
 * Unix only — the shims are POSIX shell scripts.
 */

/** A `structurizr` that writes the given message to stderr and fails. */
export function failingStructurizr(message: string): string {
  return `#!/bin/sh\necho '${message}' >&2\nexit 1\n`
}
