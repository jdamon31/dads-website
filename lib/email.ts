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

export async function sendOfferReceivedEmail({
  buyerName, buyerEmail, buyerPhone, offerAmount, message, productTitle,
}: {
  buyerName: string; buyerEmail: string; buyerPhone?: string | null
  offerAmount: string; message?: string | null; productTitle: string
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Offer on "${productTitle}" from ${buyerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">New Offer Received</h2>
        <p style="color:#64748b">Someone made an offer on <strong>${productTitle}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-top:8px">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px">From</td><td style="padding:8px 0;font-weight:600">${buyerName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0"><a href="mailto:${buyerEmail}">${buyerEmail}</a></td></tr>
          ${buyerPhone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Phone</td><td style="padding:8px 0">${buyerPhone}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Offer</td><td style="padding:8px 0;font-size:20px;font-weight:800;color:#ea580c">${offerAmount}</td></tr>
        </table>
        ${message ? `<div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px"><p style="margin:0;font-size:14px;color:#64748b;margin-bottom:4px">Message:</p><p style="margin:0;white-space:pre-wrap">${message}</p></div>` : ''}
        <p style="margin-top:24px;font-size:12px;color:#94a3b8">Manage this offer from your admin dashboard.</p>
      </div>
    `,
  })
}

export async function sendOfferAcceptedEmail({
  buyerName, buyerEmail, offerAmount, productTitle, paymentUrl,
}: {
  buyerName: string; buyerEmail: string; offerAmount: string; productTitle: string; paymentUrl: string
}) {
  await resend.emails.send({
    from: FROM,
    to: buyerEmail,
    subject: `Your offer on "${productTitle}" was accepted!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">Great news, ${buyerName}!</h2>
        <p style="color:#334155">Your offer of <strong>${offerAmount}</strong> on <strong>${productTitle}</strong> has been accepted.</p>
        <p style="color:#334155">Click the button below to complete your purchase. This link expires in 24 hours.</p>
        <div style="margin:32px 0;text-align:center">
          <a href="${paymentUrl}" style="display:inline-block;background:#ea580c;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Complete Purchase — ${offerAmount}</a>
        </div>
        <p style="font-size:12px;color:#94a3b8">Replay Industrial — Quality Goods at Great Prices</p>
      </div>
    `,
  })
}

export async function sendOfferCounteredEmail({
  buyerName, buyerEmail, originalAmount, counterAmount, counterMessage, productTitle, paymentUrl,
}: {
  buyerName: string; buyerEmail: string; originalAmount: string; counterAmount: string
  counterMessage?: string | null; productTitle: string; paymentUrl: string
}) {
  await resend.emails.send({
    from: FROM,
    to: buyerEmail,
    subject: `Counter offer on "${productTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">Hi ${buyerName},</h2>
        <p style="color:#334155">Thanks for your offer of <strong>${originalAmount}</strong> on <strong>${productTitle}</strong>.</p>
        <p style="color:#334155">We'd like to counter at <strong style="color:#ea580c">${counterAmount}</strong>.</p>
        ${counterMessage ? `<div style="margin:16px 0;padding:16px;background:#f8fafc;border-radius:8px"><p style="margin:0;white-space:pre-wrap">${counterMessage}</p></div>` : ''}
        <p style="color:#334155">If you'd like to accept, click below to complete the purchase at ${counterAmount}. This link expires in 24 hours.</p>
        <div style="margin:32px 0;text-align:center">
          <a href="${paymentUrl}" style="display:inline-block;background:#ea580c;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Accept Counter — ${counterAmount}</a>
        </div>
        <p style="font-size:12px;color:#94a3b8">Replay Industrial — Quality Goods at Great Prices</p>
      </div>
    `,
  })
}

export async function sendOfferDeclinedEmail({
  buyerName, buyerEmail, productTitle,
}: {
  buyerName: string; buyerEmail: string; productTitle: string
}) {
  await resend.emails.send({
    from: FROM,
    to: buyerEmail,
    subject: `Update on your offer for "${productTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0f172a">Hi ${buyerName},</h2>
        <p style="color:#334155">Thank you for your offer on <strong>${productTitle}</strong>. Unfortunately we aren't able to accept it at this time.</p>
        <p style="color:#334155">Feel free to browse our other listings — we're always adding new items.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://dads-website-sandy.vercel.app'}" style="display:inline-block;background:#0f172a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Browse Shop</a>
        <p style="margin-top:32px;font-size:12px;color:#94a3b8">Replay Industrial — Quality Goods at Great Prices</p>
      </div>
    `,
  })
}
