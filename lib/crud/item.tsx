"use server"

import { db } from "@/lib/db"
import {
  items,
  sellPrices as pricesTable,
  barcodes as barcodesTable,
} from "@/lib/db/schema"
import { and, count, eq, ilike } from "drizzle-orm"

export async function countItems({
  name = "",
  unitId = undefined,
}: { name?: string; unitId?: string } = {}) {
  return (
    await db
      .select({ count: count() })
      .from(items)
      .where(
        and(
          ilike(items.name, `%${name}%`),
          unitId ? eq(items.unit, unitId) : undefined
        )
      )
  )[0].count
}

export async function createItem({
  name,
  unit,
  sellPrices = [],
  barcodes = [],
}: {
  name: string
  unit: string
  sellPrices?: { priceGroup: string; price: number }[]
  barcodes?: { barcodeGroup: string; barcode: string }[]
}) {
  await db.transaction(async (tx) => {
    const { id: item } = (
      await tx.insert(items).values({ name, unit }).returning({ id: items.id })
    )[0]

    sellPrices = sellPrices.filter((p) => p.price > 0)
    barcodes = barcodes.filter((b) => b.barcode.length > 0)

    sellPrices.length > 0 &&
      (await tx.insert(pricesTable).values(
        sellPrices.map(({ price, priceGroup }) => ({
          item,
          price,
          priceGroup,
        }))
      ))

    barcodes.length > 0 &&
      (await tx.insert(barcodesTable).values(
        barcodes.map(({ barcode, barcodeGroup }) => ({
          item,
          barcode,
          barcodeGroup,
        }))
      ))
  })
}

export async function listItems({
  name = "",
  unitId = "",
  limit = 10,
  offset = 0,
}: {
  name?: string
  unitId?: string
  limit?: number
  offset?: number
} = {}) {
  return await db.query.items.findMany({
    where: and(
      ilike(items.name, `%${name}%`),
      unitId.length > 0 ? eq(items.unit, unitId) : undefined,
      undefined
    ),
    limit,
    offset,
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
  })
}

export type ItemWithRelations = Awaited<ReturnType<typeof listItems>>[number]
