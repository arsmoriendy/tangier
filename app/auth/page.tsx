import { SignInForm } from "@/app/auth/sign-in-form"
import { SignUpForm } from "@/app/auth/sign-up-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("auth")

  return (
    <div className="grid min-h-screen place-items-center p-2">
      <Tabs defaultValue="sign-in" className="sm:min-w-sm">
        <TabsList className="w-full">
          <TabsTrigger value="sign-up">{t("signUp")}</TabsTrigger>
          <TabsTrigger value="sign-in">{t("signIn")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-up">
          <SignUpForm />
        </TabsContent>
        <TabsContent value="sign-in">
          <SignInForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
