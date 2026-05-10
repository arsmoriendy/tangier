"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { type user } from "@/lib/db/auth-schema"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

type Users = (typeof user.$inferSelect)[]

const usersCtx = createContext<ValtioContext<Users> | undefined>(undefined)

export function UsersProvider(props: { users: Users; children: ReactNode }) {
  const usersProxy = proxy(props.users)
  const usersSnap = useSnapshot(usersProxy)

  return (
    <usersCtx.Provider value={{ proxy: usersProxy, snap: usersSnap }}>
      {props.children}
    </usersCtx.Provider>
  )
}

export const useUsers = () => {
  const { proxy, snap } = useContext(usersCtx)!
  return { usersProxy: proxy, usersSnap: snap }
}
