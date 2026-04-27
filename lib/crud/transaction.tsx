"use server"

import { db } from "@/lib/db"
import { transactionItems, transactions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function createTransaction({
  totalPrice,
  items,
}: typeof transactions.$inferInsert & {
  items: Omit<typeof transactionItems.$inferInsert, "transaction">[]
}) {
  return await db.transaction(async (trx) => {
    const { id, createdAt } = (
      await trx
        .insert(transactions)
        .values({ totalPrice })
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
