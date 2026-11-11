import { Button, ButtonProps } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import React from "react"
import { useHotkeys } from "react-hotkeys-hook"

type HotkeyProps = {
  hotkeys?: string[]
  hideHotkeys?: true
}

type TooltipProps = {
  tooltip?: React.ReactNode
  /**
   * Keep it off for performance. Wrap the button with a tooltip, regardless if
   * the `tooltip` prop is provided.
   */
  wrapTooltip?: true
  tooltipProps?: Omit<React.ComponentProps<typeof TooltipContent>, "children">
}

export type AppButtonProps = ButtonProps & HotkeyProps & TooltipProps

function InnerButton({
  hotkeys,
  hideHotkeys,
  children,
  ...props
}: HotkeyProps & ButtonProps) {
  return (
    <Button {...props}>
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

function Trigger(props: React.ComponentProps<typeof InnerButton>) {
  return (
    <TooltipTrigger asChild>
      <InnerButton {...props} />
    </TooltipTrigger>
  )
}

export default function AppButton(props: AppButtonProps) {
  const {
    tooltip,
    tooltipProps,
    wrapTooltip,
    hotkeys,
    hideHotkeys,
    ref = React.useRef<HTMLButtonElement>(null),
    ...btnProps
  } = props

  const innerBtnProps = { hotkeys, hideHotkeys, ref, ...btnProps }

  if (hotkeys)
    useHotkeys(hotkeys, () => ref?.current?.click(), {
      preventDefault: true,
      enableOnFormTags: true,
    })

  if (wrapTooltip)
    return (
      <Tooltip>
        <Trigger {...innerBtnProps} />
        {tooltip && (
          <TooltipContent {...tooltipProps}>{tooltip}</TooltipContent>
        )}
      </Tooltip>
    )

  if (tooltip !== undefined)
    return (
      <Tooltip>
        <Trigger {...innerBtnProps} />
        <TooltipContent {...tooltipProps}>{tooltip}</TooltipContent>
      </Tooltip>
    )

  return <InnerButton {...innerBtnProps} />
}
