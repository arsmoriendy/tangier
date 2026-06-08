import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarIcon } from "@phosphor-icons/react"

export function Header() {
  const { state, toggleSidebar } = useSidebar()
  return (
    <SidebarHeader>
      <SidebarMenu>
        <div className="flex items-center gap-3">
          <Logo className="size-8 shrink-0" />
          {state === "expanded" && (
            <>
              <span className="flex-1">tangier</span>
              <Button size="icon-sm" variant="ghost" onClick={toggleSidebar}>
                <SidebarIcon />
              </Button>
            </>
          )}
        </div>
        {state === "collapsed" && (
          <SidebarMenuButton className="mt-2" onClick={toggleSidebar}>
            <SidebarIcon />
          </SidebarMenuButton>
        )}
      </SidebarMenu>
      <hr />
    </SidebarHeader>
  )
}
