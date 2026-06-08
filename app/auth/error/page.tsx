"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

const errorMap: Record<string, { title: string; message: string; icon: any }> = {
    Configuration: {
        title: "Server Error",
        message: "There is a problem with the server configuration. Please try again later.",
        icon: <ShieldAlert className="h-10 w-10 text-rose-500" />
    },
    AccessDenied: {
        title: "Access Denied",
        message: "You do not have permission to sign in. This might be due to security restrictions.",
        icon: <Lock className="h-10 w-10 text-rose-500" />
    },
    Verification: {
        title: "Verification Failed",
        message: "The verification link has expired or has already been used.",
        icon: <Mail className="h-10 w-10 text-amber-500" />
    },
    OAuthAccountNotLinked: {
        title: "Account Already Exists",
        message: "To confirm your identity, please sign in with the same method you used originally (Email or Google).",
        icon: <ShieldAlert className="h-10 w-10 text-blue-500" />
    },
    Default: {
        title: "Authentication Error",
        message: "An unexpected error occurred during authentication. Please try again.",
        icon: <ShieldAlert className="h-10 w-10 text-rose-500" />
    }
}

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const errorConfig = errorMap[error as string] || errorMap.Default

    return (
        <Card className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-3xl border-white/40 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <CardHeader className="text-center pt-10 pb-4">
                <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                    {errorConfig.icon}
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">{errorConfig.title}</CardTitle>
                <CardDescription className="text-slate-500 font-medium px-4 mt-2">
                    {errorConfig.message}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Sign In
                    </Link>
                </Button>
                <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest pt-2">
                    Error Code: <span className="text-slate-500">{error || "Unknown"}</span>
                </p>
            </CardContent>
        </Card>
    )
}

import dynamic from "next/dynamic"

function AuthErrorPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-900 overflow-hidden">
            {/* Liquid Glow Effects */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}

export default dynamic(() => Promise.resolve(AuthErrorPage), { ssr: false })
