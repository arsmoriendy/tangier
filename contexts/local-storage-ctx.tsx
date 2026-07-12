"use client"

import { createContext, ReactNode, useContext, useEffect } from "react"
import { proxy, subscribe, useSnapshot } from "valtio"
import z from "zod"
import { ValtioContext } from "./valtio-context"

const lsSchema = z.object({
  decrementStock: z.boolean().default(true),
  showHisotryItems: z.boolean().default(false),
  showTrxSummary: z.boolean().default(false),
  hideTrxMarginAndDiscounts: z.boolean().default(true),
  hideTrxBuyPrice: z.boolean().default(true),
  hideHistoryReports: z.boolean().default(true),
  hideItemMarginAndDiscounts: z.boolean().default(true),
})

type LocalStorage = z.infer<typeof lsSchema>

const lsDefault: LocalStorage = lsSchema.parse({})

const lsCtx = createContext<ValtioContext<LocalStorage> | undefined>(undefined)

const lsKey = "tangierStore"

export function LocalStorageProvider({ children }: { children: ReactNode }) {
  const lsProxy = proxy(lsDefault)
  const lsSnap = useSnapshot(lsProxy)

  useEffect(() => {
    const ls = localStorage.getItem(lsKey)
    if (ls !== null) {
      try {
        const parsed = JSON.parse(ls)
        Object.assign(lsProxy, lsSchema.parse(parsed))
      } catch {}
    }

    return subscribe(lsProxy, () => {
      localStorage.setItem(lsKey, JSON.stringify(lsProxy))
    })
  }, [])

  return (
    <lsCtx.Provider value={{ proxy: lsProxy, snap: lsSnap }}>
      {children}
    </lsCtx.Provider>
  )
}

export function useLocalStorage() {
  const { proxy, snap } = useContext(lsCtx)!
  return {
    setLocalStorage: proxy,
    getLocalStorage: snap,
  }
}
