import { RegisterFirstUserForm } from "@/app/auth/register-first-user-form"
import { countUser } from "@/lib/crud/users"

export default async function Page() {
  const usersCount = await countUser()

  return (
    <div className="grid min-h-screen place-items-center p-2">
      {usersCount === 0 ? <RegisterFirstUserForm /> : <></>}
    </div>
  )
}
