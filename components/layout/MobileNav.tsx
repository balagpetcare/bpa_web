'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, Heart } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-expand section that contains active child
  useEffect(() => {
    if (!isOpen) return;
    const active = new Set<string>();
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))) {
        active.add(item.label);
      }
    });
    setOpenSections(active);
  }, [isOpen, pathname]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <nav
        className="absolute top-0 right-0 h-full w-[300px] bg-white shadow-xl flex flex-col"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-(--bpa-navy) text-sm uppercase tracking-wider">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <ul className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children?.length;
            const sectionOpen = openSections.has(item.label);
            const isActive = item.href !== '#' && (pathname === item.href || pathname.startsWith(item.href + '/'));
            const isChildActive = item.children?.some(
              (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
            );

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleSection(item.label)}
                      aria-expanded={sectionOpen}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-colors ${
                        isChildActive
                          ? 'text-(--bpa-green) bg-(--bpa-green-light)'
                          : 'text-gray-700 hover:text-(--bpa-green) hover:bg-(--bpa-green-light)'
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${sectionOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {sectionOpen && (
                      <ul className="bg-gray-50 border-t border-gray-100">
                        {item.children!.map((child) => {
                          const childActive =
                            pathname === child.href || pathname.startsWith(child.href + '/');
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className={`block pl-8 pr-5 py-2.5 text-sm transition-colors ${
                                  childActive
                                    ? 'text-(--bpa-green) font-semibold'
                                    : 'text-gray-500 hover:text-(--bpa-green)'
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`block px-5 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-(--bpa-green) bg-(--bpa-green-light)'
                        : 'text-gray-700 hover:text-(--bpa-green) hover:bg-(--bpa-green-light)'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Bottom CTAs */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <Link
            href="/donate"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-(--bpa-green) text-white text-sm font-bold py-3 px-4 rounded-lg hover:bg-(--bpa-green-dark) transition-colors"
          >
            <Heart size={15} className="fill-current" />
            Donate Now
          </Link>
          <Link
            href="/membership"
            onClick={onClose}
            className="block w-full text-center border-2 border-(--bpa-green) text-(--bpa-green) text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-(--bpa-green) hover:text-white transition-all"
          >
            Join BPA / Become a Member
          </Link>
        </div>
      </nav>
    </div>
  );
}
