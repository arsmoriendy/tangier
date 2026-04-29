"use client"

import UpdatePriceGroupForm from "@/app/price-groups/update-price-group-form"
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
import { priceGroups } from "@/lib/db/schema"
import { useState } from "react"

function PriceGroupRow({
  priceGroup,
}: {
  priceGroup: typeof priceGroups.$inferSelect
}) {
  const [openDialog, setDialogOpen] = useState(false)

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{priceGroup.name}</TableCell>
          <TableCell>{priceGroup.quantityThreshold}</TableCell>
          <TableCell>{priceGroup.hexColor}</TableCell>
          <TableCell>{priceGroup.description}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Update price group</DialogTitle>
        <UpdatePriceGroupForm
          onSumbit={() => setDialogOpen(false)}
          priceGroup={priceGroup}
        />
      </DialogContent>
    </Dialog>
  )
}

export default function PriceGroupTable(props: {
  priceGroups: (typeof priceGroups.$inferSelect)[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Min qty</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.priceGroups.map((pg, i) => (
          <PriceGroupRow key={i} priceGroup={pg} />
        ))}
      </TableBody>
    </Table>
  )
}
