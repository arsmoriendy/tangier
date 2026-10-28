const RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i

export function sanitizeFilename(name: string, max = 200) {
  let s = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/[. ]+$/, "")
  if (RESERVED.test(s)) s = `_${s}`
  return s.slice(0, max)
}
