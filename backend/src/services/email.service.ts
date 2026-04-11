import { Resend } from 'resend'

const getResendClient = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY not set — emails disabled')
    return null
  }
  return new Resend(key)
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  const resend = getResendClient()
  if (!resend) return // silently skip if not configured
  
  try {
    await resend.emails.send({
      from: 'ReloAI <hello@yourdomain.com>',
      to: email,
      subject: 'Welcome to ReloAI 🌍',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Welcome to ReloAI!</h1>
          <p>You now have access to AI-powered relocation analysis.</p>
          <p><strong>Your free plan includes:</strong></p>
          <ul>
            <li>3 AI analyses per month</li>
            <li>Full structured output with country rankings</li>
            <li>Visa requirements and cost breakdown</li>
            <li>Month-by-month relocation roadmap</li>
          </ul>
          <a href="https://relo-ai-7rj3.vercel.app/dashboard" 
             style="background: #4f46e5; color: white; padding: 12px 24px; 
                    border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Start Your Analysis →
          </a>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">
            ReloAI — Making relocation decisions data-driven.
          </p>
        </div>
      `,
    })
    console.info(`Welcome email sent to ${email}`)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    // DO NOT throw — email failure should not break registration
  }
}
