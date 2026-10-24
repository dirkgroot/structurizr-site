import { expect as baseExpect } from '@playwright/test'

import type { CliResult } from './cli.ts'

export const expect = baseExpect.extend({
  /** Asserts a CLI run exited successfully, with stdout/stderr for diagnosis. */
  toSucceed(run: CliResult) {
    if (run.ok) {
      return { pass: true, message: () => '' }
    }
    return {
      pass: false,
      message: () =>
        `expected the CLI run to succeed, but it exited with code ${run.exitCode}\n\n` +
        `stdout:\n${run.stdout || '(empty)'}\n\nstderr:\n${run.stderr || '(empty)'}`,
    }
  },
})

declare module '@playwright/test' {
  export interface Matchers<R> {
    toSucceed(): R
  }
}
