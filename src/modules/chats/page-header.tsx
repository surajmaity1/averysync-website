import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SIDEBARS } from '@/config/sidebar'
import { useLocation } from '@tanstack/react-router'

export const PageHeader = () => {
  const path = useLocation().pathname
  const pageTitle = SIDEBARS.find((sidebar) =>
    path.startsWith(sidebar.url),
  )?.title

  return (
    <header className="flex h-12 bg-white">
      <div className="flex items-center gap-2 px-3">
        <SidebarTrigger />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
