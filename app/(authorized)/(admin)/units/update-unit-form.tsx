import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { useUnits } from "@/contexts/units-ctx"
import { deleteUnit, updateUnit } from "@/lib/crud/units"
import { units } from "@/lib/db/schema"
import { TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import z from "zod"

const updateUnitFormSchema = z.object({
  name: z.string().min(1),
})

export default function UpdateUnitForm(props: {
  onSubmit?: (value: z.infer<typeof updateUnitFormSchema>) => any
  onDelete?: () => any
  unit: typeof units.$inferSelect
}) {
  const { units: allUnits, setUnits } = useUnits()
  const t = useTranslations("units")
  const commonT = useTranslations("common")
  const defaultValues: z.infer<typeof updateUnitFormSchema> = {
    name: props.unit.name,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: updateUnitFormSchema,
      onChange: updateUnitFormSchema,
    },
    onSubmit: async ({ value }) => {
      await updateUnit({ id: props.unit.id, ...value })
      setUnits(
        allUnits.map((u) => (u.id === props.unit.id ? { ...u, ...value } : u))
      )
      props.onSubmit?.(value)
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField
        name="name"
        children={(f) => <f.TextField label={commonT("name")} />}
      />

      <form.AppForm>
        <div className="flex gap-2">
          <form.SubmitButton>{t("form.update")}</form.SubmitButton>
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await deleteUnit(props.unit.id)
              setUnits((prev) => prev.filter((u) => u.id !== props.unit.id))
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
