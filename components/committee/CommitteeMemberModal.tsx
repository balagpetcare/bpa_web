'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, Mail, Phone } from 'lucide-react';
import type { CommitteeMember } from '@/types/bpa.types';

interface CommitteeMemberModalProps {
  member: CommitteeMember | null;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function CommitteeMemberModal({ member, onClose }: CommitteeMemberModalProps) {
  useEffect(() => {
    if (!member) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [member, onClose]);

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} profile`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-500 hover:text-(--bpa-green) hover:bg-white transition-colors shadow-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Photo header */}
        <div className="relative h-56 bg-(--bpa-green) overflow-hidden rounded-t-3xl">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl font-bold text-(--bpa-green) select-none">
                {initials(member.name)}
              </span>
            </div>
          )}
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="px-7 pb-8 -mt-4 relative">
          {/* Name & designation */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-(--bpa-green) leading-tight">{member.name}</h2>
            <p className="text-sm font-semibold text-(--bpa-navy) uppercase tracking-widest mt-1">
              {member.designation}
            </p>
          </div>

          {/* Divider */}
          <div className="w-12 h-1 bg-(--bpa-green) rounded-full mb-6" />

          {/* Bio */}
          {member.bio && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Biography</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{member.bio}</p>
            </div>
          )}

          {/* Contact info */}
          {(member.email || member.phone) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h3>
              <div className="space-y-2">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-(--bpa-green) transition-colors group"
                  >
                    <div className="w-8 h-8 bg-(--bpa-navy)/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-(--bpa-green-light) transition-colors">
                      <Mail size={14} className="text-(--bpa-green-light) group-hover:text-white transition-colors" />
                    </div>
                    <span>{member.email}</span>
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-(--bpa-green) transition-colors group"
                  >
                    <div className="w-8 h-8 bg-(--bpa-navy)/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-(--bpa-green-light) transition-colors">
                      <Phone size={14} className="text-(--bpa-green-light) group-hover:text-white transition-colors" />
                    </div>
                    <span>{member.phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
