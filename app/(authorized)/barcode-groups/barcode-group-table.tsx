"use client"

import UpdateBarcodeGroupForm from "@/app/(authorized)/barcode-groups/update-barcode-group-form"
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
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"
import { barcodeGroups } from "@/lib/db/schema"
import { useState } from "react"

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {barcodeGroups.map((bg, i) => (
          <BarcodeGroupRow key={i} barcodeGroup={bg} />
        ))}
      </TableBody>
    </Table>
  )
}
