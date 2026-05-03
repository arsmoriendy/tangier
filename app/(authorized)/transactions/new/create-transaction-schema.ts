import z from "zod"

export const createTransactionSchema = z.object({
  transactionItems: z
    .array(
      z.object({
        name: z.string().min(0),
        unit: z.string(),
        unitPrice: z.number().min(0),
        quantity: z.number().min(1),
        quantifiedPrice: z.number().min(0),
      })
    )
    .min(1),
  totalPrice: z.number().min(0),
  customerPriceGroup: z.string(),
})

export const defaultCreateTransacionValues: z.infer<
  typeof createTransactionSchema
> = {
  transactionItems: [],
  totalPrice: 0,
  customerPriceGroup: "",
}
