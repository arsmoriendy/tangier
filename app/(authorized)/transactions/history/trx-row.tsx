"use client"

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { subscribeKey } from "valtio/utils"
import { EditTrxDialog } from "@/app/(authorized)/transactions/history/edit-trx-dialog"
import { DeleteTrxDialog } from "@/app/(authorized)/transactions/history/delete-trx-dialog"

export function TrxRow({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const createdDate = new Date(trx.createdAt)
  const { setLocalStorage } = useLocalStorage()
  const [showItems, setShowItems] = useState(false)

  useEffect(() => {
    setShowItems(setLocalStorage.showHisotryItems)
    const unsub = subscribeKey(
      setLocalStorage,
      "showHisotryItems",
      setShowItems
    )
    return unsub
  }, [])

  return (
    <TableRow>
      <TableCell className="align-top">
        <span className="flex h-8 items-center">{trx.id}</span>
      </TableCell>
      <TableCell className="align-top">
        <Collapsible open={showItems} onOpenChange={setShowItems}>
          <CollapsibleTrigger asChild>
            <Button
              className="w-full"
              variant={showItems ? "destructive" : "outline"}
            >
              {showItems ? (
                <>
                  <EyeSlashIcon />
                  {t("table.hideItems")}
                </>
              ) : (
                <>
                  <EyeIcon />
                  {t("table.showItems")}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Table>
              <TableBody>
                {trx.transactionItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{formatCurrency(item.sellPrice)}</TableCell>
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
          {createdDate.toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell className="align-top">
        <span className="flex h-8 items-center">
          {createdDate.toLocaleTimeString()}
        </span>
      </TableCell>
      <TableCell className="space-x-2 align-top">
        <EditTrxDialog trx={trx} />
        <DeleteTrxDialog trx={trx} />
      </TableCell>
    </TableRow>
  )
}
