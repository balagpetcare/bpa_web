export interface NavItem {
  label: string;
  labelBn?: string;
  href: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Find Clinics', labelBn: 'ক্লিনিক খুঁজুন', href: '/clinics' },
  {
    label: 'Programs',
    href: '#',
    children: [
      { label: 'Campaigns', href: '/campaigns' },
      { label: 'Pet Census 2026', href: '/pet-census-2026' },
      { label: 'Community Pet Care', href: '/community-pet-care' },
      { label: 'Events', href: '/events' },
      { label: 'Videos', labelBn: 'ভিডিও', href: '/videos' },
    ],
  },
  {
    label: 'Services',
    href: '#',
    children: [
      { label: 'Membership', href: '/membership' },
      { label: 'Care Partner Card', href: '/care-partner-card' },
      { label: 'Booking Lookup', href: '/booking-lookup' },
      { label: 'Certificate Verification', href: '/verify' },
    ],
  },
  {
    label: 'Get Involved',
    href: '#',
    children: [
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Donate', href: '/donate' },
      { label: 'Transparency', href: '/transparency' },
      { label: 'Committee', href: '/committee' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];
