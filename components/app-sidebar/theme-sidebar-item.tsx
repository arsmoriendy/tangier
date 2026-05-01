import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react"
import { capitalize } from "es-toolkit"
import { useTheme } from "next-themes"
import { ReactNode, useEffect, useState } from "react"

export function ThemeSidebarItem() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const themeIconMap: { [theme: string]: ReactNode } = {
    light: <SunIcon />,
    system: <DesktopIcon />,
    dark: <MoonIcon />,
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            {themeIconMap[theme ?? ""] ?? <DesktopIcon />} Theme
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          className="relative left-2"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {Object.entries(themeIconMap).map(([theme, icon], i) => (
                <DropdownMenuRadioItem key={i} value={theme}>
                  {icon} {capitalize(theme)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
