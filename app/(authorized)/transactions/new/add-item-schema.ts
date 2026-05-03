import z from "zod"

export const addItemSchema = z.object({
  name: z.string().min(1),
  unit: z.string().optional(),
  unitPrice: z.number().min(0),
  quantity: z.number().min(1),
  quantifiedPrice: z.number().min(0),
})

export const defaultAddItemValues: z.infer<typeof addItemSchema> = {
  name: "",
  unitPrice: 0,
  quantity: 1,
  quantifiedPrice: 0,
}
