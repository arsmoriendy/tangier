import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"
import { useTranslations } from "next-intl"
import {
  deleteBarcodeGroup,
  updateBarcodeGroup,
} from "@/lib/crud/barcode-groups"
import { barcodeGroups } from "@/lib/db/schema"
import { TrashIcon } from "@phosphor-icons/react/dist/ssr"
import z from "zod"

const updateBarcodeGroupFormSchema = z.object({
  name: z.string().min(1),
})

export default function UpdateBarcodeGroupForm(props: {
  onSubmit?: (value: z.infer<typeof updateBarcodeGroupFormSchema>) => any
  onDelete?: () => any
  barcodeGroup: typeof barcodeGroups.$inferSelect
}) {
  const { barcodeGroups, setBarcodeGroups } = useBarcodeGroups()
  const t = useTranslations("barcodeGroups")
  const commonT = useTranslations("common")
  const defaultValues: z.infer<typeof updateBarcodeGroupFormSchema> = {
    name: props.barcodeGroup.name,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: updateBarcodeGroupFormSchema,
      onChange: updateBarcodeGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      await updateBarcodeGroup({ id: props.barcodeGroup.id, ...value })
      setBarcodeGroups(
        barcodeGroups.map((bg) =>
          bg.id === props.barcodeGroup.id ? { ...bg, ...value } : bg
        )
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
              await deleteBarcodeGroup(props.barcodeGroup.id)
              setBarcodeGroups((bgs) =>
                bgs.filter((bg) => bg.id !== props.barcodeGroup.id)
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
