import aliImg from '../../Assets/ali.png'
import maisImg from '../../Assets/mais.png'
import tohamaImg from '../../Assets/tohama.png'
import yasminImg from '../../Assets/yasmin.png'
import khaledImg from '../../Assets/khaled.jpeg'
import moaansImg from '../../Assets/moaans.png'
import rabeeImg from '../../Assets/rr.png'

export const teamImages = [
  aliImg,
  maisImg,
  tohamaImg,
  yasminImg,
  khaledImg,
  moaansImg, // Mounes
  moaansImg, // Moaans
  rabeeImg,
]

export type Project = {
  title: string
  category?: string
  description?: string
}

export type TeamMember = {
  name: string
  role: string
  slug: string
  profile: string
  workedOn?: Project[]
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Ali Alassaad',
    role: 'Team Leader, Backend Developer',
    slug: 'ali',
    profile:
      'Ali Alassaad is a backend developer and technology team leader working at the intersection of software engineering, marketing strategy, and digital product development. He specializes in building scalable backend systems using technologies such as Go and Django, with a focus on performance, security, and system architecture. Alongside his engineering work, he is involved in digital marketing and product strategy, helping companies connect technology with real business outcomes. He is also a co-founder of AnthroTech, where he contributes to building technology-driven solutions that combine software development, branding, and modern media platforms. His work centers on creating practical systems and platforms that integrate technology, automation, and strategic thinking to support innovative digital products and businesses.',
    workedOn: [
      { title: 'Full rebrand and visual identity', category: 'Brand & Identity', description: 'Backend architecture and API design.' },
      { title: 'Product strategy and UI/UX', category: 'Digital Products', description: 'Server infrastructure and data layer.' },
      { title: 'High-performance web platform', category: 'Web & Development', description: 'Design system and API integration.' },
    ],
  },
  {
    name: 'Mais',
    role: 'Graphic Designer',
    slug: 'mais',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    workedOn: [
      { title: 'Full rebrand and visual identity', category: 'Brand & Identity', description: 'Visual system and brand assets.' },
      { title: 'Integrated campaign and content', category: 'Campaigns & Content', description: 'Campaign visuals and art direction.' },
    ],
  },
  {
    name: 'Tohama',
    role: 'Marketing Specialist',
    slug: 'tohama',
    profile:
      'A results-driven Marketing Specialist specializing in digital marketing strategy, content creation, and paid advertising management. Experienced in developing data-driven marketing strategies, managing high-performing campaigns, and creating impactful content that strengthens brand identity and drives growth. Skilled in Microsoft Office tools with a strong ability to combine creativity, strategy, and analytical thinking to deliver measurable marketing results.',
    workedOn: [
      { title: 'Integrated campaign and content', category: 'Campaigns & Content', description: 'Multi-channel campaign strategy and content.' },
      { title: 'Full rebrand and visual identity', category: 'Brand & Identity', description: 'Brand messaging and market positioning.' },
    ],
  },
  {
    name: 'Yasmin',
    role: 'Team',
    slug: 'yasmin',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    workedOn: [
      { title: 'Product strategy and UI/UX', category: 'Digital Products', description: 'Product coordination and QA.' },
      { title: 'Design and development', category: 'Web & Development', description: 'Project coordination and delivery.' },
    ],
  },
  {
    name: 'Khaled',
    role: 'Front End Developer, Mobile App Developer',
    slug: 'khaled',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    workedOn: [
      { title: 'Product strategy and UI/UX', category: 'Digital Products', description: 'End-to-end product design and front-end build.' },
      { title: 'Design and development', category: 'Web & Development', description: 'High-performance web platform and design system.' },
      { title: 'Full rebrand and visual identity', category: 'Brand & Identity', description: 'Interactive and motion design.' },
    ],
  },
  {
    name: 'Mounes',
    role: 'Team',
    slug: 'mounes',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    workedOn: [],
  },
  {
    name: 'Moaans',
    role: 'Team',
    slug: 'moaans',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    workedOn: [],
  },
  {
    name: 'Rabee Al-Muhasna',
    role: 'Film Director & Cinematographer',
    slug: 'rabee',
    profile:
      'Rabee Al-Muhasna is a film director and cinematographer based in the United Arab Emirates. He is one of the founders of AnthroTech Media, a media production company, and also a co-founder of the Morvin Theater Group. He works in the field of visual content creation and advertising, using a cinematic style that emphasizes the power of imagery and visual storytelling. His work focuses on transforming real-life stories into impactful visual productions, while also developing modern media projects and content platforms that combine creativity with technology.',
    workedOn: [],
  },
]

export const teamSubtitle = 'The people behind the work.'

export function getTeamMemberBySlug(slug: string): (TeamMember & { image: string }) | null {
  const i = teamMembers.findIndex((m) => m.slug === slug)
  if (i === -1) return null
  return { ...teamMembers[i], image: teamImages[i] }
}
