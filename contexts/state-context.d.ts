export type StateContext<T> = {
  state: T
  setState: (pgs: T) => void
}
