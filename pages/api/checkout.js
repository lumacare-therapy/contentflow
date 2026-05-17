import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SERVICES = {
  blog_basic:      { label: 'Blog post — 800 words',          price: 7900 },
  blog_pro:        { label: 'Blog post — 1500 words',         price: 12900 },
  social_pack:     { label: 'Social media pack — 10 posts',   price: 9900 },
  email_sequence:  { label: 'Email sequence — 5 emails',      price: 14900 },
  product_desc:    { label: 'Product descriptions — 5 items', price: 6900 },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { serviceId, name, email, business, brief } = req.body

  const service = SERVICES[serviceId]
  if (!service) return res.status(400).json({ error: 'Invalid service.' })
  if (!name || !email) return res.status(400).json({ error: 'Name and email required.' })

  try {
    // 1. Send notification email to YOU
    await resend.emails.send({
      from: 'ContentFlow Orders <orders@yourdomain.com>',
      to: process.env.NOTIFY_EMAIL,
      subject: `New order: ${service.label} from ${name}`,
      html: `
        <div style="font-family:monospace;max-width:560px;background:#0a0a0a;color:#f0ede6;padding:32px;border-radius:8px;">
          <h2 style="color:#c8f135;margin:0 0 24px;">💰 NEW PAYMENT PENDING</h2>
          <p style="margin-bottom:16px;">Client is about to pay via PayPal.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Service</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${service.label}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Amount</td><td style="color:#c8f135;padding:8px 0;border-bottom:1px solid #2a2a2a;">$${(service.price / 100).toFixed(2)}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Client</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${name}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Email</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${email}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Business</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${business || '—'}</td></tr>
            <tr><td style="color:#888;padding:8px 0;vertical-align:top;">Brief</td><td style="padding:8px 0;white-space:pre-wrap;">${brief || '—'}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px;">✅ When payment completes, PayPal will notify you.</p>
        </div>
      `,
    })

    // 2. Send confirmation email to CLIENT
    await resend.emails.send({
      from: 'ContentFlow <hello@yourdomain.com>',
      to: email,
      subject: `Order confirmed — ${service.label}`,
      html: `
        <div style="font-family:monospace;max-width:560px;background:#0a0a0a;color:#f0ede6;padding:32px;border-radius:8px;">
          <h2 style="color:#c8f135;margin:0 0 8px;">✨ Order confirmed.</h2>
          <p style="color:#888;margin:0 0 24px;font-size:14px;">Complete your payment via PayPal to start your content.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Order</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${service.label}</td></tr>
            <tr><td style="color:#888;padding:8px 0;">Amount</td><td style="color:#c8f135;padding:8px 0;">$${(service.price / 100).toFixed(2)}</td></tr>
          </table>
          <p style="font-size:14px;color:#f0ede6;">Click the PayPal button to complete your secure payment. Your content will be delivered right after.</p>
          <p style="font-size:12px;color:#888;margin-top:24px;">Questions? Just reply to this email.</p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error. Try again.' })
  }
}
