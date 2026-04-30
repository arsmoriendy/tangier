import { type Snapshot } from "valtio"

export type ValtioContext<T> = {
  proxy: T
  snap: Snapshot<T>
}
