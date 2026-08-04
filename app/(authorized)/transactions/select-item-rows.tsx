import { TableCell, TableRow } from "@/components/ui/table"
import type { ItemWithRelations } from "@/lib/crud/items"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

const DEFAULT_SELECTED_IDX = 0

export function SelectItemRows({
  items,
  onSelect,
}: {
  items: ItemWithRelations[]
  onSelect: (item: ItemWithRelations) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState(DEFAULT_SELECTED_IDX)
  const idxRef = useRef(DEFAULT_SELECTED_IDX)
  const trs = useRef<HTMLTableRowElement[]>([])

  useEffect(() => {
    const selectedTr = trs.current.at(selectedIdx)
    if (document.activeElement !== selectedTr) selectedTr?.focus()
    selectedTr?.scrollTo()

    idxRef.current = selectedIdx
  }, [selectedIdx])

  function handleKeys(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        setSelectedIdx((i) => Math.max(0, i - 1))
        break
      case "ArrowDown":
        e.preventDefault()
        setSelectedIdx((i) => Math.min(items.length - 1, i + 1))
        break
      case "Enter":
        e.preventDefault()
        onSelect(items[idxRef.current])
        break
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeys)
    return () => document.removeEventListener("keydown", handleKeys)
  }, [])

  return (
    <>
      {items.map((item, i) => (
        <TableRow
          ref={(tr) => {
            if (tr) trs.current[i] = tr
            else delete trs.current[i]
          }}
          tabIndex={i + 1}
          key={i}
          role="button"
          className={cn(
            "cursor-pointer transition-none outline-none",
            i === selectedIdx && "text-background [&_td]:bg-primary"
          )}
          onFocus={() => setSelectedIdx(i)}
          onClick={() => onSelect(items[i])}
        >
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.unit.name}</TableCell>
        </TableRow>
      ))}
    </>
  )
}
