import type { Workspace } from '@/components/app-sidebar'

/** A small but complete workspace fixture; override fields per test. */
export function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    name: 'Example Workspace',
    description: 'A workspace for testing.',
    model: {
      softwareSystems: [
        {
          id: 'system-1',
          name: 'Internet Banking System',
          description: 'Banking over the internet.',
        },
      ],
    },
    ...overrides,
  }
}
