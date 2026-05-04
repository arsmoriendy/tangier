"use server"

import { db } from "@/lib/db"
import { barcodes, buyPrices } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

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
          buyPrices: {
            orderBy: [asc(buyPrices.price)],
            columns: { item: false },
          },
        },
      },
    },
  })
}
