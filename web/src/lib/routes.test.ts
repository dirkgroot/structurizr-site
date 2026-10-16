import { describe, expect, it } from 'vitest'

import { resolveBreadcrumbs } from './routes'
import { makeWorkspace } from '@/test/workspace'

describe('resolveBreadcrumbs', () => {
  it('reports an error', () => {
    expect(resolveBreadcrumbs('/', null, 'HTTP 500')).toEqual([{ label: 'Error' }])
  })

  it('shows a loading label while the workspace is null', () => {
    expect(resolveBreadcrumbs('/', null, null)).toEqual([{ label: 'Loading workspace…' }])
  })

  it('labels the home page with the workspace name', () => {
    expect(resolveBreadcrumbs('/', makeWorkspace(), null)).toEqual([
      { label: 'Example Workspace' },
    ])
  })

  it('links home from a software system page', () => {
    expect(
      resolveBreadcrumbs('/software-systems/internet-banking-system', makeWorkspace(), null),
    ).toEqual([
      { label: 'Example Workspace', to: '/' },
      { label: 'Internet Banking System' },
    ])
  })

  it('labels an unknown system slug', () => {
    expect(resolveBreadcrumbs('/software-systems/nope', makeWorkspace(), null)).toEqual([
      { label: 'Example Workspace', to: '/' },
      { label: 'Software system not found' },
    ])
  })

  it('labels unmatched paths as not found', () => {
    expect(resolveBreadcrumbs('/nowhere', makeWorkspace(), null)).toEqual([
      { label: 'Page not found' },
    ])
  })
})
