/**
 * Minimal structural view of the transaction form used by the helpers below.
 * Kept narrow on purpose so these functions don't depend on the concrete
 * TanStack form type.
 */
type TransactionItemsForm = {
  state: {
    values: { transactionItems: { quantifiedSellPrice: number }[] }
  }
  getFieldValue: (field: any) => any
  setFieldValue: (field: any, value: any) => void
}

export function recalculateTotalPrice(form: TransactionItemsForm) {
  setIdempotentFieldValue(
    form,
    "totalPrice",
    form.state.values.transactionItems
      .map((i) => i.quantifiedSellPrice)
      .reduce((a, i) => a + i, 0)
  )
}

export function setIdempotentFieldValue(
  form: TransactionItemsForm,
  field: string,
  value: unknown
) {
  if (form.getFieldValue(field) !== value) form.setFieldValue(field, value)
}
