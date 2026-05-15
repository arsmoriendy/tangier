"use client"

import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultAddItemValues } from "@/app/(authorized)/transactions/add-item-schema"
import { withForm } from "@/components/form"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { readBarcode } from "@/lib/crud/barcodes"
import { useState } from "react"

export const ScanBarcodeField = withForm({
  defaultValues: defaultAddItemValues,
  render: function Render({ form }) {
    const { addItemProxy } = useAddItem()
    const [barcode, setBarcode] = useState("")
    const [error, setError] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)

    return (
      <div className="space-y-2">
        <Input
          aria-invalid={error ? "true" : "false"}
          value={barcode}
          disabled={loading}
          onChange={async ({ target: { value } }) => {
            setBarcode(value)
            setLoading(true)
            const res = await readBarcode(value)
            if (!res) {
              setError("No items with specified barcode")
              setLoading(false)
              return
            }
            setError(undefined)
            setLoading(false)
            setBarcode("")

            const { item } = res
            form.setFieldValue("name", item.name)
            form.setFieldValue("unit", item.unit.name)
            addItemProxy.sellPrices = item.sellPrices
          }}
        />
        {error && <FieldError>{error}</FieldError>}
      </div>
    )
  },
})
