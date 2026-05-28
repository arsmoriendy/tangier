export function formatCols({
  prioritizeColIdx,
  cols,
  align,
  gap,
  width,
}: {
  cols: string[]
  align: ("r" | "l")[]
  prioritizeColIdx: number
  gap: number
  width: number
}) {
  function pad(i: number) {
    return align[i] === "r"
      ? String.prototype.padStart
      : String.prototype.padEnd
  }

  const prioritizedCol = cols[prioritizeColIdx]
  const spaceLeft =
    width -
    prioritizedCol.length -
    (prioritizeColIdx === cols.length - 1 ? 0 : gap)
  if (spaceLeft < 1)
    return pad(prioritizeColIdx).call(prioritizedCol, width).substring(0, width)
  const colWidth = spaceLeft / (cols.length - 1)

  let line = ""

  for (const [i, col] of cols.entries()) {
    const optionalGap = i === cols.length - 1 ? 0 : gap
    const gapStr = "".padEnd(optionalGap)

    if (i === prioritizeColIdx) {
      line += col + gapStr
      continue
    }

    const colStr = col.substring(0, colWidth - optionalGap)
    line += pad(i).call(colStr + gapStr, colWidth)
  }

  return line
}
