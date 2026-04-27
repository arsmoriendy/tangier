import { Form, useAppForm } from "@/components/form"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import * as z from "zod"

export function SearchBar(props: { handleSearch: (name: string) => any }) {
  const formSchema = z.object({ name: z.string() })
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onChange: formSchema,
      onMount: formSchema,
      onSubmit: ({ value: { name } }) => props.handleSearch(name),
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit} className="flex gap-2">
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
