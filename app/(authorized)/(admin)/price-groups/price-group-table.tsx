"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { priceGroups } from "@/lib/db/schema"
import { useState } from "react"
import UpdatePriceGroupForm from "./update-price-group-form"
import { useTranslations } from "next-intl"

function PriceGroupRow({
  priceGroup,
}: {
  priceGroup: typeof priceGroups.$inferSelect
}) {
  const [openDialog, setDialogOpen] = useState(false)
  const t = useTranslations("priceGroups")

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{priceGroup.name}</TableCell>
          <TableCell>{priceGroup.priority}</TableCell>
          <TableCell>
            #{priceGroup.hexColor}
            <div
              className="h-1"
              style={{ backgroundColor: `#${priceGroup.hexColor}` }}
            />
          </TableCell>
          <TableCell>{priceGroup.description}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("form.update")}</DialogTitle>
        <UpdatePriceGroupForm
          onSumbit={() => setDialogOpen(false)}
          onDelete={() => setDialogOpen(false)}
          priceGroup={priceGroup}
        />
      </DialogContent>
    </Dialog>
  )
}

export default function PriceGroupTable() {
  const { priceGroups } = usePriceGroups()
  const t = useTranslations("priceGroups")
  const ct = useTranslations("common")

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("table.name")}</TableHead>
          <TableHead>{ct("priority")}</TableHead>
          <TableHead>{t("table.color")}</TableHead>
          <TableHead>{t("table.description")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {priceGroups.map((pg, i) => (
          <PriceGroupRow key={i} priceGroup={pg} />
        ))}
      </TableBody>
    </Table>
  )
}
