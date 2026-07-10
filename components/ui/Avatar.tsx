import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/utils/media-url';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ src, name, size = 64, className = '' }: AvatarProps) {
  const resolvedSrc = resolveMediaUrl(src);

  if (resolvedSrc) {
    return (
      <Image
        src={resolvedSrc}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-(--bpa-green) text-(--bpa-navy)/10 flex items-center justify-center font-bold select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
