export type StateContext<T> = {
  state: T
  setState: (state: T | ((oldState: T) => T)) => void
}
