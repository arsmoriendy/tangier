"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useItems } from "@/contexts/items-ctx"
import { ReactNode, useState } from "react"
import ItemForm from "./item-form"
import { ItemWithRelations } from "@/lib/crud/items"

export function ItemFormUpdateWrapper({
  children,
  ...props
}: {
  children: ReactNode
  item: DeepReadonly<ItemWithRelations>
}) {
  const { itemsProxy } = useItems()
  const [openDialog, setOpenDialog] = useState(false)

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[92vw] overflow-auto pt-0 sm:max-w-[92vw]">
        <DialogHeader>
          <DialogTitle className="mt-4">Update item</DialogTitle>
        </DialogHeader>

        <ItemForm
          item={props.item}
          afterUpdate={(newItem) => {
            const i = itemsProxy.findIndex((item) => item.id === props.item.id)
            itemsProxy[i] = newItem
            setOpenDialog(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
