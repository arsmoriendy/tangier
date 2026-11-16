"use client"

import { TransactionWithRelations } from "@/lib/crud/transactions"
import { createContext, ReactNode, useContext, useState } from "react"

type EditedTrx = DeepReadonly<TransactionWithRelations> | undefined

const editedTrxCtx = createContext<
  | {
      editedTrx: EditedTrx
      setEditedTrx: (trx: EditedTrx) => void
      resetEditedTrx: () => void
    }
  | undefined
>(undefined)

export function EditedTrxProvider({
  initialValue,
  children,
}: {
  initialValue?: EditedTrx
  children: ReactNode
}) {
  const [editedTrx, setEditedTrxState] = useState<EditedTrx>(initialValue)

  function setEditedTrx(trx: EditedTrx) {
    setEditedTrxState(trx)
  }

  // restore the transaction the form mounted with instead of clearing it: the
  // history edit dialog keeps its transaction after a save, so resetting must
  // not turn it into a blank new transaction form
  function resetEditedTrx() {
    setEditedTrxState(initialValue)
  }

  return (
    <editedTrxCtx.Provider value={{ editedTrx, setEditedTrx, resetEditedTrx }}>
      {children}
    </editedTrxCtx.Provider>
  )
}

export function useEditedTrx() {
  const ctx = useContext(editedTrxCtx)
  if (ctx === undefined) throw new Error("undefined edited transaction ctx")
  return ctx
}
