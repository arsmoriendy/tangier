import z from "zod"

export const transactionSchema = z.object({
  transactionItems: z
    .array(
      z.object({
        name: z.string().min(0),
        unit: z.string(),
        buyPrice: z.number().min(0),
        sellPrice: z.number().min(0),
        quantity: z.number().min(1),

        buyPriceId: z.uuid().nullable(),
        updateStock: z.boolean(),

        extraFields: z.object({
          quantifiedPrice: z.number().min(0),
        }),
      })
    )
    .min(1),
  totalPrice: z.number().min(0),
  priceGroup: z.string().optional(),
  held: z.boolean().optional(),
})

export const defaultTransactionValues: z.infer<typeof transactionSchema> = {
  transactionItems: [],
  totalPrice: 0,
}
