'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="font-semibold text-(--bpa-navy)">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="block px-6 py-3 text-sm font-medium text-gray-700 hover:text-(--bpa-green) hover:bg-(--bpa-green-light) transition-colors"
              >
                {item.label}
              </Link>
              {item.children && (
                <ul className="border-t border-gray-50">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onClose}
                        className="block pl-10 pr-6 py-2.5 text-sm text-gray-500 hover:text-(--bpa-green) hover:bg-(--bpa-green-light) transition-colors"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="px-6 py-4 border-t border-gray-100">
          <Link
            href="/membership"
            onClick={onClose}
            className="block w-full text-center bg-(--bpa-green) text-white text-sm font-semibold py-3 px-4 rounded-lg hover:bg-(--bpa-green-dark) transition-colors"
          >
            Join BPA
          </Link>
        </div>
      </nav>
    </div>
  );
}
