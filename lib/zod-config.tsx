"use client"

import { useLocale } from "next-intl"
import { ReactNode } from "react"
import z from "zod"
import { en, id } from "zod/locales"

export function ZodConfig(props: { children: ReactNode }) {
  const locale = useLocale()
  z.config({ "en-ID": en, "id-ID": id }[locale]!())
  return props.children
}
