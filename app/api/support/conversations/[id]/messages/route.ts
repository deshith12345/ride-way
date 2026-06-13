import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const MAX_MESSAGE_LENGTH = 1200

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return ""
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH)
}

function messageInclude() {
  return {
    sender: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    },
  }
}

async function getAllowedConversation(id: string, userId: string, role: string) {
  return prisma.supportConversation.findFirst({
    where: role === "ADMIN" ? { id } : { id, userId },
    select: {
      id: true,
      userId: true,
      assignedAdminId: true,
      status: true,
    },
  })
}

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const conversation = await getAllowedConversation(id, session.user.id, session.user.role)

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const messages = await prisma.supportMessage.findMany({
      where: { conversationId: id },
      include: messageInclude(),
      orderBy: { createdAt: "asc" },
      take: 100,
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Fetch support messages failed:", error)
    return NextResponse.json({ error: "Unable to load support messages" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const conversation = await getAllowedConversation(id, session.user.id, session.user.role)

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const body = await req.json()
    const messageBody = cleanMessage(body.message)

    if (!messageBody) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const now = new Date()
    const message = await prisma.supportMessage.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: messageBody,
        isAdmin,
        createdAt: now,
      },
      include: messageInclude(),
    })

    await prisma.supportConversation.update({
      where: { id },
      data: {
        lastMessageAt: now,
        status: isAdmin ? "PENDING" : "OPEN",
        assignedAdminId: isAdmin ? session.user.id : conversation.assignedAdminId,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Create support message failed:", error)
    return NextResponse.json({ error: "Unable to send support message" }, { status: 500 })
  }
}
