export type Message = {
  id: string
  name: string
  email: string
  message: string
  date: string
  read: boolean
}

export type MediaItem = {
  id: string
  label: string
  urlOrPath: string
  description: string
}

export const mockMessages: Message[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    message: 'Hi, we\'re interested in a rebrand for our tech startup. Can we schedule a call next week?',
    date: '2025-03-05T14:22:00',
    read: false,
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'j.wilson@agency.co',
    message: 'Love your portfolio. We need social content for a product launch in April. What are your rates?',
    date: '2025-03-04T09:15:00',
    read: true,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena@studio.io',
    message: 'Quick question about the animation style you used on the Hero section – is that custom or a library? Thanks!',
    date: '2025-03-03T16:45:00',
    read: false,
  },
  {
    id: '4',
    name: 'Mike Thompson',
    email: 'mike.t@startup.com',
    message: 'We\'d like to discuss a long-term partnership for content and design. Please get in touch.',
    date: '2025-03-02T11:00:00',
    read: true,
  },
]

export const mockMedia: MediaItem[] = [
  { id: '1', label: 'Hero background', urlOrPath: '/Assets/hero-bg.jpg', description: 'Main hero section background' },
  { id: '2', label: 'White logo', urlOrPath: '/Assets/white-logo.png', description: 'Header and footer logo' },
  { id: '3', label: 'About us image', urlOrPath: '/Assets/about-image.jpg', description: 'About section photo' },
  { id: '4', label: 'Portfolio item 1', urlOrPath: '/Assets/work-1.jpg', description: 'First portfolio piece' },
  { id: '5', label: 'Portfolio item 2', urlOrPath: '/Assets/work-2.jpg', description: 'Second portfolio piece' },
  { id: '6', label: 'Favicon', urlOrPath: '/favicon.svg', description: 'Browser tab icon' },
]
