import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ChatContainer } from './components/chat-container'
import { PageHeader } from './page-header'

export const Chats = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageHeader />
        <ChatContainer />
      </SidebarInset>
    </SidebarProvider>
  )
}
