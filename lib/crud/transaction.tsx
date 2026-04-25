"use server"

import { db } from "@/lib/db"
import { transactionItems, transactions } from "@/lib/db/schema"

export async function createTransaction({
  totalPrice,
  items,
}: typeof transactions.$inferInsert & {
  items: Omit<typeof transactionItems.$inferInsert, "transaction">[]
}) {
  db.transaction(async (trx) => {
    const { id } = (
      await trx
        .insert(transactions)
        .values({ totalPrice })
        .returning({ id: transactions.id })
    )[0]

    await trx
      .insert(transactionItems)
      .values(items.map((i) => ({ ...i, transaction: id })))
  })
}
