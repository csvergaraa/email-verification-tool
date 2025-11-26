import { type NextRequest, NextResponse } from "next/server"
import { validateEmail } from "@/lib/email-validator"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate the email (processed in memory only, not stored)
    const result = await validateEmail(email)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
