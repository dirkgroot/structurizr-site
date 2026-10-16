import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import App from './App'
import { stubMatchMedia } from '@/test/match-media'
import { makeWorkspace } from '@/test/workspace'

function stubFetch(body: unknown, { ok = true, status = 200 } = {}): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok, status, json: () => Promise.resolve(body) }),
  )
}

function renderApp(body: unknown, options?: { ok?: boolean; status?: number }) {
  stubMatchMedia()
  stubFetch(body, options)
  return render(<App />)
}

function breadcrumbs() {
  return within(screen.getByRole('navigation', { name: 'breadcrumb' }))
}

function main() {
  // SidebarInset renders the page's single <main> landmark.
  return within(screen.getByRole('main'))
}

describe('App', () => {
  it('loads the workspace, then navigates to a software system', async () => {
    renderApp(makeWorkspace())
    const user = userEvent.setup()

    const crumbs = breadcrumbs()
    expect(await crumbs.findByText('Example Workspace')).toBeInTheDocument()
    expect(main().getByText('A workspace for testing.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Internet Banking System' }))

    // App defaults to hash routing, so breadcrumb links carry the '#' prefix.
    expect(crumbs.getByRole('link', { name: 'Example Workspace' })).toHaveAttribute('href', '#/')
    expect(crumbs.getByText('Internet Banking System')).toBeInTheDocument()
    expect(main().getByText('Banking over the internet.')).toBeInTheDocument()
  })

  it('shows the load error and an Error breadcrumb when the fetch fails', async () => {
    renderApp(null, { ok: false, status: 404 })

    expect(await screen.findByText('Failed to load workspace: HTTP 404')).toBeInTheDocument()
    expect(breadcrumbs().getByText('Error')).toBeInTheDocument()
  })
})
