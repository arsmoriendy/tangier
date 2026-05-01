"use client"

import { authClient } from "@/lib/auth-client"
import { createContext, ReactNode, useContext } from "react"

type Session = typeof authClient.$Infer.Session

const sessCtx = createContext<Session | undefined>(undefined)

export function SessionProvider(props: {
  session: Session
  children: ReactNode
}) {
  return (
    <sessCtx.Provider value={props.session}>{props.children}</sessCtx.Provider>
  )
}

export const useSession = () => {
  const sess = useContext(sessCtx)
  if (sess === undefined) throw "undefined session"
  return sess
}
