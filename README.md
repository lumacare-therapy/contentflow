# ContentFlow — White-label content reseller

Full Next.js site with Stripe checkout and Resend email notifications.

## Setup (15 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Get your free API keys

**Stripe** (payments)
- Go to https://dashboard.stripe.com/register — free account
- Dashboard → Developers → API keys
- Copy "Publishable key" and "Secret key"

**Resend** (emails)
- Go to https://resend.com — free account (3,000 emails/month free)
- Create an API key
- Add and verify your domain (or use their test domain to start)

### 3. Fill in .env.local
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
NOTIFY_EMAIL=your@email.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Update sender email in checkout.js
In `pages/api/checkout.js`, replace `yourdomain.com` with your actual domain (or Resend test domain).

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 6. Deploy to Vercel (free)
```bash
npm install -g vercel
vercel
```
Add your env variables in the Vercel dashboard under Project → Settings → Environment Variables.
Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL.

## How the money flows

1. Client fills form → clicks Pay
2. Stripe Checkout handles payment securely
3. You get an email with full order details
4. Client gets a confirmation email
5. You go to Fiverr, order the content for ~$25
6. Fiverr delivers → you forward to client
7. You keep the difference

## Customise prices

Edit the `SERVICES` object in:
- `pages/index.js` (frontend display)
- `pages/api/checkout.js` (actual prices charged — prices are in cents)

Example: `price: 12900` = $129.00
