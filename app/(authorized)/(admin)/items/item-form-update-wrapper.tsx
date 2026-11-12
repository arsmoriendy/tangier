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
import { useTranslations } from "next-intl"

export function ItemFormUpdateWrapper({
  children,
  ...props
}: {
  children: ReactNode
  item: DeepReadonly<ItemWithRelations>
}) {
  const { itemsProxy } = useItems()
  const [openDialog, setOpenDialog] = useState(false)
  const t = useTranslations("items")

  function findItemIdx() {
    return itemsProxy.findIndex((item) => item.id === props.item.id)
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[92vw] overflow-auto pt-0 sm:max-w-[92vw]">
        <DialogHeader>
          <DialogTitle className="mt-4">{t("form.update")}</DialogTitle>
        </DialogHeader>

        <ItemForm
          item={props.item}
          afterUpdate={(newItem) => {
            const i = findItemIdx()
            if (i !== -1) itemsProxy[i] = newItem
            setOpenDialog(false)
          }}
          afterDelete={() => {
            const i = findItemIdx()
            if (i !== -1) itemsProxy.splice(i, 1)
            setOpenDialog(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
