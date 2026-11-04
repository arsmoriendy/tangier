"use client"

import { useSidebar } from "@/components/ui/sidebar"

/**
 * Returns a helper that yields a `SidebarMenuButton` tooltip only while the
 * sidebar is collapsed to icons (and never on mobile), so expanded items don't
 * carry a redundant tooltip.
 */
export function useCollapsedTooltip() {
  const { state, isMobile } = useSidebar()

  return (label: string) =>
    state === "collapsed" && !isMobile ? label : undefined
}
