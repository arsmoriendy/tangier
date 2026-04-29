"use client"

import { getRandomColor } from "@/app/price-groups/price-group-colors"
import { Form, useAppForm } from "@/components/form"
import { FieldLabel } from "@/components/ui/field"
import { createPriceGroup } from "@/lib/crud/price-group"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { useEffect } from "react"
import z from "zod"

const createPriceGroupFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantityThreshold: z.number().min(0),
  hexColor: z.string().min(3).max(6),
})

export default function CreatePriceGroupForm() {
  const defaultValues: z.infer<typeof createPriceGroupFormSchema> = {
    name: "",
    hexColor: "",
    quantityThreshold: 0,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createPriceGroupFormSchema,
      onChange: createPriceGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createPriceGroup(value)
    },
  })

  useEffect(() => {
    form.setFieldValue("hexColor", getRandomColor())
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <div className="flex gap-2">
        <form.AppField
          name="name"
          children={(f) => <f.TextField label="Name" className="w-sm" />}
        />

        <form.AppField name="quantityThreshold">
          {(f) => <f.NumberField label="Min qty" min={0} className="w-24" />}
        </form.AppField>

        <form.AppField name="hexColor">
          {(f) => (
            <div className="w-sm space-y-2">
              <FieldLabel>Color</FieldLabel>
              <div className="flex gap-2">
                <form.Subscribe selector={(state) => state.values.hexColor}>
                  {(hexColor) => (
                    <div
                      className="group relative grid size-8 cursor-pointer place-items-center bg-black"
                      onClick={() =>
                        form.setFieldValue("hexColor", getRandomColor())
                      }
                    >
                      <ArrowsClockwiseIcon className="z-1 hidden group-hover:block" />
                      <div
                        className="absolute size-8 group-hover:opacity-90"
                        style={{ backgroundColor: `#${hexColor}` }}
                      />
                    </div>
                  )}
                </form.Subscribe>
                <f.TextField />
              </div>
            </div>
          )}
        </form.AppField>

        <form.AppField
          name="description"
          children={(f) => <f.TextField label="Description" />}
        />
      </div>

      <form.AppForm>
        <form.SubmitButton>Create price group</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
