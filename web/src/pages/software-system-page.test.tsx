import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { PageProps } from '@/lib/routes'
import { makeWorkspace } from '@/test/workspace'
import { SoftwareSystemPage } from './software-system-page'

function renderAt(slug: string, props: PageProps) {
  return render(
    <MemoryRouter initialEntries={[`/software-systems/${slug}`]}>
      <Routes>
        <Route path="/software-systems/:slug" element={<SoftwareSystemPage {...props} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SoftwareSystemPage', () => {
  it('renders the system description', () => {
    renderAt('internet-banking-system', { workspace: makeWorkspace(), error: null })
    expect(screen.getByText('Banking over the internet.')).toBeInTheDocument()
  })

  it('reports an unknown slug', () => {
    renderAt('unknown-system', { workspace: makeWorkspace(), error: null })
    expect(screen.getByText('Software system not found: unknown-system')).toBeInTheDocument()
  })

  it('shows a placeholder when the system has no description', () => {
    const workspace = makeWorkspace({
      model: { softwareSystems: [{ id: 'system-1', name: 'Bare System' }] },
    })
    renderAt('bare-system', { workspace, error: null })
    expect(screen.getByText('No description.')).toBeInTheDocument()
  })

  it('renders the error message', () => {
    renderAt('internet-banking-system', { workspace: null, error: 'HTTP 500' })
    expect(screen.getByText('Failed to load workspace: HTTP 500')).toBeInTheDocument()
  })

  it('renders nothing while the workspace is loading', () => {
    const { container } = renderAt('internet-banking-system', { workspace: null, error: null })
    expect(container).toBeEmptyDOMElement()
  })
})
