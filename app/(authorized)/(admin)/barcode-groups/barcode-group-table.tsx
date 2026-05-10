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
import { barcodeGroups } from "@/lib/db/schema"
import { useState } from "react"
import UpdateBarcodeGroupForm from "./update-barcode-group-form"

function BarcodeGroupRow({
  barcodeGroup,
}: {
  barcodeGroup: typeof barcodeGroups.$inferSelect
}) {
  const [openDialog, setDialogOpen] = useState(false)

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{barcodeGroup.name}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Update barcode group</DialogTitle>
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
  return (
    <FieldSet>
      <FieldLegend>Barcode group list</FieldLegend>
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
