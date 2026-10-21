import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const Chats = () => {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div>Chat Page</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
