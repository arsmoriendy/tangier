import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarIcon } from "@phosphor-icons/react"
import pkg from "package.json"

export function Header() {
  const { state, toggleSidebar } = useSidebar()
  return (
    <SidebarHeader>
      <SidebarMenu>
        <div className="flex items-center gap-2">
          <Logo className="size-8 shrink-0" />
          {state === "expanded" && (
            <>
              <div className="flex-1 leading-none">
                <p>tangier</p>
                <p className="text-xs text-muted-foreground">v{pkg.version}</p>
              </div>
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
