import Image from 'next/image';

interface CommitteeMemberCardProps {
  member: {
    id: string;
    name: string;
    designation: string;
    bio: string | null;
    photoUrl: string | null;
    email: string | null;
    phone: string | null;
  };
  onClick: () => void;
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function CommitteeMemberCard({ member, onClick }: CommitteeMemberCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-(--bpa-green) transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy)"
    >
      {/* Photo */}
      <div className="relative aspect-square bg-(--bpa-green) overflow-hidden">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-(--bpa-green) select-none">
              {initials(member.name)}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-(--bpa-green) group-hover:bg-(--bpa-green-light) transition-colors" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-(--bpa-green) text-base leading-snug group-hover:text-(--bpa-green) transition-colors">
          {member.name}
        </h3>
        <p className="text-xs font-semibold text-(--bpa-navy) mt-1 uppercase tracking-wide">
          {member.designation}
        </p>
        {member.bio && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {member.bio}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-3 group-hover:text-(--bpa-green) transition-colors">
          View profile →
        </p>
      </div>
    </button>
  );
}
