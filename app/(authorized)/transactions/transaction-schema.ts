import z from "zod"

export const transactionSchema = z.object({
  transactionItems: z
    .array(
      z.object({
        name: z.string().min(0),
        unit: z.string(),
        buyPrice: z.number().min(0),
        sellPrice: z.number().min(0),
        quantity: z.number(),
        quantifiedSellPrice: z.number().min(0),

        buyPriceId: z.uuid().nullable(),
        updateStock: z.boolean(),
      })
    )
    .min(1),
  totalPrice: z.number().min(0),
  priceGroup: z.string().optional(),
})

export type TransactionSchema = z.infer<typeof transactionSchema>

export const defaultTransactionValues: TransactionSchema = {
  transactionItems: [],
  totalPrice: 0,
}
