import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { SidebarProvider } from '@/components/ui/sidebar'
import { stubMatchMedia } from '@/test/match-media'
import { makeWorkspace } from '@/test/workspace'
import { AppSidebar, type Workspace } from './app-sidebar'

function renderSidebar(workspace: Workspace | null, path = '/') {
  stubMatchMedia()
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarProvider>
        <AppSidebar workspace={workspace} />
      </SidebarProvider>
    </MemoryRouter>,
  )
}

describe('AppSidebar', () => {
  it('shows the workspace name and description', () => {
    renderSidebar(makeWorkspace())
    expect(screen.getByText('Example Workspace')).toBeInTheDocument()
    expect(screen.getByText('A workspace for testing.')).toBeInTheDocument()
  })

  it('falls back to a default header while the workspace is loading', () => {
    renderSidebar(null)
    expect(screen.getByText('Structurizr')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
  })

  it('links home and every software system', () => {
    const workspace = makeWorkspace({
      model: {
        softwareSystems: [
          { id: 'system-1', name: 'Internet Banking System' },
          { id: 'system-2', name: 'E-mail System' },
        ],
      },
    })
    renderSidebar(workspace)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Internet Banking System' })).toHaveAttribute(
      'href',
      '/software-systems/internet-banking-system',
    )
    expect(screen.getByRole('link', { name: 'E-mail System' })).toHaveAttribute(
      'href',
      '/software-systems/e-mail-system',
    )
  })

  it('marks the active system link', () => {
    renderSidebar(makeWorkspace(), '/software-systems/internet-banking-system')
    expect(screen.getByRole('link', { name: 'Internet Banking System' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('hides the software-systems group when the model has none', () => {
    renderSidebar(makeWorkspace({ model: { softwareSystems: [] } }))
    expect(screen.queryByRole('link', { name: 'Internet Banking System' })).not.toBeInTheDocument()
    expect(screen.queryByText('Software Systems')).not.toBeInTheDocument()
  })
})
