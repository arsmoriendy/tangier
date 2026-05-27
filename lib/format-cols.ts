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
  const spaceLeft = width - prioritizedCol.length - gap
  if (spaceLeft < 1)
    return pad(prioritizeColIdx).call(prioritizedCol, width).substring(0, width)
  const colWidth = width / cols.length

  let line = ""

  for (const [i, col] of cols.entries()) {
    const optionalGap = i === cols.length - 1 ? 0 : gap
    line += pad(i).call(pad(i).call(col, optionalGap), colWidth)
  }

  return line
}
