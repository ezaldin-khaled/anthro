import styles from './Services.module.css'

const marketingBullets = [
  'We provide strategic marketing solutions based on market research and audience analysis.',
  'We develop comprehensive marketing plans aligned with business objectives and growth goals.',
  'We plan and oversee campaign execution while monitoring performance.',
  'Our focus is on measurable results and continuous optimization.',
  'Our goal is to build effective marketing processes that generate sustainable business growth.',
]

const graphicDesignBullets = [
  'We deliver professional design solutions that reflect brand identity and strengthen visual presence.',
  'The department covers full branding development and cohesive visual identity systems.',
  'We create social media designs and campaign visuals with strategic and consistent direction.',
  'Our focus is on clarity, visual impact, and cohesive design elements.',
  'Our goal is to build strong visual identities that support growth and market presence.',
]

const developmentBullets = [
  'We provide programming solutions including the design and development of static and dynamic websites and custom e-commerce platforms.',
  'We deliver professional UI/UX design to ensure seamless and engaging user experiences.',
  'We develop SaaS platforms and advanced dashboards tailored to diverse business needs.',
  'Our focus is on performance, security, and scalability.',
  'We manage deployment, launch, and ongoing technical maintenance.',
]

export function Services() {
  return (
    <section
      id="services"
      className={styles.wrapper}
      aria-labelledby="services-heading"
    >
      {/* Sticky panel 1: title */}
      <div className={`${styles.panel} ${styles.panelTitle}`}>
        <div className={styles.gridOverlay} aria-hidden />
        <div className={styles.panelContent}>
          <h2 id="services-heading" className={styles.heading}>
            Our Services
          </h2>
        </div>
      </div>

      {/* First service: Marketing Solutions — text left, image right */}
      <div className={`${styles.panel} ${styles.panelService}`}>
        <div className={styles.gridOverlay} aria-hidden />
        <div className={styles.panelContent} data-wide>
          <article className={styles.serviceHero}>
            <div className={styles.serviceHeroText}>
              <h3 className={styles.serviceHeroTitle}>Marketing Solutions</h3>
              <ul className={styles.serviceHeroList}>
                {marketingBullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className={styles.serviceHeroImage}>
              <img
                src="/Assets/mountain.jpeg"
                alt="Landscape: mountains at sunrise or sunset"
                width={640}
                height={360}
              />
            </div>
          </article>
        </div>
      </div>

      {/* Second service: Graphic Design — text left, image right */}
      <div className={`${styles.panel} ${styles.panelService}`}>
        <div className={styles.gridOverlay} aria-hidden />
        <div className={styles.panelContent} data-wide>
          <article className={styles.serviceHero}>
            <div className={styles.serviceHeroText}>
              <h3 className={styles.serviceHeroTitle}>Graphic Design</h3>
              <ul className={styles.serviceHeroList}>
                {graphicDesignBullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className={styles.serviceHeroImage}>
              <img
                src="/Assets/InShot_20260222_135259510.jpg.jpeg"
                alt="Creative illumination: lit light bulb on warm background"
                width={640}
                height={360}
              />
            </div>
          </article>
        </div>
      </div>

      {/* Third service: Development/Programming Solutions — text left, image right */}
      <div className={`${styles.panel} ${styles.panelService}`}>
        <div className={styles.gridOverlay} aria-hidden />
        <div className={styles.panelContent} data-wide>
          <article className={styles.serviceHero}>
            <div className={styles.serviceHeroText}>
              <h3 className={styles.serviceHeroTitle}>Development/Programming Solutions</h3>
              <ul className={styles.serviceHeroList}>
                {developmentBullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className={styles.serviceHeroImage}>
              <img
                src="/Assets/Jue6sX4w.jpg"
                alt="Arrow hitting bullseye: precision and goal achievement"
                width={640}
                height={360}
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
