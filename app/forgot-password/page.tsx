"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
        <Link href="/login" className="mb-8 inline-flex items-center text-sm font-bold text-blue-200 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
        </Link>
        <Card className="border-white/10 bg-white/95 shadow-2xl">
          <CardContent className="p-8">
            {submitted ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Check your inbox</h1>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  If an account exists for {email}, password reset instructions will be sent shortly.
                </p>
                <Button asChild className="mt-8 h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                  <Link href="/login">Return to Sign In</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Reset your password</h1>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  Enter the email address on your RideWay account and we will send reset instructions.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@example.com"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                    Send Reset Instructions
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
