import z from "zod"

export const addItemSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  unitId: z.string().optional(),
  buyPrice: z.number().min(0),
  sellPrice: z.number().min(0),
  quantity: z.number(),
  quantifiedSellPrice: z.number().min(0),
})

export const defaultAddItemValues: z.infer<typeof addItemSchema> = {
  name: "",
  unit: "",
  unitId: undefined,
  buyPrice: 0,
  sellPrice: 0,
  quantity: 1,
  quantifiedSellPrice: 0,
}
