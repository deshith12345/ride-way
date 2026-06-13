import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const statuses = ["OPEN", "PENDING", "RESOLVED"] as const

function conversationInclude() {
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
    const isAdmin = session.user.role === "ADMIN"
    const conversation = await prisma.supportConversation.findFirst({
      where: isAdmin ? { id } : { id, userId: session.user.id },
      include: conversationInclude(),
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Fetch support conversation failed:", error)
    return NextResponse.json({ error: "Unable to load support conversation" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const body = await req.json()
    const status = typeof body.status === "string" ? body.status.toUpperCase() : ""

    if (!statuses.includes(status as (typeof statuses)[number])) {
      return NextResponse.json({ error: "Invalid support status" }, { status: 400 })
    }

    const conversation = await prisma.supportConversation.update({
      where: { id },
      data: {
        status: status as (typeof statuses)[number],
        assignedAdminId: session.user.id,
      },
      include: conversationInclude(),
    })

    return NextResponse.json(conversation)
  } catch (error: any) {
    console.error("Update support conversation failed:", error)
    return NextResponse.json({ error: "Unable to update support conversation" }, { status: 500 })
  }
}
