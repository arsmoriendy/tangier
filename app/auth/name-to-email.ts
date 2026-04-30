import { kebabCase } from "es-toolkit"

export function nameToEmail(name: string) {
  return `${kebabCase(name)}@nomail.local`
}
