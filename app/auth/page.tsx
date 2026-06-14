import { SignInForm } from "@/app/auth/sign-in-form"
import { SignUpForm } from "@/app/auth/sign-up-form"
import Logo from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("auth")
  const iconSize = 72

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center">
        <Logo width={iconSize} />
        <span>tangier</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 className="font-bold">{t("welcome.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("welcome.message")}</p>
      </div>

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
