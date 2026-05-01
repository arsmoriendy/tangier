import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export function DynamicSidebarLink(props: {
  children: (props: { className: string; href: string }) => ReactNode
  href: string
}) {
  const activeClass =
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:brightness-90"

  const isActive = usePathname().startsWith(props.href)

  return props.children({
    className: isActive ? activeClass : "",
    href: props.href,
  })
}
