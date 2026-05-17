"use client"

import { useLocale } from "next-intl"

import {
  I18nProvider as AriaI18n,
  type I18nProviderProps,
} from "react-aria-components"

export function I18nProvider(props: I18nProviderProps) {
  const locale = useLocale()
  return <AriaI18n locale={locale} {...props} />
}
