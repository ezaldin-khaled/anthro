import { mockMessages } from '../data/mockAdmin'
import styles from './AdminMessages.module.css'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

export function AdminMessages() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.tag}>Admin</span>
        <h1 className={styles.title}>Messages</h1>
        <p className={styles.subtitle}>Client inquiries from the contact form.</p>
      </header>
      {mockMessages.length === 0 ? (
        <p className={styles.empty}>No messages yet.</p>
      ) : (
        <ul className={styles.list}>
          {mockMessages.map((msg) => (
            <li key={msg.id} className={msg.read ? styles.item : `${styles.item} ${styles.itemUnread}`}>
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{msg.name}</span>
                <a href={`mailto:${msg.email}`} className={styles.itemEmail}>
                  {msg.email}
                </a>
                <span className={styles.itemDate}>{formatDate(msg.date)}</span>
              </div>
              <p className={styles.itemMessage}>{msg.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
