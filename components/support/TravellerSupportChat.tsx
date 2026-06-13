"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Loader2, MessageCircle, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SupportUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

type SupportMessage = {
  id: string
  body: string
  isAdmin: boolean
  createdAt: string
  sender: SupportUser
}

type SupportConversation = {
  id: string
  subject: string
  status: "OPEN" | "PENDING" | "RESOLVED"
  lastMessageAt: string
  messages: SupportMessage[]
}

type TravellerSupportChatProps = {
  className?: string
  compact?: boolean
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value))
}

function statusLabel(status: SupportConversation["status"]) {
  if (status === "RESOLVED") return "Resolved"
  if (status === "PENDING") return "Support replied"
  return "Waiting for support"
}

export default function TravellerSupportChat({ className, compact = false }: TravellerSupportChatProps) {
  const { status } = useSession()
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [subject, setSubject] = useState("Booking help")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(status === "authenticated")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const selectedConversation = useMemo(() => {
    if (!conversations.length) return null
    return conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0]
  }, [conversations, selectedId])

  const loadConversations = useCallback(async (silent = false) => {
    if (status !== "authenticated") return

    if (!silent) setLoading(true)

    try {
      const response = await fetch("/api/support/conversations", { cache: "no-store" })
      if (!response.ok) throw new Error("Unable to load chat")
      const data = await response.json()

      if (Array.isArray(data)) {
        setConversations(data)
        setSelectedId((current) => current ?? data[0]?.id ?? null)
      }
      setError("")
    } catch (err: any) {
      setError(err.message || "Unable to load chat")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      loadConversations()
      const timer = window.setInterval(() => loadConversations(true), 5000)
      return () => window.clearInterval(timer)
    }

    setLoading(false)
  }, [loadConversations, status])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages.length])

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setSending(true)
    setError("")

    try {
      const endpoint = selectedConversation
        ? `/api/support/conversations/${selectedConversation.id}/messages`
        : "/api/support/conversations"
      const payload = selectedConversation
        ? { message: trimmedMessage }
        : { subject: subject.trim() || "Support request", message: trimmedMessage }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to send message")

      setMessage("")
      if (data.id && !selectedConversation) setSelectedId(data.id)
      await loadConversations(true)
    } catch (err: any) {
      setError(err.message || "Unable to send message")
    } finally {
      setSending(false)
    }
  }

  if (status === "unauthenticated") {
    return (
      <Card className={cn("rounded-3xl border-slate-100 shadow-xl shadow-slate-200/40", className)}>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Sign in for live support</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
            Your support chat is connected to your RideWay account so our team can see your bookings and reply safely.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login?callbackUrl=/help">
              <Button className="rounded-full bg-blue-600 px-6 text-white">Log in to chat</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="rounded-full px-6">Create account</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/40", className)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircle className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-black">RideWay Support</h3>
              <p className="text-xs font-medium text-slate-300">Live chat with our support team</p>
            </div>
          </div>
          {selectedConversation && (
            <Badge className="rounded-full border-white/10 bg-white/10 px-3 py-1 text-white">
              {statusLabel(selectedConversation.status)}
            </Badge>
          )}
        </div>

        {conversations.length > 1 && !compact && (
          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-4">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition",
                  selectedConversation?.id === conversation.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                )}
              >
                {conversation.subject}
              </button>
            ))}
          </div>
        )}

        <div className={cn("space-y-4 overflow-y-auto bg-slate-50/70 p-5", compact ? "h-72" : "h-96")}>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : selectedConversation ? (
            selectedConversation.messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={cn("flex", chatMessage.isAdmin ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[82%] rounded-3xl px-4 py-3 shadow-sm",
                    chatMessage.isAdmin
                      ? "rounded-bl-md bg-white text-slate-800"
                      : "rounded-br-md bg-blue-600 text-white"
                  )}
                >
                  <p className="text-sm font-semibold leading-6">{chatMessage.body}</p>
                  <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-wider", chatMessage.isAdmin ? "text-slate-400" : "text-blue-100")}>
                    {chatMessage.isAdmin ? "Support" : "You"} - {formatMessageTime(chatMessage.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <MessageCircle className="h-7 w-7 text-blue-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Start a support chat</h4>
              <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
                Tell us what happened and an admin can reply from the support inbox.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-3 border-t border-slate-100 bg-white p-4">
          {!selectedConversation && (
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={90}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Support topic"
            />
          )}
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              maxLength={1200}
              className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Type your message..."
            />
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="h-12 rounded-2xl bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
