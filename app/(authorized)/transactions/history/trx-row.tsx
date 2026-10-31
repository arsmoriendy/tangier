"use client"

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect, useState } from "react"
import { useFormatter } from "next-intl"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"
import { useUserSettings } from "@/contexts/user-settings"
import { subscribeKey } from "valtio/utils"
import { EditTrxDialog } from "@/app/(authorized)/transactions/history/edit-trx-dialog"
import { DeleteTrxDialog } from "@/app/(authorized)/transactions/history/delete-trx-dialog"
import { quantifiedSellPrice } from "@/lib/quantified-sell-price"

export function TrxRow({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const createdDate = new Date(trx.createdAt)
  const { setUserSettings } = useUserSettings()
  const [showItems, setShowItems] = useState(false)
  const format = useFormatter()

  useEffect(() => {
    setShowItems(setUserSettings.showHisotryItems)
    const unsub = subscribeKey(
      setUserSettings,
      "showHisotryItems",
      setShowItems
    )
    return unsub
  }, [])

  return (
    <TableRow>
      <TableCell className="align-top">
        <div className="flex h-8 flex-col items-end">
          <small className="text-muted-foreground">{trx.id.slice(0, 24)}</small>
          <span>{trx.id.slice(24)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Collapsible open={showItems} onOpenChange={setShowItems}>
          <CollapsibleTrigger asChild>
            <Button className="w-full" size="xs" variant="outline">
              {showItems ? <CaretUpIcon /> : <CaretDownIcon />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Table className="table-fixed">
              <TableBody>
                {trx.transactionItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="truncate">{item.name}</TableCell>
                    <TableCell className="w-13 truncate text-right">
                      x{item.quantity}
                    </TableCell>
                    <TableCell className="w-32 truncate text-right">
                      {formatCurrency(quantifiedSellPrice(item))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </TableCell>
      <TableCell className="align-top">
        <span className="flex h-8 items-center">
          {formatCurrency(trx.totalPrice)}
        </span>
      </TableCell>
      <TableCell className="align-top">
        <span className="flex h-8 items-center">
          {format.dateTime(createdDate)}
        </span>
      </TableCell>
      <TableCell className="align-top">
        <span className="flex h-8 items-center">
          {format.dateTime(createdDate, { hour: "2-digit", minute: "2-digit" })}
        </span>
      </TableCell>
      <TableCell className="space-x-2 align-top">
        <EditTrxDialog trx={trx} />
        <DeleteTrxDialog trx={trx} />
      </TableCell>
    </TableRow>
  )
}
