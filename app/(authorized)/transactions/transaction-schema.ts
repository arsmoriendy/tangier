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
        extraFields: z.object({
          link: z
            .object({
              itemId: z.uuid(),
              originalBuyPrice: z.number().min(0).optional(),
              updateStock: z.boolean(),
            })
            .optional(),
          quantifiedPrice: z.number().min(0),
        }),
      })
    )
    .min(1),
  totalPrice: z.number().min(0),
  customerPriceGroup: z.string(),
})

export const defaultTransactionValues: z.infer<typeof transactionSchema> = {
  transactionItems: [],
  totalPrice: 0,
  customerPriceGroup: "",
}
