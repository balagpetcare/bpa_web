'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, LayoutGrid, MapPin, Stethoscope } from 'lucide-react';
import { getPublicZones } from '@/lib/api/community-care';
import type { CommunityZonePublic } from '@/types/bpa.types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

const CLINIC_STATUS_COLORS: Record<string, "gray" | "yellow" | "blue" | "green" | "red"> = {
  planned: 'gray',
  priority: 'yellow',
  in_progress: 'blue',
  active: 'green',
  paused: 'red',
};

export default function ClinicPriorityRanking() {
  const [zones, setZones] = useState<CommunityZonePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadZones() {
      try {
        const data = await getPublicZones();
        // Backend listActiveZonesPublic already sorts by priorityOrder then paidMemberCount
        setZones(data);
      } catch (err) {
        console.error('Failed to load clinic priority zones:', err);
      } finally {
        setLoading(false);
      }
    }
    loadZones();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (zones.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="green" className="mb-4 bg-emerald-50 text-(--bpa-green) border border-(--bpa-green)">
              Expansion Roadmap
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Clinic Expansion Priority by Zone</h2>
            <p className="text-lg text-slate-600">
              BPA will prioritize clinic and partner branch expansion based on the number of active 
              <span className="font-semibold text-slate-900"> Community Care Partner Card</span> members in each zone.
            </p>
          </div>

          <div className="space-y-6">
            {zones.map((z, i) => {
              const target = z.targetMembers || 1000;
              const current = z.paidMemberCount || 0;
              const progress = Math.min(100, (current / target) * 100);
              
              return (
                <div 
                  key={z.id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-(--bpa-green-light) text-(--bpa-green) flex items-center justify-center font-bold text-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {z.name}
                          {z.clinicStatus && (
                            <Badge variant={CLINIC_STATUS_COLORS[z.clinicStatus] || 'gray'} className="capitalize text-[10px] py-0 px-2">
                              {z.clinicStatus.replace('_', ' ')}
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                          <MapPin size={14} className="flex-shrink-0" />
                          <span className="line-clamp-1">{z.description || `${z.city}, ${z.district}`}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-baseline md:items-end gap-2 md:gap-0">
                      <div className="text-2xl font-black text-slate-900">{current.toLocaleString()}</div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Paid Members</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-sm">
                      <div className="font-medium text-slate-700">Progress to Launch Target</div>
                      <div className="text-slate-500">
                        <span className="font-bold text-slate-900">{progress.toFixed(1)}%</span>
                        <span className="mx-1">of</span>
                        <span className="font-semibold text-slate-700">{target.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-(--bpa-green) transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {z.expectedLaunchNote && (
                      <div className="flex items-center gap-1.5 text-xs text-(--bpa-green) font-medium pt-1">
                        <Stethoscope size={12} />
                        {z.expectedLaunchNote}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 bg-(--bpa-green) rounded-2xl text-white text-center shadow-xl shadow-emerald-900/10">
            <h3 className="text-2xl font-bold mb-3">Support Your Local Clinic Expansion</h3>
            <p className="text-emerald-50 mb-8 max-w-xl mx-auto">
              Get your Community Care Partner Card today. Your membership helps us decide 
              where to bring specialized pet care services first while giving you exclusive benefits.
            </p>
            <Link href="/community-pet-care/contribute" passHref>
              <Button size="lg" className="bg-white text-(--bpa-green) hover:bg-emerald-50 border-none font-bold px-8 py-6 h-auto text-lg rounded-full">
                Get Your Card & Support Your Zone
                <ChevronRight className="ml-2" />
              </Button>
            </Link>
            <p className="mt-6 text-xs text-emerald-100/70 italic max-w-md mx-auto">
              This is a service-benefit card. Your contribution supports community clinic access 
              and specialized healthcare services. Membership does not imply financial return or investment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
