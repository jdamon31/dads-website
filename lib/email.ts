import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Replay Industrial <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jonnydamon31@gmail.com'

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Message from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">New Contact Message</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">From</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px">
          <p style="margin:0;white-space:pre-wrap">${message}</p>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8">Replay Industrial · Admin Notification</p>
      </div>
    `,
  })
}

export async function sendItemRequestEmail({
  name,
  email,
  phone,
  description,
}: {
  name: string
  email: string
  phone?: string | null
  description: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Item Request from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">New Item Request</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">From</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Phone</td><td style="padding:8px 0">${phone}</td></tr>` : ''}
        </table>
        <div style="margin-top:16px;padding:16px;background:#fff7ed;border-radius:8px;border-left:4px solid #ea580c">
          <p style="margin:0;font-size:14px;color:#64748b;margin-bottom:4px">Looking for:</p>
          <p style="margin:0;white-space:pre-wrap">${description}</p>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8">Replay Industrial · Admin Notification</p>
      </div>
    `,
  })
}

export async function sendRequestFulfilledEmail({
  name,
  email,
  description,
}: {
  name: string
  email: string
  description: string
}) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Good news — we found what you're looking for!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">Hi ${name},</h2>
        <p style="color:#334155">Great news! We've sourced the item you requested and it's now available in our store.</p>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:8px">
          <p style="margin:0;font-size:14px;color:#64748b">Your request:</p>
          <p style="margin:8px 0 0;white-space:pre-wrap">${description}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://dads-website-sandy.vercel.app'}" style="display:inline-block;background:#ea580c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Shop Now</a>
        <p style="margin-top:32px;font-size:12px;color:#94a3b8">Replay Industrial — Quality Goods at Great Prices</p>
      </div>
    `,
  })
}
