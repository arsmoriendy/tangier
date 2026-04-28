"use client"

import { ItemsTable } from "@/app/items/items-table"
import { SearchBar } from "@/app/items/search-bar"
import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  createItem,
  getItemCount,
  ItemWithRelations,
  listItems,
} from "@/lib/crud/item"
import { priceGroups } from "@/lib/db/schema"
import { useEffect, useState } from "react"
import z from "zod"

export default function CreateItemForm(props: {
  priceGroups: (typeof priceGroups.$inferSelect)[]
}) {
  const createItemFormSchema = z.object({
    name: z.string().min(1),
    prices: z.array(
      z.object({ priceGroup: z.uuid(), price: z.number().min(0) })
    ),
  })
  const defaultValues: z.infer<typeof createItemFormSchema> = {
    name: "",
    prices: [],
  }
  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: createItemFormSchema,
      onMount: createItemFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createItem(value)
      await refreshItems()
    },
  })

  const itemsPerPage = 10
  const disabledClass =
    "cursor-not-allowed text-muted-foreground hover:text-muted-foreground"

  const [items, setItems] = useState<ItemWithRelations[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [page, setPage] = useState(0)
  const [searchName, setSearchName] = useState("")

  async function refreshItems() {
    setItems(
      await listItems({
        name: searchName,
        limit: itemsPerPage,
        offset: page * itemsPerPage,
      })
    )
  }

  useEffect(() => {
    getItemCount().then(setItemCount)

    refreshItems()
  }, [])

  useEffect(() => {
    refreshItems()
  }, [page, searchName])

  return (
    <>
      <FieldSet>
        <FieldLegend>Add item</FieldLegend>

        <Form handleSubmit={form.handleSubmit}>
          <form.AppField name="name">
            {(f) => <f.TextField label="Name" />}
          </form.AppField>

          <FieldSet>
            <FieldLegend>Prices</FieldLegend>
            {props.priceGroups.map(({ id, name }, i) => (
              <div key={i}>
                <form.Field name={`prices[${i}].priceGroup`}>
                  {() => <input type="hidden" value={id} />}
                </form.Field>
                <form.AppField name={`prices[${i}].price`}>
                  {(f) => <f.IdrField label={name} min={0} />}
                </form.AppField>
              </div>
            ))}
          </FieldSet>

          <form.AppForm>
            <form.SubmitButton>Create item</form.SubmitButton>
          </form.AppForm>
        </Form>
      </FieldSet>

      <FieldSet className="gap-0">
        <FieldLegend>Item list</FieldLegend>

        <SearchBar handleSearch={setSearchName} />

        <ItemsTable items={items} />

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  setPage(page - 1)
                }}
                className={page === 0 ? disabledClass : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  setPage(page + 1)
                }}
                className={
                  page * itemsPerPage >= itemCount ? disabledClass : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </FieldSet>
    </>
  )
}
