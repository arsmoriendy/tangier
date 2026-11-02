"use client"

import {
  Input,
  InputTransformer,
  upperCaseTransformer,
} from "@/components/ui/input"
import { InputGroupInput } from "@/components/ui/input-group"
import { useUserSettings } from "@/contexts/user-settings"
import { useEffect, useState } from "react"

export function UserInput({
  transformers = [],
  disableUppercaseOption,
  group,
  ...props
}: React.ComponentProps<typeof Input> & {
  disableUppercaseOption?: true
  group?: true
}) {
  const { getUserSettings } = useUserSettings()
  const [getTransformers, setTransformers] =
    useState<InputTransformer[]>(transformers)

  useEffect(() => {
    if (getUserSettings.uppercaseInput && !disableUppercaseOption) {
      setTransformers((tfs) => [upperCaseTransformer, ...tfs])
    }
  }, [])

  return group ? (
    <InputGroupInput transformers={getTransformers} {...props} />
  ) : (
    <Input transformers={getTransformers} {...props} />
  )
}
