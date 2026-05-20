import { useHotkeys } from "react-hotkeys-hook"
import { Button, ButtonProps } from "./button"
import { Kbd } from "./kbd"
import React from "react"

export type ButtonWithHotkeysProps = Omit<ButtonProps, "asChild"> & {
  hotkeys?: string[]
  hideHotkeys?: true
}

export function ButtonWithHotkeys({
  hotkeys,
  hideHotkeys,
  children,
  ref = React.useRef<HTMLButtonElement>(null),
  ...props
}: ButtonWithHotkeysProps) {
  if (hotkeys)
    useHotkeys(hotkeys, () => ref?.current?.click(), {
      preventDefault: true,
      enableOnFormTags: true,
    })

  return (
    <Button data-slot="button" ref={ref} {...props}>
      {children}
      {!hideHotkeys &&
        hotkeys?.map((hk, i) => (
          <Kbd key={i} data-icon="inline-end">
            {hk}
          </Kbd>
        ))}
    </Button>
  )
}
