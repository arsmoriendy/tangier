"use server"

import { db } from "@/lib/db"
import { barcodes } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function readBarcode(barcode: string) {
  return await db.query.barcodes.findFirst({
    where: eq(barcodes.barcode, barcode),
    columns: {},
    with: {
      barcodeGroup: true,
      item: {
        // match `ItemWithRelations`
        columns: { unit: false },
        with: {
          unit: true,
          barcodes: {
            columns: { barcode: true },
            with: { barcodeGroup: true },
          },
          sellPrices: {
            columns: { price: true },
            with: { priceGroup: true },
          },
        },
      },
    },
  })
}
