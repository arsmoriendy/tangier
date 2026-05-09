"use server"

import { db } from "@/lib/db"
import {
  items,
  sellPrices as sellPricesTbl,
  buyPrices as buyPricesTbl,
  barcodes as barcodesTbl,
} from "@/lib/db/schema"
import { and, asc, count, eq, ilike } from "drizzle-orm"

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
  buyPrices = [],
  sellPrices = [],
  barcodes = [],
}: {
  name: string
  unit: string
  sellPrices?: { priceGroup: string; price: number }[]
  buyPrices?: { price: number; stock: number }[]
  barcodes?: { barcodeGroup: string; barcode: string }[]
}) {
  await db.transaction(async (tx) => {
    const { id: item } = (
      await tx.insert(items).values({ name, unit }).returning({ id: items.id })
    )[0]

    sellPrices = sellPrices.filter((p) => p.price > 0)
    barcodes = barcodes.filter((b) => b.barcode.length > 0)

    type Price = number
    type Stock = number
    const buyPriceStockMap = new Map<Price, Stock>()
    for (const bp of buyPrices) {
      const oldStock = buyPriceStockMap.get(bp.price)
      if (oldStock === undefined) buyPriceStockMap.set(bp.price, bp.stock)
      else buyPriceStockMap.set(bp.price, oldStock + bp.stock)
    }

    buyPrices.length > 0 &&
      (await tx.insert(buyPricesTbl).values(
        buyPriceStockMap
          .entries()
          .map(([price, stock]) => ({ item, price, stock }))
          .toArray()
      ))

    sellPrices.length > 0 &&
      (await tx.insert(sellPricesTbl).values(
        sellPrices.map(({ price, priceGroup }) => ({
          item,
          price,
          priceGroup,
        }))
      ))

    barcodes.length > 0 &&
      (await tx.insert(barcodesTbl).values(
        barcodes.map(({ barcode, barcodeGroup }) => ({
          item,
          barcode,
          barcodeGroup,
        }))
      ))
  })
}

export async function updateItem({
  id,
  name,
  unit,
  buyPrices = [],
  sellPrices = [],
  barcodes = [],
}: {
  id: string
  name: string
  unit: string
  sellPrices?: { priceGroup: string; price: number }[]
  buyPrices?: { price: number; stock: number }[]
  barcodes?: { barcodeGroup: string; barcode: string }[]
}) {
  return await db.transaction(async (tx) => {
    await tx.update(items).set({ name, unit }).where(eq(items.id, id))

    sellPrices = sellPrices.filter((p) => p.price > 0)
    barcodes = barcodes.filter((b) => b.barcode.length > 0)

    type Price = number
    type Stock = number
    const buyPriceStockMap = new Map<Price, Stock>()
    for (const bp of buyPrices) {
      const oldStock = buyPriceStockMap.get(bp.price)
      if (oldStock === undefined) buyPriceStockMap.set(bp.price, bp.stock)
      else buyPriceStockMap.set(bp.price, oldStock + bp.stock)
    }

    await tx.delete(buyPricesTbl).where(eq(buyPricesTbl.item, id))
    buyPrices.length > 0 &&
      (await tx.insert(buyPricesTbl).values(
        buyPriceStockMap
          .entries()
          .map(([price, stock]) => ({ item: id, price, stock }))
          .toArray()
      ))

    await tx.delete(sellPricesTbl).where(eq(sellPricesTbl.item, id))
    sellPrices.length > 0 &&
      (await tx.insert(sellPricesTbl).values(
        sellPrices.map(({ price, priceGroup }) => ({
          item: id,
          price,
          priceGroup: priceGroup,
        }))
      ))

    await tx.delete(barcodesTbl).where(eq(barcodesTbl.item, id))
    barcodes.length > 0 &&
      (await tx.insert(barcodesTbl).values(
        barcodes.map(({ barcode, barcodeGroup }) => ({
          item: id,
          barcode,
          barcodeGroup: barcodeGroup,
        }))
      ))

    return (await tx.query.items.findFirst({
      where: eq(items.id, id),
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
          orderBy: [asc(buyPricesTbl.price)],
          columns: { item: false },
        },
      },
    }))!
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
      buyPrices: {
        orderBy: [asc(buyPricesTbl.price)],
        columns: { item: false },
      },
    },
  })
}

export type ItemWithRelations = Awaited<ReturnType<typeof listItems>>[number]
