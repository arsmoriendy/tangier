"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrxRow } from "./trx-row"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { useUserSettings } from "@/contexts/user-settings"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useFilters } from "@/app/(authorized)/transactions/history/filters-ctx"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { trxListQueryOptions } from "./trx-query"
import { flattenTrxPages, shouldFetchNextPage } from "@/lib/trx-pagination"

const COLUMN_COUNT = 6
// collapsed row estimate; expanded rows are measured once rendered
const ROW_HEIGHT = 40
const REFETCH_TOAST_ID = "history-refetch"

export function TrxList() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getFilters } = useFilters()
  const { getUserSettings, setUserSettings } = useUserSettings()

  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLTableSectionElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(trxListQueryOptions(getFilters))

  const trxList = useMemo(() => flattenTrxPages(data?.pages ?? []), [data])

  // the loader row is part of the virtual list, so scrolling to the end always
  // has a row to trigger the next page
  const count = trxList.length + (hasNextPage ? 1 : 0)

  const virt = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => trxList[index]?.id ?? "loader",
    overscan: 5,
    // the tbody starts below the sticky header, so the virtualizer has to be
    // told about the space it occupies in the scroll element
    paddingStart: headerHeight,
  })

  useLayoutEffect(() => {
    const header = headerRef.current
    if (!header) return

    const observer = new ResizeObserver(() =>
      setHeaderHeight(header.offsetHeight)
    )
    observer.observe(header)
    setHeaderHeight(header.offsetHeight)

    return () => observer.disconnect()
  }, [])

  const filterKey = [
    getFilters.id,
    getFilters.from.getTime(),
    getFilters.to.getTime(),
  ].join()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    virt.measure()
  }, [filterKey, virt])

  const virtualItems = virt.getVirtualItems()
  const lastVirtualIndex = virtualItems.at(-1)?.index ?? -1

  useEffect(() => {
    if (
      !shouldFetchNextPage({
        lastVisibleIndex: lastVirtualIndex,
        loadedCount: trxList.length,
        hasNextPage,
        isFetchingNextPage,
      })
    )
      return

    fetchNextPage()
  }, [
    hasNextPage,
    isFetchingNextPage,
    lastVirtualIndex,
    trxList.length,
    fetchNextPage,
  ])

  // only a filter change (a query key with nothing cached yet) shows the
  // toast; loading the next page keeps scrolling silently
  useEffect(() => {
    if (!isPending) return

    toast.loading(tc("loading"), { id: REFETCH_TOAST_ID })
    return () => {
      toast.dismiss(REFETCH_TOAST_ID)
    }
  }, [isPending, tc])

  const paddingTop = Math.max(
    0,
    (virtualItems.at(0)?.start ?? headerHeight) - headerHeight
  )
  const paddingBottom = Math.max(
    0,
    virt.getTotalSize() - (virtualItems.at(-1)?.end ?? headerHeight)
  )

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
      <Table>
        <colgroup>
          <col className="w-1/8" />
          <col className="w-full" />
          <col className="w-1/8" />
          <col className="w-1/8" />
          <col className="w-1/8" />
          <col className="w-1/8" />
        </colgroup>
        <TableHeader
          ref={headerRef}
          className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background"
        >
          <TableRow>
            <TableHead className="text-right">{tc("id")}</TableHead>
            <TableHead className="flex items-center justify-between">
              {tc("items")}
              <Button
                size="icon-xs"
                variant="outline"
                onClick={() =>
                  (setUserSettings.showHisotryItems =
                    !setUserSettings.showHisotryItems)
                }
              >
                {getUserSettings.showHisotryItems ? (
                  <EyeIcon />
                ) : (
                  <EyeSlashIcon />
                )}
              </Button>
            </TableHead>
            <TableHead>{tc("totalPrice")}</TableHead>
            <TableHead>{t("table.date")}</TableHead>
            <TableHead>{t("table.time")}</TableHead>
            <TableHead>{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trxList.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="h-16 text-center text-muted-foreground"
              >
                {isPending ? tc("loading") : t("noTransactions")}
              </TableCell>
            </TableRow>
          )}
          <VirtualSpacer height={paddingTop} />
          {virtualItems.map(({ index, key }) => {
            const trx = trxList[index]

            if (!trx)
              return (
                <TableRow
                  key={key}
                  data-index={index}
                  ref={virt.measureElement}
                >
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="text-center text-muted-foreground"
                  >
                    {tc("loading")}
                  </TableCell>
                </TableRow>
              )

            return (
              <TrxRow
                key={key}
                trx={trx}
                data-index={index}
                ref={virt.measureElement}
              />
            )
          })}
          <VirtualSpacer height={paddingBottom} />
        </TableBody>
      </Table>
    </div>
  )
}

// absolutely positioned rows aren't valid in a table, so the off-screen space
// is filled with an empty row on both sides of the rendered window
function VirtualSpacer({ height }: { height: number }) {
  if (height <= 0) return null

  return (
    <tr aria-hidden>
      <td colSpan={COLUMN_COUNT} style={{ height, padding: 0, border: 0 }} />
    </tr>
  )
}
