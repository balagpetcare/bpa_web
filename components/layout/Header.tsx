'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, ChevronDown, Heart } from 'lucide-react';
import MobileNav from './MobileNav';
import { NAV_ITEMS, type NavItem } from '@/lib/navigation';
import { getPublicSiteSettings } from '@/lib/api/site-settings';
import { useAuth } from '@/context/AuthContext';

// ─── Desktop Dropdown Item ────────────────────────────────────────────────────

function DesktopNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = !!item.children?.length;

  const isActive =
    item.href !== '#' &&
    (pathname === item.href || pathname.startsWith(item.href + '/'));
  const isChildActive = item.children?.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  const activeClass = 'text-(--bpa-green) bg-(--bpa-green-light)';
  const defaultClass = 'text-gray-600 hover:text-(--bpa-green) hover:bg-(--bpa-green-light)';

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? activeClass : defaultClass
        }`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isChildActive ? activeClass : defaultClass
        }`}
      >
        {item.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {item.children!.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
            return (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  childActive
                    ? 'text-(--bpa-green) bg-(--bpa-green-light)'
                    : 'text-gray-600 hover:text-(--bpa-green) hover:bg-(--bpa-green-light)'
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const { user, loading } = useAuth();
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
    getPublicSiteSettings().then((s) => setPrimaryLogoUrl(s.primaryLogoUrl));
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
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <DesktopNavItem key={item.label} item={item} pathname={pathname} />
              ))}
            </nav>

            {/* Right side CTAs */}
            <div className="flex items-center gap-2">
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={16} className="text-gray-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name.split(' ')[0]}</span>
                </Link>
              ) : (
                !loading && (
                  <Link
                    href="/auth/sign-in"
                    className="hidden sm:inline-flex items-center justify-center text-(--bpa-navy) text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                )
              )}

              <Link
                href="/donate"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 bg-(--bpa-green) text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-(--bpa-green-dark) transition-colors"
              >
                <Heart size={14} className="fill-current" />
                Donate
              </Link>

              <Link
                href="/membership"
                className="hidden lg:inline-flex items-center justify-center border-2 border-(--bpa-green) text-(--bpa-green) text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-(--bpa-green) hover:text-white transition-all"
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
