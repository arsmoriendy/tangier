"use server"

import { db } from "@/lib/db"
import { buyPrices, transactionItems, transactions } from "@/lib/db/schema"
import { buyPriceStockDeltas } from "@/lib/buy-price-stock"
import { and, asc, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm"

export async function countTransactions({
  id = "",
  to = new Date(),
  from = new Date(to.getTime() - 3_600_000 * 3),
}: { id?: string; from?: Date; to?: Date } = {}) {
  return (
    await db
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
          ilike(sql`${transactions.id}::text`, `%${id}%`),
          gte(transactions.createdAt, from.toUTCString()),
          lte(transactions.createdAt, to.toUTCString())
        )
      )
  )[0].count
}

export async function createTransaction({
  transactionItems: items,
  ...transaction
}: Omit<TransactionWithRelations, "createdAt" | "id">) {
  return await db.transaction(async (trx) => {
    const { id, createdAt } = (
      await trx
        .insert(transactions)
        .values(transaction)
        .returning({ id: transactions.id, createdAt: transactions.createdAt })
    )[0]

    await trx.insert(transactionItems).values(
      items.map(({ linkedBuyPrice, ...i }) => ({
        ...i,
        transaction: id,
      }))
    )

    // a held transaction doesn't move stock until it's saved as sold
    if (!transaction.held)
      for (const [buyPriceId, stockDelta] of buyPriceStockDeltas([], items))
        await trx
          .update(buyPrices)
          .set({ stock: sql`${buyPrices.stock} + ${stockDelta}` })
          .where(eq(buyPrices.id, buyPriceId))

    return { id, createdAt }
  })
}

export async function updateTransaction({
  transactionItems: items,
  id,
  ...transaction
}: Partial<Omit<TransactionWithRelations, "createdAt">> & { id: string }) {
  return await db.transaction(async (trx) => {
    const [prevTrx] = await trx
      .select({ held: transactions.held })
      .from(transactions)
      .where(eq(transactions.id, id))
      .for("update")

    if (!prevTrx) return

    await trx
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))

    if (!items) return

    // held transactions never moved stock, so there is nothing to restore
    const prevItems = prevTrx.held
      ? []
      : await trx
          .select({
            buyPriceId: transactionItems.buyPriceId,
            updateStock: transactionItems.updateStock,
            quantity: transactionItems.quantity,
          })
          .from(transactionItems)
          .where(eq(transactionItems.transaction, id))

    await trx
      .delete(transactionItems)
      .where(eq(transactionItems.transaction, id))

    await trx.insert(transactionItems).values(
      items.map(({ linkedBuyPrice, ...i }) => ({
        ...i,
        transaction: id,
      }))
    )

    const held = transaction.held ?? prevTrx.held
    if (held) return

    for (const [buyPriceId, stockDelta] of buyPriceStockDeltas(
      prevItems,
      items
    ))
      await trx
        .update(buyPrices)
        .set({ stock: sql`${buyPrices.stock} + ${stockDelta}` })
        .where(eq(buyPrices.id, buyPriceId))
  })
}

export async function readTransaction(id: string) {
  return await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: {
      transactionItems: {
        columns: { transaction: false },
        with: {
          linkedBuyPrice: {
            columns: { id: true, price: true, stock: true },
          },
        },
      },
    },
  })
}

export type TransactionWithRelations = PartialKey<
  NonNullable<Awaited<ReturnType<typeof readTransaction>>>,
  "held"
>

export async function deleteTransaction(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id))
}

export async function listTransactions({
  id = "",
  to = new Date(),
  from = new Date(to.getTime() - 3_600_000 * 3),
  offset = 0,
  limit,
  held = false,
}: {
  id?: string
  from?: Date
  to?: Date
  offset?: number
  limit?: number
  held?: boolean
} = {}) {
  return await db.query.transactions.findMany({
    offset,
    limit,
    where: and(
      ilike(sql`${transactions.id}::text`, `%${id}%`),
      gte(transactions.createdAt, from.toUTCString()),
      lte(transactions.createdAt, to.toUTCString()),
      eq(transactions.held, held)
    ),
    with: {
      transactionItems: {
        columns: { transaction: false },
        with: {
          linkedBuyPrice: {
            columns: { id: true, price: true, stock: true },
          },
        },
      },
    },
    orderBy: [desc(transactions.createdAt), asc(transactions.id)],
  })
}
