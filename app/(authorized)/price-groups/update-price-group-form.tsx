import { getRandomColor } from "@/app/(authorized)/price-groups/price-group-colors"
import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { deletePriceGroup, updatePriceGroup } from "@/lib/crud/price-group"
import { priceGroups } from "@/lib/db/schema"
import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
import z from "zod"

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
        children={(f) => <f.TextField label="Name" />}
      />

      <form.AppField name="quantityThreshold">
        {(f) => <f.NumberField label="Min qty" min={0} />}
      </form.AppField>

      <form.AppField name="hexColor">
        {(f) => (
          <div className="space-y-2">
            <FieldLabel>Color</FieldLabel>
            <div className="flex gap-2">
              <form.Subscribe selector={(state) => state.values.hexColor}>
                {(hexColor) => (
                  <div
                    className="group relative grid size-8 cursor-pointer place-items-center"
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
        children={(f) => <f.TextField label="Description" />}
      />

      <form.AppForm>
        <div className="flex gap-2">
          <form.SubmitButton>Update price group</form.SubmitButton>
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
            Delete price group
          </Button>
        </div>
      </form.AppForm>
    </Form>
  )
}
