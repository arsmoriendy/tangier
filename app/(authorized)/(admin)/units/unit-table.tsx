"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useUnits } from "@/contexts/units-ctx"
import { units } from "@/lib/db/schema"
import { useState } from "react"
import UpdateUnitForm from "./update-unit-form"

function UnitRow({ unit }: { unit: typeof units.$inferSelect }) {
  const [openDialog, setDialogOpen] = useState(false)

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{unit.name}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Update unit</DialogTitle>
        <UpdateUnitForm
          unit={unit}
          onSubmit={() => setDialogOpen(false)}
          onDelete={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export default function UnitTable() {
  const { units } = useUnits()
  return (
    <FieldSet>
      <FieldLegend>Unit list</FieldLegend>
      <Table>
        <TableBody>
          {units.map((unit) => (
            <UnitRow key={unit.id} unit={unit} />
          ))}
        </TableBody>
      </Table>
    </FieldSet>
  )
}
