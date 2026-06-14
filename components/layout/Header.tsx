'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import MobileNav from './MobileNav';
import { NAV_ITEMS } from '@/lib/navigation';
import { getPublicSiteSettings } from '@/lib/api/site-settings';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [primaryLogoUrl, setPrimaryLogoUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    getPublicSiteSettings().then(s => setPrimaryLogoUrl(s.primaryLogoUrl));
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-shadow duration-200 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {primaryLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={primaryLogoUrl} alt="BPA Logo" className="h-9 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-(--bpa-green) flex items-center justify-center">
                    <span className="text-white text-sm font-bold">BPA</span>
                  </div>
                  <span className="font-bold text-(--bpa-navy) text-base hidden sm:block leading-tight">
                    Bangladesh<br />Pet Association
                  </span>
                </>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'text-(--bpa-green) bg-(--bpa-green-light)'
                        : 'text-gray-600 hover:text-(--bpa-green) hover:bg-(--bpa-green-light)'
                    }`}
                  >
                    {item.label}
                  </Link>

                  {item.children && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-(--bpa-green) hover:bg-(--bpa-green-light) first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA + mobile menu button */}
            <div className="flex items-center gap-2">
              <Link
                href="/membership"
                className="hidden sm:inline-flex items-center justify-center bg-(--bpa-green) text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-(--bpa-green-dark) transition-colors"
              >
                Join BPA
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-(--bpa-green) hover:bg-(--bpa-green-light) transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
