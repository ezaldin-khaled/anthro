import { useParams, Link, Navigate } from 'react-router-dom'
import { getTeamMemberBySlug } from '../data/team'
import styles from './TeamMemberPage.module.css'

export function TeamMemberPage() {
  const { slug } = useParams<{ slug: string }>()
  const member = slug ? getTeamMemberBySlug(slug) : null

  if (!member) return <Navigate to="/#team" replace />

  const isTohama = member.name === 'Tohama'

  return (
    <section className={styles.wrapper} aria-labelledby="team-member-title">
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.inner}>
        <Link to="/#team" className={styles.backLink}>
          ← Back to The Team
        </Link>
        <div className={styles.layout}>
          <div className={styles.imageWrap}>
            <div className={`${styles.avatar} ${isTohama ? styles.avatarTohama : ''}`}>
              <img src={member.image} alt="" className={styles.avatarImg} />
            </div>
          </div>
          <div className={styles.content}>
            <span className={styles.tag}>Team</span>
            <h1 id="team-member-title" className={styles.title}>
              {member.name}
            </h1>
            <p className={styles.role}>{member.role}</p>
            <p className={styles.profile}>{member.profile}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
