"use server"

import { db } from "@/lib/db"
import { transactionItems, transactions } from "@/lib/db/schema"
import { and, asc, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm"

export async function countTransactions({
  to = new Date(),
  from = new Date(to.getTime() - 3_600_000 * 3),
}: { from?: Date; to?: Date } = {}) {
  return (
    await db
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
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
  id = "",
  to = new Date(),
  from = new Date(to.getTime() - 3_600_000 * 3),
  offset = 0,
  limit = 10,
}: {
  id?: string
  from?: Date
  to?: Date
  offset?: number
  limit?: number
} = {}) {
  return await db.query.transactions.findMany({
    offset,
    limit,
    where: and(
      ilike(sql`${transactions.id}::text`, `%${id}%`),
      gte(transactions.createdAt, from.toUTCString()),
      lte(transactions.createdAt, to.toUTCString())
    ),
    with: { transactionItems: { columns: { transaction: false } } },
    orderBy: [desc(transactions.createdAt), asc(transactions.id)],
  })
}
