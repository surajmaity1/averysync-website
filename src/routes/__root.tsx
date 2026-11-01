import { NotFoundPage } from '@/components/common/not-found-page'
import { SpaceSessionRoot } from '@/components/spaces/space-session-root'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <main>
        <Outlet />
      </main>
      {/* Must live INSIDE the router provider (not in Providers, a sibling of
          it): the reopened space dialog navigates via useNavigate, which is a
          silent no-op outside the router context. The root route never
          unmounts, so the session still outlives every page change. */}
      <SpaceSessionRoot />
      {/* Skipped in Playwright runs (VITE_E2E, set by vite.config.test.ts):
          the floating launcher overlays the bottom navbar and intercepts
          taps meant for product UI. */}
      {import.meta.env.DEV && import.meta.env.VITE_E2E !== 'true' && (
        <TanStackRouterDevtools />
      )}
    </>
  ),
  notFoundComponent: () => {
    return <NotFoundPage />
  },
})
