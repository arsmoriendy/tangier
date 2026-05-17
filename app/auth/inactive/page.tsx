import { SignoutButton } from "./signout-button"
import { RefreshButton } from "./refresh-button"

export default async function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      Please wait for an administrator to activate your account
      <div className="flex gap-2">
        <RefreshButton />
        <SignoutButton />
      </div>
    </div>
  )
}
