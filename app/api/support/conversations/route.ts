import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const MAX_SUBJECT_LENGTH = 90
const MAX_MESSAGE_LENGTH = 1200

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback
  return value.replace(/\s+/g, " ").trim()
}

function selectConversationFields() {
  return {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    },
    assignedAdmin: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    },
    messages: {
      orderBy: { createdAt: "asc" as const },
      take: 100,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    },
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const conversations = await prisma.supportConversation.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: selectConversationFields(),
      orderBy: { lastMessageAt: "desc" },
    })

    return NextResponse.json(conversations)
  } catch (error: any) {
    console.error("Fetch support conversations failed:", error)
    return NextResponse.json({ error: "Unable to load support conversations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const message = cleanText(body.message).slice(0, MAX_MESSAGE_LENGTH)
    const subject = cleanText(body.subject, "Support request").slice(0, MAX_SUBJECT_LENGTH)

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const now = new Date()
    const conversation = await prisma.supportConversation.create({
      data: {
        userId: session.user.id,
        subject: subject || "Support request",
        status: session.user.role === "ADMIN" ? "PENDING" : "OPEN",
        lastMessageAt: now,
        assignedAdminId: session.user.role === "ADMIN" ? session.user.id : undefined,
        messages: {
          create: {
            body: message,
            senderId: session.user.id,
            isAdmin: session.user.role === "ADMIN",
            createdAt: now,
          },
        },
      },
      include: selectConversationFields(),
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error: any) {
    console.error("Create support conversation failed:", error)
    return NextResponse.json({ error: "Unable to create support conversation" }, { status: 500 })
  }
}
