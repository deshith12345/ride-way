"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, Loader2, MessageCircle, RotateCcw, Search, Send, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SupportUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
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
  user: SupportUser
  assignedAdmin?: SupportUser | null
  messages: SupportMessage[]
}

const statusStyles: Record<SupportConversation["status"], string> = {
  OPEN: "bg-rose-50 text-rose-700 border-rose-100",
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
}

function displayName(user?: SupportUser | null) {
  return user?.name || user?.email || "Traveller"
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value))
}

export default function AdminSupportInbox() {
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | SupportConversation["status"]>("ALL")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)

    try {
      const response = await fetch("/api/support/conversations", { cache: "no-store" })
      if (!response.ok) throw new Error("Unable to load support inbox")
      const data = await response.json()

      if (Array.isArray(data)) {
        setConversations(data)
        setSelectedId((current) => current ?? data[0]?.id ?? null)
      }
      setError("")
    } catch (err: any) {
      setError(err.message || "Unable to load support inbox")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
    const timer = window.setInterval(() => loadConversations(true), 5000)
    return () => window.clearInterval(timer)
  }, [loadConversations])

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase()
    return conversations.filter((conversation) => {
      const matchesStatus = statusFilter === "ALL" || conversation.status === statusFilter
      const matchesSearch =
        !term ||
        conversation.subject.toLowerCase().includes(term) ||
        (conversation.user.name || "").toLowerCase().includes(term) ||
        (conversation.user.email || "").toLowerCase().includes(term)

      return matchesStatus && matchesSearch
    })
  }, [conversations, search, statusFilter])

  const selectedConversation = useMemo(() => {
    if (!filteredConversations.length) return null
    return filteredConversations.find((conversation) => conversation.id === selectedId) ?? filteredConversations[0]
  }, [filteredConversations, selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages.length])

  const handleReply = async () => {
    const trimmedReply = reply.trim()
    if (!selectedConversation || !trimmedReply) return

    setSending(true)
    setError("")

    try {
      const response = await fetch(`/api/support/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedReply }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to send reply")

      setReply("")
      await loadConversations(true)
    } catch (err: any) {
      setError(err.message || "Unable to send reply")
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (status: SupportConversation["status"]) => {
    if (!selectedConversation) return

    setUpdating(true)
    setError("")

    try {
      const response = await fetch(`/api/support/conversations/${selectedConversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to update status")

      await loadConversations(true)
    } catch (err: any) {
      setError(err.message || "Unable to update status")
    } finally {
      setUpdating(false)
    }
  }

  const openCount = conversations.filter((conversation) => conversation.status === "OPEN").length
  const resolvedCount = conversations.filter((conversation) => conversation.status === "RESOLVED").length

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
            <MessageCircle className="h-4 w-4" />
            Support Inbox
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Live Chat Support</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Reply to traveller questions, follow booking issues, and close conversations once support is complete.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{conversations.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3">
            <p className="text-2xl font-black text-rose-700">{openCount}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Open</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3">
            <p className="text-2xl font-black text-emerald-700">{resolvedCount}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Solved</p>
          </div>
        </div>
      </div>

      <div className="grid min-h-[680px] grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <Card className="overflow-hidden rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/40">
          <CardContent className="p-0">
            <div className="space-y-4 border-b border-slate-100 p-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Search chats"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["ALL", "OPEN", "PENDING", "RESOLVED"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition",
                      statusFilter === status
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    {status === "ALL" ? "All" : status.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[540px] overflow-y-auto p-3">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                    <MessageCircle className="h-7 w-7 text-slate-300" />
                  </div>
                  <p className="font-black text-slate-900">No conversations</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">New traveller chats will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => {
                    const latestMessage = conversation.messages[conversation.messages.length - 1]
                    const isSelected = selectedConversation?.id === conversation.id

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedId(conversation.id)}
                        className={cn(
                          "w-full rounded-2xl border p-4 text-left transition",
                          isSelected
                            ? "border-blue-200 bg-blue-50 shadow-sm"
                            : "border-transparent bg-white hover:border-slate-100 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">{displayName(conversation.user)}</p>
                            <p className="truncate text-xs font-bold text-slate-500">{conversation.subject}</p>
                          </div>
                          <Badge className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black", statusStyles[conversation.status])}>
                            {conversation.status}
                          </Badge>
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                          {latestMessage?.body || "No messages yet"}
                        </p>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {formatTime(conversation.lastMessageAt)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/40">
          <CardContent className="flex h-full min-h-[680px] flex-col p-0">
            {selectedConversation ? (
              <>
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-slate-950 px-6 py-5 text-white md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <UserRound className="h-6 w-6 text-cyan-200" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">{displayName(selectedConversation.user)}</h2>
                      <p className="text-sm font-medium text-slate-300">{selectedConversation.user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("rounded-full border px-3 py-1 font-black", statusStyles[selectedConversation.status])}>
                      {selectedConversation.status}
                    </Badge>
                    {selectedConversation.status === "RESOLVED" ? (
                      <Button
                        onClick={() => updateStatus("OPEN")}
                        disabled={updating}
                        variant="outline"
                        className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        onClick={() => updateStatus("RESOLVED")}
                        disabled={updating}
                        className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-6">
                  <div className="mx-auto mb-2 w-fit rounded-full bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                    {selectedConversation.subject}
                  </div>
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className={cn("flex", message.isAdmin ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[78%] rounded-3xl px-4 py-3 shadow-sm",
                          message.isAdmin
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md bg-white text-slate-800"
                        )}
                      >
                        <p className="text-sm font-semibold leading-6">{message.body}</p>
                        <p className={cn("mt-1 text-[10px] font-black uppercase tracking-wider", message.isAdmin ? "text-blue-100" : "text-slate-400")}>
                          {message.isAdmin ? "Admin" : displayName(message.sender)} - {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-100 bg-white p-5">
                  <div className="flex gap-3">
                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault()
                          handleReply()
                        }
                      }}
                      maxLength={1200}
                      className="min-h-14 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="Reply to traveller..."
                    />
                    <Button
                      onClick={handleReply}
                      disabled={sending || !reply.trim() || selectedConversation.status === "RESOLVED"}
                      className="h-14 rounded-2xl bg-blue-600 px-6 text-white hover:bg-blue-700"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {selectedConversation.status === "RESOLVED" && (
                    <p className="mt-2 text-xs font-semibold text-slate-500">Reopen this conversation before sending another reply.</p>
                  )}
                  {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-10 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Select a conversation</h2>
                <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
                  Traveller chats and booking support messages will appear in the inbox when they are created.
                </p>
                {error && <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
