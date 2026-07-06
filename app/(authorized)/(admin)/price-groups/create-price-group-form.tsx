"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { createPriceGroup, listPriceGroups } from "@/lib/crud/price-groups"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { useEffect } from "react"
import { useTranslations } from "next-intl"
import z from "zod"
import { getRandomColor } from "../../../../lib/catpuccun-colors"

const createPriceGroupFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priority: z.number().min(0),
  hexColor: z.string().min(3).max(6),
})

export default function CreatePriceGroupForm() {
  const { setPriceGroups } = usePriceGroups()
  const t = useTranslations("priceGroups")
  const ct = useTranslations("common")
  const defaultValues: z.infer<typeof createPriceGroupFormSchema> = {
    name: "",
    hexColor: "",
    priority: 0,
    description: "",
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createPriceGroupFormSchema,
      onChange: createPriceGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createPriceGroup(value)
      setPriceGroups(await listPriceGroups())
      form.setFieldValue("hexColor", getRandomColor())
      form.reset()
    },
  })

  useEffect(() => {
    form.setFieldValue("hexColor", getRandomColor())
  }, [])

  return (
    <FieldSet>
      <FieldLegend>{t("createNew")}</FieldLegend>

      <Form handleSubmit={form.handleSubmit}>
        <div className="flex gap-2">
          <form.AppField
            name="name"
            children={(f) => <f.TextField label={ct("name")} />}
          />

          <form.AppField name="priority">
            {(f) => (
              <f.NumberField className="w-18" label={ct("priority")} min={0} />
            )}
          </form.AppField>

          <form.AppField name="hexColor">
            {(f) => (
              <div className="space-y-2">
                <FieldLabel>{t("form.color")}</FieldLabel>
                <div className="flex gap-2">
                  <form.Subscribe selector={(state) => state.values.hexColor}>
                    {(hexColor) => (
                      <div
                        className="group relative grid size-8 cursor-pointer place-items-center"
                        title={t("form.randomColor")}
                        onClick={() =>
                          form.setFieldValue("hexColor", getRandomColor())
                        }
                      >
                        <ArrowsClockwiseIcon className="z-1 hidden group-hover:block" />
                        <div
                          className="absolute size-8 rounded-full group-hover:opacity-90"
                          style={{ backgroundColor: `#${hexColor}` }}
                        />
                      </div>
                    )}
                  </form.Subscribe>
                  <f.TextField className="min-w-16" />
                </div>
              </div>
            )}
          </form.AppField>
        </div>

        <form.AppField name="description">
          {(f) => <f.TextField label={t("form.description")} />}
        </form.AppField>

        <form.AppForm>
          <form.SubmitButton>{t("form.create")}</form.SubmitButton>
        </form.AppForm>
      </Form>
    </FieldSet>
  )
}
