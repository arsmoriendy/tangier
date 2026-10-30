"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTrx } from "./trx-ctx"
import { TrxRow } from "./trx-row"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { useUserSettings } from "@/contexts/user-settings"

export function TrxList() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getTrx } = useTrx()
  const { getUserSettings, setUserSettings } = useUserSettings()
  return (
    <Table>
      <colgroup>
        <col className="w-1/8" />
        <col className="w-full" />
        <col className="w-1/8" />
        <col className="w-1/8" />
        <col className="w-1/8" />
        <col className="w-1/8" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">Id</TableHead>
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
        {getTrx.map((trx, i) => (
          <TrxRow key={i} trx={trx} />
        ))}
      </TableBody>
    </Table>
  )
}
