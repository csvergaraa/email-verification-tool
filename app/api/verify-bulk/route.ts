import { type NextRequest, NextResponse } from "next/server"
import { validateEmail } from "@/lib/email-validator"

export const maxDuration = 60 // 60 seconds for bulk operations

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: "Emails array is required" }, { status: 400 })
    }

    // Validate all emails
    const results = await Promise.all(emails.map((email) => validateEmail(email)))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Bulk verification error:", error)
    return NextResponse.json({ error: "Failed to verify emails" }, { status: 500 })
  }
}
