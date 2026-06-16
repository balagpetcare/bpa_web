import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaInstagram,
  FaXTwitter,
} from 'react-icons/fa6';
import { getPublicHomepage } from '@/lib/api/homepage';
import { getPublicSiteSettings, formatAddress } from '@/lib/api/site-settings';

export default async function Footer() {
  const year = new Date().getFullYear();
  const [homepage, s] = await Promise.all([
    getPublicHomepage('en', { next: { revalidate: 600, tags: ['homepage-footer'] } }).catch(() => null),
    getPublicSiteSettings({ next: { revalidate: 600 } } as RequestInit).catch(() => null),
  ]);

  const footer = homepage?.footer ?? null;
  const footerLogoUrl = s?.secondaryLogoUrl ?? s?.primaryLogoUrl ?? null;
  
  const contactPhone = s?.officialPhone ?? null;
  const contactEmail = s?.generalEmail ?? s?.supportEmail ?? footer?.email ?? null;
  const contactAddress = s ? formatAddress(s) : null;
  const officeHours = s?.officeHours || '9:00 AM - 6:00 PM (Sat-Thu)';

  const socialLinks = [
    { icon: FaFacebook,  href: s?.facebookUrl  || '#', label: 'Facebook' },
    { icon: FaYoutube,   href: s?.youtubeUrl   || '#', label: 'YouTube' },
    { icon: FaLinkedin,  href: s?.linkedinUrl  || '#', label: 'LinkedIn' },
    { icon: FaXTwitter,  href: '#',                    label: 'X / Twitter' },
    { icon: FaInstagram, href: '#',                    label: 'Instagram' },
  ].filter(link => link.href !== '#');

  const finalSocialLinks = socialLinks.length > 0 ? socialLinks : [
    { icon: FaFacebook, href: 'https://facebook.com',  label: 'Facebook' },
    { icon: FaYoutube,  href: 'https://youtube.com',   label: 'YouTube' },
    { icon: FaLinkedin, href: 'https://linkedin.com',  label: 'LinkedIn' },
  ];

  const navigation = {
    organization: [
      { label: 'About BPA', href: '/about' },
      { label: 'Mission & Vision', href: '/mission' },
      { label: 'Committee', href: '/committee' },
      { label: 'Transparency', href: '/transparency' },
    ],
    programs: [
      { label: 'Campaigns', href: '/campaigns' },
      { label: 'Community Pet Care', href: '/community-pet-care' },
      { label: 'Pet Census', href: '/pet-census-2026' },
      { label: 'Events', href: '/events' },
      { label: 'Volunteer', href: '/volunteer' },
    ],
    members: [
      { label: 'Membership', href: '/membership' },
      { label: 'Care Partner Card', href: '/care-partner-card' },
      { label: 'Booking Lookup', href: '/booking-lookup' },
      { label: 'Certificate Verification', href: '/verify' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Refund Policy', href: '#' },
      { label: 'Disclaimer', href: '#' },
    ]
  };

  return (
    <footer className="bg-(--bpa-navy) text-gray-300 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Column 1: Brand & About */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              {footerLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={footerLogoUrl} alt="BPA Logo" className="h-10 w-auto object-contain brightness-0 invert" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-(--bpa-green) flex items-center justify-center shrink-0 shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                    <span className="text-white text-base font-bold">BPA</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm tracking-tight leading-none uppercase">
                      Bangladesh
                    </span>
                    <span className="font-medium text-white/70 text-[10px] tracking-[0.2em] leading-tight uppercase">
                      Pet Association
                    </span>
                  </div>
                </>
              )}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              {footer?.brandText || 'A national animal welfare organization dedicated to promoting responsible pet ownership and improving the lives of animals across Bangladesh.'}
            </p>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {finalSocialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-(--bpa-green) hover:text-white hover:border-(--bpa-green) transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Organization */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-(--bpa-green)"></span>
              Organization
            </h3>
            <ul className="space-y-3">
              {navigation.organization.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="group text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-all duration-300"
                  >
                    <ArrowRight size={12} className="text-(--bpa-green) -ml-5 opacity-0 group-hover:ml-0 group-hover:opacity-100 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-(--bpa-green)"></span>
              Programs
            </h3>
            <ul className="space-y-3">
              {navigation.programs.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="group text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-all duration-300"
                  >
                    <ArrowRight size={12} className="text-(--bpa-green) -ml-5 opacity-0 group-hover:ml-0 group-hover:opacity-100 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Member Services */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-(--bpa-green)"></span>
              Services
            </h3>
            <ul className="space-y-3">
              {navigation.members.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="group text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-all duration-300"
                  >
                    <ArrowRight size={12} className="text-(--bpa-green) -ml-5 opacity-0 group-hover:ml-0 group-hover:opacity-100 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Support */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-(--bpa-green)"></span>
              Support
            </h3>
            <div className="space-y-4">
              {contactPhone && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Phone size={14} className="text-(--bpa-green)" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Hotline</p>
                    <a href={`tel:${contactPhone}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {contactPhone}
                    </a>
                  </div>
                </div>
              )}
              {contactEmail && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Mail size={14} className="text-(--bpa-green)" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email Us</p>
                    <a href={`mailto:${contactEmail}`} className="text-sm text-gray-300 hover:text-white transition-colors break-all">
                      {contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {contactAddress && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <MapPin size={14} className="text-(--bpa-green)" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Our Office</p>
                    <p className="text-sm text-gray-300 leading-snug">
                      {contactAddress}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Clock size={14} className="text-(--bpa-green)" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Office Hours</p>
                  <p className="text-sm text-gray-300">
                    {officeHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-xs text-gray-500 order-3 lg:order-1 text-center lg:text-left">
              <p>&copy; {year} {footer?.brandName || s?.organizationName || 'Bangladesh Pet Association'}. All Rights Reserved.</p>
              <p className="mt-1 opacity-50">Registered National Welfare Organization of Bangladesh.</p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 order-1 lg:order-2">
              {navigation.legal.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Support Message */}
            <div className="flex items-center gap-2 order-2 lg:order-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
