import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Generate a reset token
    const resetToken = crypto.randomUUID()
    
    // TODO: Store the reset token in your database with an expiration time
    // await db.storeResetToken(email, resetToken, expirationTime)

    // Create the reset password email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    
    const { data, error } = await resend.emails.send({
      from: "AGMS <onboarding@resend.dev>", // Using Resend's default sending domain
      to: email,
      subject: "Reset Your Password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json(
        { success: false, message: "Failed to send reset email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Reset instructions sent to your email" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
} 