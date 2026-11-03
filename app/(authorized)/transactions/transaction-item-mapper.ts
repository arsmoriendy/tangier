import { quantifiedSellPrice } from "@/lib/quantified-sell-price"
import type { TransactionWithRelations } from "@/lib/crud/transactions"
import type { TransactionSchema } from "@/app/(authorized)/transactions/transaction-schema"

type DbTransactionItem = TransactionWithRelations["transactionItems"][number]
type FormTransactionItem = TransactionSchema["transactionItems"][number]

export function toLinkedBuyPrice(
  buyPrice: { id: string; price: number; stock: number } | null | undefined
): FormTransactionItem["linkedBuyPrice"] {
  return buyPrice
    ? {
        id: buyPrice.id,
        price: buyPrice.price,
        stock: buyPrice.stock,
      }
    : null
}

export function toFormItem(item: DbTransactionItem): FormTransactionItem {
  const { buyPriceId, ...rest } = item
  return {
    ...rest,
    quantifiedSellPrice: quantifiedSellPrice(item),
  }
}

export function withBuyPriceId(item: FormTransactionItem): DbTransactionItem {
  return {
    ...item,
    buyPriceId: item.linkedBuyPrice?.id ?? null,
  }
}
