import Head from 'next/head'
import { useState } from 'react'
import styles from './index.module.css'

const SERVICES = [
  { id: 'blog_basic', label: 'Blog post — 800 words', price: 79, desc: 'SEO-optimised, one topic, delivered in 3 days' },
  { id: 'blog_pro', label: 'Blog post — 1500 words', price: 129, desc: 'Deep-dive article, research included, 4 days' },
  { id: 'social_pack', label: 'Social media pack — 10 posts', price: 99, desc: 'Caption + hashtags for any platform, 3 days' },
  { id: 'email_sequence', label: 'Email sequence — 5 emails', price: 149, desc: 'Welcome or nurture flow, persuasive copy, 5 days' },
  { id: 'product_desc', label: 'Product descriptions — 5 items', price: 69, desc: 'Conversion-focused, SEO-friendly, 2 days' },
]

export default function Home() {
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', business: '', brief: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!selected) { setError('Pick a service first.'); return }
    if (!form.name || !form.email) { setError('Name and email are required.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selected, ...form }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Something went wrong.')
    } catch {
      setError('Network error. Try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>ContentFlow — Words that work</title>
        <meta name="description" content="Professional content written for your brand. Blog posts, social media, email sequences — delivered fast." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>

        {/* NAV */}
        <nav className={styles.nav}>
          <span className={styles.logo}>CONTENT<span>FLOW</span></span>
          <a href="#order" className={styles.navCta}>Order now</a>
        </nav>

        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroTag}>Async. Fast. No calls.</div>
          <h1 className={styles.heroTitle}>
            Words that<br />
            <span className={styles.accent}>make money.</span>
          </h1>
          <p className={styles.heroSub}>
            Professional blog posts, social content, and email copy — delivered straight to your inbox. No meetings. No fluff.
          </p>
          <a href="#order" className={styles.heroCta}>Start your order →</a>
          <div className={styles.heroBadges}>
            <span>✦ 3–5 day delivery</span>
            <span>✦ 100% online</span>
            <span>✦ Revisions included</span>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>How it works</p>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'Pick a service', desc: 'Choose what you need and fill in a short brief below.' },
              { n: '02', title: 'Pay securely', desc: 'Checkout via Stripe. Your info is never stored by us.' },
              { n: '03', title: 'Receive your content', desc: 'Polished copy lands in your inbox within the quoted timeframe.' },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <span className={styles.stepNum}>{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section className={styles.section} id="services">
          <p className={styles.sectionLabel}>Services & pricing</p>
          <div className={styles.serviceGrid}>
            {SERVICES.map(s => (
              <div
                key={s.id}
                className={`${styles.serviceCard} ${selected === s.id ? styles.serviceCardActive : ''}`}
                onClick={() => setSelected(s.id)}
              >
                <div className={styles.serviceTop}>
                  <span className={styles.serviceName}>{s.label}</span>
                  <span className={styles.servicePrice}>${s.price}</span>
                </div>
                <p className={styles.serviceDesc}>{s.desc}</p>
                <div className={styles.serviceCheck}>
                  {selected === s.id ? '✦ Selected' : 'Select'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ORDER FORM */}
        <section className={styles.section} id="order">
          <p className={styles.sectionLabel}>Place your order</p>
          <form className={styles.form} onSubmit={handleOrder}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email address</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Business / brand name</label>
              <input
                type="text"
                placeholder="Acme Inc."
                value={form.business}
                onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Brief — what do you need written?</label>
              <textarea
                placeholder="Topic, tone, target audience, keywords, anything relevant..."
                value={form.brief}
                onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
                rows={5}
              />
            </div>

            {selected && (
              <div className={styles.orderSummary}>
                <span>Selected: {SERVICES.find(s => s.id === selected)?.label}</span>
                <span className={styles.accent}>${SERVICES.find(s => s.id === selected)?.price}</span>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Redirecting to payment...' : `Pay & place order →`}
            </button>
            <p className={styles.formNote}>Powered by Stripe. Secure checkout. Revisions included.</p>
          </form>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <span className={styles.logo}>CONTENT<span>FLOW</span></span>
          <p className={styles.footerText}>All orders handled async. No calls. No meetings. Just results.</p>
        </footer>
      </div>
    </>
  )
}
