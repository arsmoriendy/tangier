import z from "zod"

export const addItemSchema = z.object({
  name: z.string().min(1),
  unitId: z.string().min(1),
  buyPrice: z.number().min(0),
  sellPrice: z.number().min(0),
  quantity: z.number(),
  quantifiedPrice: z.number().min(0),
})

export const defaultAddItemValues: z.infer<typeof addItemSchema> = {
  name: "",
  unitId: "",
  buyPrice: 0,
  sellPrice: 0,
  quantity: 1,
  quantifiedPrice: 0,
}
