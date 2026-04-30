/** Catpuccin mocha colors */
export const colors = [
  "F5E0DC",
  "F2CDCD",
  "F5C2E7",
  "CBA6F7",
  "F38BA8",
  "EBA0AC",
  "FAB387",
  "F9E2AF",
  "A6E3A1",
  "94E2D5",
  "89DCEB",
  "74C7EC",
  "89B4FA",
  "B4BEFE",
  "CDD6F4",
]

export function getRandomColor() {
  return colors[Math.floor(Math.random() * (colors.length - 1))]
}
