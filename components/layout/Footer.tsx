import Link from 'next/link';
import { getPublicHomepage } from '@/lib/api/homepage';
import { getPublicSiteSettings, formatAddress } from '@/lib/api/site-settings';

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
  const [homepage, s] = await Promise.all([
    getPublicHomepage('en', { next: { revalidate: 600, tags: ['homepage-footer'] } }).catch(() => null),
    getPublicSiteSettings({ next: { revalidate: 600 } } as RequestInit).catch(() => null),
  ]);
  const footer = homepage?.footer ?? null;
  const footerLogoUrl = s?.secondaryLogoUrl ?? s?.primaryLogoUrl ?? null;
  const groups = footer?.groups?.length
    ? footer.groups
    : Object.entries(FALLBACK_LINKS).map(([title, links], index) => ({
        title,
        links: links.map((link, sortOrder) => ({ ...link, target: '_self' as const, sortOrder, isVisible: true })),
        sortOrder: index,
        isVisible: true,
      }));

  const contactPhone = s?.officialPhone ?? null;
  const contactEmail = s?.generalEmail ?? s?.supportEmail ?? footer?.email ?? null;
  const contactAddress = s ? formatAddress(s) : null;

  return (
    <footer className="bg-(--bpa-navy) text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {footerLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={footerLogoUrl} alt="BPA Logo" className="h-9 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-(--bpa-green) flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">BPA</span>
                  </div>
                  <span className="font-bold text-white text-sm leading-tight">
                    {footer?.brandName || s?.siteName || 'Bangladesh Pet Association'}
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {footer?.brandText || 'Promoting responsible pet ownership and animal welfare across Bangladesh.'}
            </p>

            {/* Contact quick-links */}
            <div className="space-y-1.5 text-xs text-gray-400">
              {contactPhone && (
                <p>
                  <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                    📞 {contactPhone}
                  </a>
                </p>
              )}
              {contactEmail && (
                <p>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                    ✉ {contactEmail}
                  </a>
                </p>
              )}
              {contactAddress && (
                <p className="leading-relaxed">📍 {contactAddress}</p>
              )}
            </div>
          </div>

          {/* Nav link groups */}
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

        {/* Bottom bar */}
        <div className="border-t border-(--bpa-navy-light) mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            {footer?.copyrightText || `Copyright ${year} Bangladesh Pet Association. All rights reserved.`}
          </p>
          {contactEmail && (
            <p className="text-xs text-gray-500">
              <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                {contactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
