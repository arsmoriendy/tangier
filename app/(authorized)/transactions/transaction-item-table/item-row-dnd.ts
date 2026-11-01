import { type DragEvent } from "react"

type DndForm = {
  moveFieldValues: (name: "transactionItems", from: number, to: number) => void
}

export function itemRowDndHandlers(form: DndForm, i: number) {
  function onDragStart(e: DragEvent<HTMLTableRowElement>) {
    e.dataTransfer.setData("text/plain", i.toString())
    e.currentTarget.setAttribute("data-state", "selected")
  }

  function onDragEnd(e: DragEvent<HTMLTableRowElement>) {
    e.currentTarget.removeAttribute("data-state")
  }

  function onDragOver(e: DragEvent<HTMLTableRowElement>) {
    e.preventDefault()

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const yPct = y / rect.height

    e.currentTarget.removeAttribute("data-drop")
    e.currentTarget.setAttribute("data-drop", yPct > 0.5 ? "bottom" : "top")
  }

  function onDragLeave(e: DragEvent<HTMLTableRowElement>) {
    e.currentTarget.removeAttribute("data-drop")
  }

  function onDrop(e: DragEvent<HTMLTableRowElement>) {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"))
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const yPct = y / rect.height

    e.currentTarget.removeAttribute("data-drop")

    form.moveFieldValues(
      "transactionItems",
      sourceIndex,
      yPct > 0.5 ? i + 1 : i
    )
  }

  return { onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }
}
