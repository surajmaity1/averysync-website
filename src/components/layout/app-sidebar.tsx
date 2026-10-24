import { Link } from '@tanstack/react-router'
import AverysyncLogo from '../common/averysync-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from '../ui/sidebar'

export const AppSidebar = ({ ...props }) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link to="/">
          <AverysyncLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupContent>
          <SidebarMenu></SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
