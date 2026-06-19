import { Heart, Activity, CheckCircle, Bone, ShieldCheck, QrCode } from 'lucide-react';
import { DonationPageData } from '@/lib/api/donations';
import Link from 'next/link';

interface PurposeCardsProps {
  purposes: DonationPageData['purposes'];
  /** Base URL for the donate link. Defaults to /donate */
  donateBaseUrl?: string;
  /** Optional section heading */
  title?: string;
  subtitle?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  syringe: Activity,
  bone: Bone,
  ambulance: Activity,
  scissors: CheckCircle,
  users: Heart,
  hospital: ShieldCheck,
  heart: Heart,
};

export default function PurposeCards({
  purposes,
  donateBaseUrl = '/donate',
  title,
  subtitle,
}: PurposeCardsProps) {
  if (!purposes || purposes.length === 0) return null;

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-2xl font-extrabold text-(--bpa-navy) sm:text-3xl">{title}</h2>}
          {subtitle && <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
        </div>
      )}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {purposes.map((p) => {
        const Icon = ICON_MAP[p.icon || 'heart'] || Heart;
        return (
          <Link
            key={p.id}
            href={`${donateBaseUrl}?purpose=${p.id}#donate-form`}
            className="group block bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto bg-green-50 text-(--bpa-green) rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-(--bpa-green) group-hover:text-white transition-all">
              <Icon size={24} />
            </div>
            <h3 className="font-bold text-(--bpa-navy) text-sm leading-tight mb-2">
              {p.titleEn}
            </h3>
            {p.shortDescriptionEn && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {p.shortDescriptionEn}
              </p>
            )}
          </Link>
        );
      })}
    </div>
    </div>
  );
}
