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
  Group,
  Popover,
  RangeCalendar,
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
import { useTranslations } from "next-intl"
import { FieldLabel } from "@/components/ui/field"

export function DatetimeRangeField<T extends DateValue>({
  label,
  className,
  granularity = "minute",
  ...props
}: DateRangePickerProps<T> & {
  label?: string
  className?: string
}) {
  const t = useTranslations("transactions.history")

  return (
    <DateRangePicker className={className} {...props}>
      <FieldLabel className="mb-2">{label}</FieldLabel>
      <Group className={cn(inputClass, "flex items-center gap-2 pl-0 text-sm")}>
        <Button className={buttonVariants({ size: "icon", variant: "ghost" })}>
          <CalendarBlankIcon />
        </Button>

        <div className="flex gap-2">
          <span className="text-muted-foreground">{t("filters.from")}</span>
          <DateInput slot="start">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
        </div>

        <div className="flex gap-2">
          <span className="text-muted-foreground">{t("filters.to")}</span>
          <DateInput slot="end">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
        </div>
      </Group>
      <Popover
        className="border bg-popover p-2 text-popover-foreground"
        placement="bottom start"
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
