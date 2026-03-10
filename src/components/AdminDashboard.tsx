import { mockMessages, mockMedia } from '../data/mockAdmin'
import styles from './AdminDashboard.module.css'

export function AdminDashboard() {
  const unreadCount = mockMessages.filter((m) => !m.read).length

  return (
    <>
      <header className={styles.header}>
        <span className={styles.tag}>Admin</span>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Quick summary of your dashboard.</p>
      </header>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total messages</div>
          <div className={styles.cardValue}>{mockMessages.length}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Unread messages</div>
          <div className={`${styles.cardValue} ${styles.cardValueAccent}`}>{unreadCount}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Media items</div>
          <div className={styles.cardValue}>{mockMedia.length}</div>
        </div>
      </div>
    </>
  )
}
