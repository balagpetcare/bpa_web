import Link from 'next/link';
import { Clock, Stethoscope, ShoppingBag, Calendar } from 'lucide-react';

export default function PetSmartSolutionPreviewSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full mb-4">
            <Clock size={12} /> Coming Soon
          </span>
          <h2 className="text-3xl font-bold text-(--bpa-navy) mb-3">Pet Smart Solution</h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm">
            A separate future platform for complete pet care management — clinic operations, appointments, medical records, pet shop, and community features.
            Not part of the BPA Mother Organization website.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto mb-10">
          {[
            { icon: Stethoscope, label: 'Clinic Operations' },
            { icon: Calendar, label: 'Doctor Appointments' },
            { icon: ShoppingBag, label: 'Community Pet Shop' },
            { icon: Clock, label: 'More Features' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center opacity-75">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <span className="text-xs text-gray-400">Coming Soon</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/pet-smart-solution"
            className="inline-flex items-center gap-2 text-(--bpa-green) font-semibold hover:underline text-sm"
          >
            Learn about Pet Smart Solution →
          </Link>
        </div>
      </div>
    </section>
  );
}
