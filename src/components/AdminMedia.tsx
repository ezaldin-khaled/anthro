import { mockMedia } from '../data/mockAdmin'
import styles from './AdminMedia.module.css'

export function AdminMedia() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.tag}>Admin</span>
        <h1 className={styles.title}>Media</h1>
        <p className={styles.subtitle}>Site assets you can replace later via the backend.</p>
      </header>
      {mockMedia.length === 0 ? (
        <p className={styles.empty}>No media items.</p>
      ) : (
        <ul className={styles.list}>
          {mockMedia.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemPath} title={item.urlOrPath}>
                {item.urlOrPath}
              </span>
              <span className={styles.itemDesc}>{item.description}</span>
              <span className={styles.changeHint}>Change (coming with backend)</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
