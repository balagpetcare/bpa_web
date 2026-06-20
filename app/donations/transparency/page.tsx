import type { Metadata } from 'next';
import { apiFetch } from '@/lib/api';
import SectionHeader from '@/components/ui/SectionHeader';
import { ShieldCheck, Download, FileText } from 'lucide-react';
import { DonationTransparencyReport } from '@/lib/api/donations';
import DonationCTASection from '@/components/donations/DonationCTASection';

export const metadata: Metadata = {
  title: 'Transparency Reports - Bangladesh Pet Association',
  description: 'View our quarterly and annual financial transparency reports.',
};

export const revalidate = 3600;

export default async function TransparencyPage() {
  let reports: DonationTransparencyReport[] = [];
  try {
    const res = await apiFetch('/public/transparency-reports?status=published');
    reports = (res.data as DonationTransparencyReport[]) || [];
  } catch (err) {
    console.error('Failed to load transparency reports', err);
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-(--bpa-navy) py-20 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <ShieldCheck size={48} className="mx-auto text-(--bpa-green) mb-6" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">100% Transparency</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We believe you deserve to know exactly where every Taka goes. 
            Review our detailed financial reports to see your impact in action.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-lg text-(--bpa-navy)">{report.titleEn}</h3>
                <span className="text-xs font-bold bg-white border px-2 py-1 rounded text-gray-500 uppercase tracking-wider">{report.reportMonth}</span>
              </div>
              
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total Received:</span>
                  <span className="font-bold text-(--bpa-green)">৳{Number(report.totalReceived).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total Used:</span>
                  <span className="font-bold text-red-500">৳{Number(report.totalUsed).toLocaleString()}</span>
                </div>
                
                <hr className="border-gray-100" />
                
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Breakdown</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Vaccination:</span>
                    <span className="font-medium text-gray-900">৳{Number(report.vaccinationExpense).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Food Support:</span>
                    <span className="font-medium text-gray-900">৳{Number(report.foodExpense).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Medical Treatment:</span>
                    <span className="font-medium text-gray-900">৳{Number(report.treatmentExpense).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {report.pdfUrl && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <a 
                    href={report.pdfUrl}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-(--bpa-navy) font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Download size={16} /> Download Full PDF
                  </a>
                </div>
              )}
            </div>
          ))}

          {reports.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500">No reports published yet</h3>
              <p className="text-gray-400 mt-2">Check back soon for our latest financial transparency reports.</p>
            </div>
          )}
        </div>
      </div>

      <DonationCTASection
        title="Ready to Make Your Mark?"
        subtitle="Now that you've seen exactly where funds go, make a donation with full confidence. Every Taka is tracked, audited, and reported."
        theme="navy"
      />
    </div>
  );
}
