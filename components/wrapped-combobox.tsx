"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

/**
 * Base UI rewrites the input value on item press, popup close, and programmatic
 * value changes. Only genuine edits may reach the input state, otherwise the
 * input would no longer be independent from the option.
 */
const INPUT_REASONS = new Set(["input-change", "input-paste"])

/**
 * Handed to `renderInput`. Controls own their own value/change plumbing, so
 * `value` and `onChange` are deliberately absent from `domProps`.
 */
export type WrappedComboboxInputProps = {
  /** The current filter text. */
  value: string
  /**
   * Event-free input setter. Opens the list when the value is not blank, so
   * controls that cannot emit native change events still behave like the
   * default input.
   */
  setInputValue: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
  /**
   * Props Base UI needs on the real element: `ref`, keyboard, focus, and aria
   * attributes. Spread these onto the underlying `<input>`.
   */
  domProps: Omit<React.ComponentPropsWithRef<"input">, "value" | "onChange">
}

function inputDomProps(
  props: React.ComponentPropsWithRef<"input">
): WrappedComboboxInputProps["domProps"] {
  const domProps = { ...props }
  delete domProps.value
  delete domProps.onChange
  return domProps
}

export type WrappedComboboxProps<O> = {
  options: readonly O[]
  /**
   * The selected option, or `null` for none. Passing `undefined` leaves the
   * component uncontrolled. Select the same option again to deselect it.
   */
  option?: O | null
  onOptionChange?: (option: O | null) => void
  /**
   * The input text. Passing `undefined` leaves it uncontrolled, in which case
   * it follows the selected option's label. A controlled input is owned by the
   * caller and is never synced automatically.
   */
  input?: string
  onInputChange?: (input: string) => void
  /** Display text: the input after selection, plus filtering and aria labels. */
  optionToLabel?: (option: O) => string
  /** Serialized form value. Also used as the React key and for equality. */
  optionToValue?: (option: O) => string
  placeholder?: string
  emptyMessage?: React.ReactNode
  renderOption?: (option: O) => React.ReactNode
  /**
   * Replaces the default input (and its `InputGroup` chrome) with any control,
   * e.g. `Input`, `IdrInput`, or `NumberInput`. The control must spread
   * `domProps` onto the underlying `<input>` so keyboard navigation and popup
   * positioning keep working.
   */
  renderInput?: (props: WrappedComboboxInputProps) => React.ReactElement
  /**
   * Open the list when the input receives focus. Base UI only opens on
   * mousedown, so this covers Tab and programmatic focus.
   */
  openOnFocus?: boolean
  disabled?: boolean
  invalid?: boolean
} & Omit<React.ComponentProps<"div">, "children">

function objectField(option: object, keys: string[]): string | undefined {
  const record = option as Record<string, unknown>
  for (const key of keys) {
    const value = record[key]
    if (value != null) return String(value)
  }
  return undefined
}

function defaultOptionLabel<O>(option: O): string {
  if (typeof option === "string" || typeof option === "number") {
    return String(option)
  }
  if (option != null && typeof option === "object") {
    return objectField(option, ["label", "name"]) ?? String(option)
  }
  return String(option)
}

function defaultOptionValue<O>(option: O): string {
  if (typeof option === "string" || typeof option === "number") {
    return String(option)
  }
  if (option != null && typeof option === "object") {
    return objectField(option, ["value", "id"]) ?? String(option)
  }
  return String(option)
}

export function WrappedCombobox<O>({
  options,
  option: controlledOption,
  onOptionChange,
  input: controlledInput,
  onInputChange,
  optionToLabel,
  optionToValue,
  placeholder,
  emptyMessage,
  renderOption,
  renderInput,
  openOnFocus = true,
  disabled,
  invalid,
  className,
  ...divProps
}: WrappedComboboxProps<O>) {
  const [internalOption, setInternalOption] = React.useState<O | null>(null)
  const [internalInput, setInternalInput] = React.useState("")
  // Base UI opens the list from its own input change handler, which a custom
  // control bypasses, so the list is controlled here instead.
  const [open, setOpen] = React.useState(false)

  const isOptionControlled = controlledOption !== undefined
  const isInputControlled = controlledInput !== undefined

  const option = isOptionControlled ? controlledOption : internalOption
  const input = isInputControlled ? controlledInput : internalInput

  const optionKey = option === null ? null : getOptionValue(option)

  // Keep the input in sync with an externally changed option. Keyed on the
  // serialized option only: the projector props are usually inline arrows, so
  // depending on them would re-run this on every render and discard whatever
  // the user is typing.
  React.useEffect(() => {
    if (isInputControlled) return
    const nextInput = option === null ? "" : getOptionLabel(option)
    if (nextInput === internalInput) return
    setInternalInput(nextInput)
    onInputChange?.(nextInput)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionKey])

  function getOptionLabel(item: O): string {
    return optionToLabel ? optionToLabel(item) : defaultOptionLabel(item)
  }

  function getOptionValue(item: O): string {
    return optionToValue ? optionToValue(item) : defaultOptionValue(item)
  }

  function isSameOption(a: O, b: O): boolean {
    return getOptionValue(a) === getOptionValue(b)
  }

  function handleOptionChange(next: O | null) {
    // Base UI drops the selection when the input is emptied (or on Escape).
    // The input is independent from the option, so ignore those.
    if (next === null) return

    // Single-selection mode always reports the pressed item, even when it is
    // already selected, so pressing it again deselects it.
    const deselect = option !== null && isSameOption(option, next)
    const resolved = deselect ? null : next

    if (!isOptionControlled) setInternalOption(resolved)
    onOptionChange?.(resolved)
  }

  function handleInputChange(next: string, eventDetails: { reason: string }) {
    if (!INPUT_REASONS.has(eventDetails.reason)) return
    if (!isInputControlled) setInternalInput(next)
    onInputChange?.(next)
  }

  function handleSetInput(next: string) {
    if (!isInputControlled) setInternalInput(next)
    onInputChange?.(next)
    if (next.trim() !== "") setOpen(true)
  }

  function getInputProps(
    inputProps: React.ComponentPropsWithRef<"input">
  ): WrappedComboboxInputProps["domProps"] {
    const domProps = inputDomProps(inputProps)
    if (!openOnFocus) return domProps

    return {
      ...domProps,
      onFocus(event: React.FocusEvent<HTMLInputElement>) {
        domProps.onFocus?.(event)
        setOpen(true)
      },
    }
  }

  return (
    <div className={cn("relative", className)} {...divProps}>
      <Combobox
        items={options}
        value={option}
        onValueChange={handleOptionChange}
        itemToStringLabel={getOptionLabel}
        itemToStringValue={getOptionValue}
        isItemEqualToValue={isSameOption}
        inputValue={input}
        onInputValueChange={handleInputChange}
        open={open}
        onOpenChange={setOpen}
      >
        {renderInput ? (
          <ComboboxPrimitive.Input
            render={(renderProps) =>
              renderInput({
                value: input,
                setInputValue: handleSetInput,
                invalid,
                disabled,
                placeholder,
                domProps: getInputProps(
                  renderProps as React.ComponentPropsWithRef<"input">
                ),
              })
            }
          />
        ) : (
          <ComboboxInput
            className="w-full"
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            onFocus={openOnFocus ? () => setOpen(true) : undefined}
          />
        )}
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(candidate: O) => (
              <ComboboxItem key={getOptionValue(candidate)} value={candidate}>
                {renderOption
                  ? renderOption(candidate)
                  : getOptionLabel(candidate)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
