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
    const mouseUnder = y / rect.height > 0.5

    e.currentTarget.removeAttribute("data-drop")
    e.currentTarget.setAttribute("data-drop", mouseUnder ? "bottom" : "top")
  }

  function onDragLeave(e: DragEvent<HTMLTableRowElement>) {
    e.currentTarget.removeAttribute("data-drop")
  }

  function onDrop(e: DragEvent<HTMLTableRowElement>) {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"))
    e.currentTarget.removeAttribute("data-drop")

    if (i === sourceIndex) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const mouseUnder = y / rect.height > 0.5
    const mouseAbove = !mouseUnder

    const moveUp = sourceIndex > i
    const moveDown = !moveUp

    let swapIndex = 0
    if (moveUp && mouseUnder) swapIndex = i + 1
    else if (moveUp && mouseAbove) swapIndex = i
    else if (moveDown && mouseUnder) swapIndex = i
    else if (moveDown && mouseAbove) swapIndex = i - 1

    form.moveFieldValues("transactionItems", sourceIndex, swapIndex)
  }

  return { onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }
}
