import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useLenis } from 'lenis/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getTeamMemberBySlug } from '../data/team'
import styles from './TeamMemberPage.module.css'

export function TeamMemberPage() {
  const { slug } = useParams<{ slug: string }>()
  const member = slug ? getTeamMemberBySlug(slug) : null
  const lenis = useLenis()

  // Reset scroll and clear any pinned state when entering this page (e.g. from About Us slider)
  useEffect(() => {
    window.scrollTo(0, 0)
    lenis?.scrollTo(0, { immediate: true })
    ScrollTrigger.clearScrollMemory()
    ScrollTrigger.refresh()
  }, [lenis])

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

            {member.workedOn && member.workedOn.length > 0 && (
              <div className={styles.workedOn}>
                <h2 className={styles.workedOnTitle}>Worked on</h2>
                <ul className={styles.projectList} aria-label="Projects this team member worked on">
                  {member.workedOn.map((project, i) => (
                    <li key={i} className={styles.projectItem}>
                      {project.category && (
                        <span className={styles.projectCategory}>{project.category}</span>
                      )}
                      <span className={styles.projectTitle}>{project.title}</span>
                      {project.description && (
                        <p className={styles.projectDesc}>{project.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
