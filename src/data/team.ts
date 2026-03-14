import aliImg from '../../Assets/ali.png'
import maisImg from '../../Assets/mais.png'
import tohamaImg from '../../Assets/tohama.png'
import yasminImg from '../../Assets/yasmin.png'
import khaledImg from '../../Assets/khaled.jpeg'

export const teamImages = [aliImg, maisImg, tohamaImg, yasminImg, khaledImg]

export type TeamMember = {
  name: string
  role: string
  slug: string
  profile: string
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Ali',
    role: 'Team Leader, Backend Developer',
    slug: 'ali',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    name: 'Mais',
    role: 'Graphic Designer',
    slug: 'mias',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    name: 'Tohama',
    role: 'Marketing Specialist',
    slug: 'tohama',
    profile:
      'A results-driven Marketing Specialist specializing in digital marketing strategy, content creation, and paid advertising management. Experienced in developing data-driven marketing strategies, managing high-performing campaigns, and creating impactful content that strengthens brand identity and drives growth. Skilled in Microsoft Office tools with a strong ability to combine creativity, strategy, and analytical thinking to deliver measurable marketing results.',
  },
  {
    name: 'Yasmin',
    role: 'Team',
    slug: 'yasmin',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    name: 'Khaled',
    role: 'Front End Developer, Mobile App Developer',
    slug: 'khaled',
    profile:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
]

export const teamSubtitle = 'The people behind the work.'

export function getTeamMemberBySlug(slug: string): (TeamMember & { image: string }) | null {
  const i = teamMembers.findIndex((m) => m.slug === slug)
  if (i === -1) return null
  return { ...teamMembers[i], image: teamImages[i] }
}
