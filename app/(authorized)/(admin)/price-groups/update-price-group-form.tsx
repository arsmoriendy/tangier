import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { deletePriceGroup, updatePriceGroup } from "@/lib/crud/price-groups"
import { priceGroups } from "@/lib/db/schema"
import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import z from "zod"
import { getRandomColor } from "./price-group-colors"

const createPriceGroupFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantityThreshold: z.number().min(0),
  hexColor: z.string().min(3).max(6),
})

export default function UpdatePriceGroupForm(props: {
  onSumbit?: (value: z.infer<typeof createPriceGroupFormSchema>) => any
  onDelete?: () => any
  priceGroup: typeof priceGroups.$inferSelect
}) {
  const { priceGroups, setPriceGroups } = usePriceGroups()
  const t = useTranslations("priceGroups")
  const commonT = useTranslations("common")
  const defaultValues: z.infer<typeof createPriceGroupFormSchema> = {
    name: props.priceGroup.name,
    hexColor: props.priceGroup.hexColor,
    quantityThreshold: props.priceGroup.quantityThreshold ?? 0,
    description: props.priceGroup.description ?? "",
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createPriceGroupFormSchema,
      onChange: createPriceGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      await updatePriceGroup({ id: props.priceGroup.id, ...value })
      Object.assign(
        priceGroups.find((pg) => pg.id === props.priceGroup.id)!,
        value
      )
      setPriceGroups(priceGroups)
      props.onSumbit?.(value)
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField
        name="name"
        children={(f) => <f.TextField label={commonT("name")} />}
      />

      <form.AppField name="quantityThreshold">
        {(f) => <f.NumberField label={t("form.quantityThreshold")} min={0} />}
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
              <f.TextField />
            </div>
          </div>
        )}
      </form.AppField>

      <form.AppField
        name="description"
        children={(f) => <f.TextField label={t("form.description")} />}
      />

      <form.AppForm>
        <div className="flex gap-2">
          <form.SubmitButton>{t("form.update")}</form.SubmitButton>
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await deletePriceGroup(props.priceGroup.id)
              setPriceGroups((pgs) =>
                pgs.filter((pg) => pg.id !== props.priceGroup.id)
              )
              props.onDelete?.()
            }}
          >
            <TrashIcon />
            {t("form.delete")}
          </Button>
        </div>
      </form.AppForm>
    </Form>
  )
}
