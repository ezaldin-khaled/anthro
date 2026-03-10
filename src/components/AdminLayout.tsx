import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AdminLayout.module.css'

export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Admin navigation">
          <h2 className={styles.sidebarTitle}>Dashboard</h2>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink)}
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/messages"
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink)}
          >
            Messages
          </NavLink>
          <NavLink
            to="/admin/media"
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink)}
          >
            Media
          </NavLink>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </aside>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
