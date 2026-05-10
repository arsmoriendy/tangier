"use client"

import { cn } from "@/lib/utils"
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react"
import {
  Button,
  DateInput,
  DateRangePicker,
  DateSegment,
  FieldError,
  Group,
  Label,
  Popover,
  RangeCalendar,
  Text,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  type DateRangePickerProps,
  type DateValue,
} from "react-aria-components/DateRangePicker"
import { Heading } from "react-aria-components/RangeCalendar"
import { buttonVariants } from "./ui/button"
import { inputClass } from "./ui/input"
import { labelClass } from "./ui/label"

export function DatetimeRangeField<T extends DateValue>({
  label,
  className,
  granularity = "minute",
  ...props
}: DateRangePickerProps<T> & {
  label?: string
  className?: string
}) {
  return (
    <DateRangePicker {...props}>
      <Label className={labelClass}>{label}</Label>
      <Group className={cn(inputClass, "flex items-center gap-2 pr-0 text-sm")}>
        <DateInput slot="start">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <DateInput slot="end">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <Button className={buttonVariants({ size: "icon", variant: "ghost" })}>
          <CalendarBlankIcon />
        </Button>
      </Group>
      <Popover
        className="border bg-popover p-2 text-popover-foreground"
        placement="bottom end"
      >
        <RangeCalendar>
          <div className="mb-2 flex items-center justify-between gap-2">
            <Button
              slot="previous"
              className={buttonVariants({ size: "icon", variant: "ghost" })}
            >
              <CaretLeftIcon />
            </Button>
            <Heading />
            <Button
              slot="next"
              className={buttonVariants({ size: "icon", variant: "ghost" })}
            >
              <CaretRightIcon />
            </Button>
          </div>
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell date={date}>
                  {({
                    formattedDate,
                    isSelected,
                    isSelectionStart,
                    isSelectionEnd,
                    isOutsideMonth,
                  }) => (
                    <div
                      className={cn(
                        "grid size-8 cursor-default place-items-center text-sm hover:bg-muted",
                        isSelected && "bg-secondary text-secondary-foreground",
                        (isSelectionStart || isSelectionEnd) &&
                          "hover:bg-priamry bg-primary text-primary-foreground",
                        isOutsideMonth &&
                          "text-muted-foreground hover:bg-transparent"
                      )}
                    >
                      {formattedDate}
                    </div>
                  )}
                </CalendarCell>
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </RangeCalendar>
      </Popover>
    </DateRangePicker>
  )
}
