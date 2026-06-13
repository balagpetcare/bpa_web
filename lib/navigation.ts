export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About BPA', href: '/about' },
      { label: 'Mission & Vision', href: '/mission' },
      { label: 'Committee', href: '/committee' },
    ],
  },
  { label: 'News', href: '/news' },
  { label: 'Events', href: '/events' },
  { label: 'Campaigns', href: '/campaigns' },
  {
    label: 'Community Pet Care',
    href: '/community-pet-care',
    children: [
      { label: 'Overview', href: '/community-pet-care' },
      { label: 'Zones', href: '/community-pet-care/zones' },
      { label: 'Contribute ৳3,000', href: '/community-pet-care/contribute' },
      { label: 'Care Partner Card', href: '/care-partner-card' },
      { label: 'Verify Card', href: '/verify/care-card' },
      { label: 'Pet Census 2026', href: '/pet-census-2026' },
      { label: 'Transparency', href: '/transparency' },
      { label: 'FAQ', href: '/community-pet-care/faq' },
    ],
  },
  { label: 'Membership', href: '/membership' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Contact', href: '/contact' },
];
