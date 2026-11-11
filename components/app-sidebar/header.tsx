import AppButton from "@/components/app-button"
import Logo from "@/components/logo"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import pkg from "package.json"

export function Header() {
  const { state, toggleSidebar } = useSidebar()
  const t = useTranslations("sidebar")
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
              <AppButton
                size="icon-sm"
                variant="ghost"
                tooltip={t("collapseSidebar")}
                onClick={toggleSidebar}
              >
                <SidebarIcon />
              </AppButton>
            </>
          )}
        </div>
        {state === "collapsed" && (
          <SidebarMenuButton
            className="mt-2"
            tooltip={t("expandSidebar")}
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </SidebarMenuButton>
        )}
      </SidebarMenu>
    </SidebarHeader>
  )
}
