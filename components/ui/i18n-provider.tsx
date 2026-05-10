"use client"

import {
  I18nProvider as AriaI18n,
  type I18nProviderProps,
} from "react-aria-components"

export function I18nProvider(props: I18nProviderProps) {
  return <AriaI18n {...props} />
}
