import { NextResponse } from "next/server"
// Google intent cookie no longer used — kept as a no-op for backwards compatibility
export async function POST() {
  return NextResponse.json({ ok: true })
}
