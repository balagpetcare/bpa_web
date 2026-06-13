import Link from 'next/link';
import { getPublicHomepage } from '@/lib/api/homepage';

const FALLBACK_LINKS = {
  Organization: [
    { label: 'About BPA', href: '/about' },
    { label: 'Mission & Vision', href: '/mission' },
    { label: 'Committee', href: '/committee' },
  ],
  Community: [
    { label: 'News', href: '/news' },
    { label: 'Events', href: '/events' },
    { label: 'Volunteer', href: '/volunteer' },
  ],
  Members: [
    { label: 'Membership', href: '/membership' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

export default async function Footer() {
  const year = new Date().getFullYear();
  const homepage = await getPublicHomepage('en', { next: { revalidate: 600, tags: ['homepage-footer'] } }).catch(() => null);
  const footer = homepage?.footer ?? null;
  const groups = footer?.groups?.length
    ? footer.groups
    : Object.entries(FALLBACK_LINKS).map(([title, links], index) => ({ title, links: links.map((link, sortOrder) => ({ ...link, target: '_self' as const, sortOrder, isVisible: true })), sortOrder: index, isVisible: true }));

  return (
    <footer className="bg-(--bpa-navy) text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-(--bpa-green) flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">BPA</span>
              </div>
              <span className="font-bold text-white text-sm leading-tight">
                {footer?.brandName || 'Bangladesh Pet Association'}
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {footer?.brandText || 'Promoting responsible pet ownership and animal welfare across Bangladesh.'}
            </p>
          </div>

          {groups.filter((group) => group.isVisible).slice(0, 3).map((group) => (
            <div key={group.title}>
              <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.filter((link) => link.isVisible).map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-(--bpa-navy-light) mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            {footer?.copyrightText || `Copyright ${year} Bangladesh Pet Association. All rights reserved.`}
          </p>
          <p className="text-xs text-gray-500">
            Email:{' '}
            <a href={`mailto:${footer?.email || 'info@bpa.org.bd'}`} className="hover:text-white transition-colors">
              {footer?.email || 'info@bpa.org.bd'}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
