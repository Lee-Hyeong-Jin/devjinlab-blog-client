"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-serif text-base tracking-[0.2em] text-signal italic">
        devjinlab
      </p>
      <h1 className="font-kr-serif text-2xl font-bold">문제가 발생했습니다</h1>
      <p className="text-sm text-muted-foreground">
        페이지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </main>
  )
}
