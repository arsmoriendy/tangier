"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLabel } from "@/components/ui/field"
import { createPriceGroup } from "@/lib/crud/price-group"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { useStore } from "@tanstack/react-form"
import { useEffect } from "react"
import z from "zod"

const createPriceGroupFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantityThreshold: z.number().min(0),
  hexColor: z.string().min(3).max(6),
})

/** Catpuccin mocha colors */
const colors = [
  "F5E0DC",
  "F2CDCD",
  "F5C2E7",
  "CBA6F7",
  "F38BA8",
  "EBA0AC",
  "FAB387",
  "F9E2AF",
  "A6E3A1",
  "94E2D5",
  "89DCEB",
  "74C7EC",
  "89B4FA",
  "B4BEFE",
  "CDD6F4",
  "BAC2DE",
  "A6ADC8",
  "9399B2",
  "7F849C",
  "6C7086",
  "585B70",
  "45475A",
  "313244",
  "1E1E2E",
  "181825",
  "11111B",
]

function getRandomColor() {
  return colors[parseInt((Math.random() * colors.length - 1).toFixed())]
}

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
