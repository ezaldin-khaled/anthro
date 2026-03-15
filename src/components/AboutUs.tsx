import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import styles from './AboutUs.module.css'
import { teamMembers, teamImages, teamSubtitle } from '../data/team'
import wesamImg from '../../Assets/wesam.png'

gsap.registerPlugin(ScrollTrigger)

const agencyContent = {
  tagline: 'Full-service strategy, design, and development.',
  column1:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  column2:
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.',
}

const projectsContent = {
  subtitle: 'A selection of our recent work across branding, digital products, and campaigns.',
  items: [
    { title: 'Brand & Identity', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.' },
    { title: 'Digital Products', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.' },
    { title: 'Campaigns & Content', description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
  ],
}

const ownerContent = {
  name: 'Wesam',
  title: 'Founder & Lead',
  bio1:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras consequat. Praesent dapibus, neque id cursus faucibus.',
  bio2:
    'Tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus.',
}

export function AboutUs() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  // Sync ScrollTrigger with Lenis: proxy window scroll to Lenis and update on scroll
  useEffect(() => {
    if (!lenis) return

    ScrollTrigger.scrollerProxy(window, {
      scrollTop(value) {
        if (value !== undefined) {
          lenis.scrollTo(value, { immediate: true })
          return value
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      lenis.off('scroll', ScrollTrigger.update)
      ScrollTrigger.scrollerProxy(window, {}) // clear proxy
      setTimeout(() => ScrollTrigger.refresh(), 0)
    }
  }, [lenis])

  // Flow per design: Section 1 (scroll down) → Section 2 About Us (horizontal slides) → scroll down → Section 3 Our Work.
  // Pin this section and drive horizontal slides with vertical scroll; when pin ends, next vertical scroll reveals Our Work.
  useEffect(() => {
    const section = sectionRef.current
    const container = containerRef.current
    if (!section || !container) return

    const panels = gsap.utils.toArray<HTMLElement>(container.querySelectorAll(`.${styles.panel}`))
    const n = panels.length
    if (n === 0) return

    const ctx = gsap.context(() => {
      gsap.to(panels, {
        xPercent: -100 * (n - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          snap: 1 / (n - 1),
          end: '+=3500',
          invalidateOnRefresh: true,
        },
      })
    }, section)

    // Recalculate scroll height after Section 3 (Our Work) has mounted so vertical scroll after the last slide reaches it
    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 300)
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshId)
      window.removeEventListener('resize', onResize)
      ctx.revert()
      // Defer refresh so React can unmount DOM first (avoids removeChild errors from pin-spacer)
      setTimeout(() => {
        ScrollTrigger.clearScrollMemory()
        ScrollTrigger.refresh()
      }, 0)
    }
  }, [lenis])

  return (
    <section
      ref={sectionRef}
      id="about"
      className={styles.wrapper}
      aria-labelledby="about-heading"
      aria-label="About us – scroll horizontally to read our story"
    >
      <div ref={containerRef} className={styles.container}>
        {/* 1. The Agency */}
        <article
          className={`${styles.panel} ${styles.panel1}`}
          id="agency"
          aria-labelledby="about-heading"
          data-section="1"
        >
          <div className={styles.gridOverlay} aria-hidden />
          <div className={`${styles.panelContent} ${styles.agencyLayout}`}>
            <h2 id="about-heading" className={styles.panelTitle}>
              The Agency
            </h2>
            <p className={styles.tagline}>{agencyContent.tagline}</p>
            <div className={styles.twoCol}>
              <p className={styles.bodyText}>{agencyContent.column1}</p>
              <p className={styles.bodyText}>{agencyContent.column2}</p>
            </div>
          </div>
        </article>

        {/* 2. Our Projects */}
        <article
          className={`${styles.panel} ${styles.panel2}`}
          id="projects"
          aria-labelledby="projects-heading"
          data-section="2"
        >
          <div className={styles.gridOverlay} aria-hidden />
          <div className={`${styles.panelContent} ${styles.projectsLayout}`}>
            <h2 id="projects-heading" className={styles.panelTitle}>
              Our Projects
            </h2>
            <p className={styles.subtitle}>{projectsContent.subtitle}</p>
            <ul className={styles.projectGrid}>
              {projectsContent.items.map((item, i) => (
                <li key={i} className={styles.projectCard}>
                  <div className={styles.projectCardImage} aria-hidden />
                  <h3 className={styles.projectCardTitle}>{item.title}</h3>
                  <p className={styles.projectCardDesc}>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* 3. The Team */}
        <article
          className={`${styles.panel} ${styles.panel3}`}
          id="team"
          aria-labelledby="team-heading"
          data-section="3"
        >
          <div className={styles.gridOverlay} aria-hidden />
          <div className={`${styles.panelContent} ${styles.teamLayout}`}>
            <h2 id="team-heading" className={styles.panelTitle}>
              The Team
            </h2>
            <p className={styles.subtitle}>{teamSubtitle}</p>
            <ul className={styles.teamGrid}>
              {teamMembers.map((member, i) => (
                <li key={member.slug} className={styles.teamCard}>
                  <Link
                    to={`/team/${member.slug}`}
                    className={styles.teamCardLink}
                  >
                    <div className={`${styles.teamCardAvatar} ${member.name === 'Tohama' ? styles.teamCardAvatarTohama : ''}`}>
                      <img src={teamImages[i]} alt="" className={styles.teamCardAvatarImg} />
                    </div>
                    <span className={styles.teamCardName}>{member.name}</span>
                    <span className={styles.teamCardRole}>{member.role}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* 4. The Owner */}
        <article
          className={`${styles.panel} ${styles.panel4}`}
          id="owner"
          aria-labelledby="owner-heading"
          data-section="4"
        >
          <div className={styles.gridOverlay} aria-hidden />
          <div className={`${styles.panelContent} ${styles.ownerLayout}`}>
            <div className={styles.ownerImageWrap}>
              <div className={styles.ownerImage}>
                <img src={wesamImg} alt="" className={styles.ownerImageImg} />
              </div>
            </div>
            <div className={styles.ownerBio}>
              <h2 id="owner-heading" className={styles.panelTitle}>
                The Owner
              </h2>
              <p className={styles.ownerName}>{ownerContent.name}</p>
              <p className={styles.ownerTitle}>{ownerContent.title}</p>
              <p className={styles.bodyText}>{ownerContent.bio1}</p>
              <p className={styles.bodyText}>{ownerContent.bio2}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
