import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
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
    // 1. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: service.price,
            product_data: {
              name: service.label,
              description: `Order for ${business || name}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { name, email, business: business || '', brief: brief || '', serviceId },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#order`,
    })

    // 2. Send notification email to you
    await resend.emails.send({
      from: 'ContentFlow Orders <orders@yourdomain.com>',
      to: process.env.NOTIFY_EMAIL,
      subject: `New order: ${service.label} from ${name}`,
      html: `
        <div style="font-family:monospace;max-width:560px;background:#0a0a0a;color:#f0ede6;padding:32px;border-radius:8px;">
          <h2 style="color:#c8f135;margin:0 0 24px;">New order incoming</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Service</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${service.label}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Amount</td><td style="color:#c8f135;padding:8px 0;border-bottom:1px solid #2a2a2a;">$${(service.price / 100).toFixed(2)}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Client</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${name}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Email</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${email}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Business</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${business || '—'}</td></tr>
            <tr><td style="color:#888;padding:8px 0;vertical-align:top;">Brief</td><td style="padding:8px 0;white-space:pre-wrap;">${brief || '—'}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px;">Go to Fiverr and place the order. Deliver to ${email} when done.</p>
        </div>
      `,
    })

    // 3. Send confirmation email to client
    await resend.emails.send({
      from: 'ContentFlow <hello@yourdomain.com>',
      to: email,
      subject: `Order confirmed — ${service.label}`,
      html: `
        <div style="font-family:monospace;max-width:560px;background:#0a0a0a;color:#f0ede6;padding:32px;border-radius:8px;">
          <h2 style="color:#c8f135;margin:0 0 8px;">Order confirmed.</h2>
          <p style="color:#888;margin:0 0 24px;font-size:14px;">We've got your brief and payment. Here's what happens next.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #2a2a2a;">Order</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${service.label}</td></tr>
            <tr><td style="color:#888;padding:8px 0;">Amount paid</td><td style="color:#c8f135;padding:8px 0;">$${(service.price / 100).toFixed(2)}</td></tr>
          </table>
          <p style="font-size:14px;color:#f0ede6;">Your content will land in this inbox within the timeframe quoted. No check-ins, no meetings — just results.</p>
          <p style="font-size:12px;color:#888;margin-top:24px;">Reply to this email if you need to update your brief.</p>
        </div>
      `,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error. Try again.' })
  }
}
