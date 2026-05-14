import Head from 'next/head'
import styles from './success.module.css'

export default function Success() {
  return (
    <>
      <Head><title>Order confirmed — ContentFlow</title></Head>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.icon}>✦</div>
          <h1 className={styles.title}>Order received.</h1>
          <p className={styles.sub}>
            Check your inbox — a confirmation just landed. Your content will be delivered within the quoted timeframe. No calls. No chasing. Just results.
          </p>
          <a href="/" className={styles.back}>← Place another order</a>
        </div>
      </div>
    </>
  )
}
