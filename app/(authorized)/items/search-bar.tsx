import { useItemFilters } from "@/app/(authorized)/items/item-filters-ctx"
import { Form, useAppForm } from "@/components/form"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import z from "zod"

export function SearchBar() {
  const { itemFiltersProxy } = useItemFilters()
  const formSchema = z.object({ name: z.string() })
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onChange: formSchema,
      onMount: formSchema,
      onSubmit: async ({ value: { name } }) => {
        itemFiltersProxy.name = name
        itemFiltersProxy.offset = 0
      },
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit} className="flex gap-2 space-y-0">
      <form.AppField name="name">
        {(field) => <field.TextField placeholder="Search name" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton size="icon">
          <MagnifyingGlassIcon />
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
