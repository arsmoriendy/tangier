"use server"

import { db } from "@/lib/db"
import { transactionItems, transactions } from "@/lib/db/schema"
import { and, eq, gte, lte } from "drizzle-orm"

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

    await trx
      .insert(transactionItems)
      .values(items.map((i) => ({ ...i, transaction: id })))
    return { id, createdAt }
  })
}

export async function readTransaction(id: string) {
  return await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: { transactionItems: { columns: { transaction: false } } },
  })
}

export type TransactionWithRelations = NonNullable<
  Awaited<ReturnType<typeof readTransaction>>
>

export async function listTransactions({
  from,
  to,
  offset = 0,
  limit = 10,
}: {
  from: Date
  to: Date
  offset?: number
  limit?: number
}) {
  return await db.query.transactions.findMany({
    offset,
    limit,
    where: and(
      gte(transactions.createdAt, from.toUTCString()),
      lte(transactions.createdAt, to.toUTCString())
    ),
    with: { transactionItems: { columns: { transaction: false } } },
  })
}
