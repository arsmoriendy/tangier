import { Form, useAppForm } from "@/components/form"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import z from "zod"
import { useItemFilters } from "./item-filters-ctx"
import { useTranslations } from "next-intl"

export function SearchBar() {
  const { itemFiltersProxy } = useItemFilters()
  const t = useTranslations("items")
  const formSchema = z.object({ name: z.string() })
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onChange: formSchema,
      onMount: formSchema,
    },
    onSubmit: async ({ value: { name } }) => {
      itemFiltersProxy.name = name
      itemFiltersProxy.offset = 0
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit} className="flex gap-2 space-y-0">
      <form.AppField name="name">
        {(field) => <field.TextField placeholder={t("search.placeholder")} />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton size="icon">
          <MagnifyingGlassIcon />
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
