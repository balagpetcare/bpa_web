import { ShieldCheck, EyeOff, Lock, FileText } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Data Security',
    desc: 'Your contact information is encrypted and stored securely within BPA servers.',
  },
  {
    icon: EyeOff,
    title: 'Privacy First',
    desc: 'BPA does not sell or share your personal data with third-party marketing companies.',
  },
  {
    icon: Lock,
    title: 'Internal Use Only',
    desc: 'Information is used exclusively for clinic capacity planning and BPA service alerts.',
  },
  {
    icon: FileText,
    title: 'Not a Patient Record',
    desc: 'This census is for planning; it does not constitute a legal or medical patient record.',
  },
];

export default function PetCensusTrust() {
  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {TRUST_POINTS.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="shrink-0 mt-1">
                <item.icon size={20} className="text-(--bpa-green)" />
              </div>
              <div>
                <h4 className="font-bold text-(--bpa-navy) text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
