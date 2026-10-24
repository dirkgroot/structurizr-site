import { test, expect } from '@/fixtures'
import { acme } from '@/workspaces'

test('generate produces a self-contained site', async ({ cli }) => {
  const run = await cli.generate({ workspace: acme })

  expect(run).toSucceed()
  expect(run.file('build/index.html')).toContain('./assets/')
  expect(run.exists('build/assets')).toBe(true)
  const { model } = run.json<{
    model: { softwareSystems: Array<{ name: string }> }
  }>('build/workspace.json')
  expect(model.softwareSystems.map((system) => system.name)).toEqual([
    'ACME Core',
    'ACME Billing',
  ])
})
