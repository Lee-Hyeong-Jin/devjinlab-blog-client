import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/app/login/login-form"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-8 px-4 py-24">
      <div className="text-center">
        <p className="font-serif text-base tracking-[0.2em] text-signal italic">
          devjinlab
        </p>
        <h1 className="mt-2 font-kr-serif text-2xl font-bold">로그인</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          댓글을 남기려면 로그인이 필요합니다.
        </p>
      </div>
      <LoginForm />
    </main>
  )
}
