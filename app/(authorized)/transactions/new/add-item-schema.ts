import z from "zod"

export const addItemSchema = z.object({
  name: z.string().min(1),
  unit: z.string(),
  buyPrice: z.number().min(0),
  unitPrice: z.number().min(0),
  quantity: z.number().min(1),
  quantifiedPrice: z.number().min(0),
})

export const defaultAddItemValues: z.infer<typeof addItemSchema> = {
  name: "",
  unit: "",
  buyPrice: 0,
  unitPrice: 0,
  quantity: 1,
  quantifiedPrice: 0,
}
