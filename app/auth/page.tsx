import { RegisterForm } from "@/app/auth/register-form"

export default async function Page() {
  return (
    <div className="grid min-h-screen place-items-center p-2">
      <RegisterForm />
    </div>
  )
}
