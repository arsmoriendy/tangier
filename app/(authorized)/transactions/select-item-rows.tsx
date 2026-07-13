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

  useEffect(() => {
    idxRef.current = selectedIdx
  }, [selectedIdx])

  function handleKeys(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowUp":
        setSelectedIdx((i) => Math.max(0, i - 1))
        break
      case "ArrowDown":
        setSelectedIdx((i) => Math.min(items.length - 1, i + 1))
        break
      case "Enter":
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
          key={i}
          role="button"
          className={cn(
            "cursor-pointer",
            i === selectedIdx && "text-background [&_td]:bg-primary"
          )}
          onMouseOver={() => setSelectedIdx(i)}
          onClick={() => onSelect(items[idxRef.current])}
        >
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.unit.name}</TableCell>
        </TableRow>
      ))}
    </>
  )
}
