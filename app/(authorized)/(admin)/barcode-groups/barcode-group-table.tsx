"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"
import { useTranslations } from "next-intl"
import { barcodeGroups } from "@/lib/db/schema"
import { useState } from "react"
import UpdateBarcodeGroupForm from "./update-barcode-group-form"

function BarcodeGroupRow({
  barcodeGroup,
}: {
  barcodeGroup: typeof barcodeGroups.$inferSelect
}) {
  const [openDialog, setDialogOpen] = useState(false)
  const t = useTranslations("barcodeGroups")

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{barcodeGroup.name}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("form.update")}</DialogTitle>
        <UpdateBarcodeGroupForm
          barcodeGroup={barcodeGroup}
          onSubmit={() => setDialogOpen(false)}
          onDelete={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export default function BarcodeGroupsTable() {
  const { barcodeGroups } = useBarcodeGroups()
  const t = useTranslations("barcodeGroups")

  return (
    <FieldSet>
      <FieldLegend>{t("table.barcodeGroupList")}</FieldLegend>
      <Table>
        <TableBody>
          {barcodeGroups.map((bg, i) => (
            <BarcodeGroupRow key={i} barcodeGroup={bg} />
          ))}
        </TableBody>
      </Table>
    </FieldSet>
  )
}
