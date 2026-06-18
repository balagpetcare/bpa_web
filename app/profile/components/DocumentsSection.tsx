import Link from 'next/link';
import { FileText, Download, CreditCard, Award, Receipt, Syringe, ShieldCheck, ExternalLink } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardDocument, DocumentType } from '../types';

interface Props {
  documents: DashboardDocument[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DOC_ICONS: Record<DocumentType, React.ReactNode> = {
  membership_card: <CreditCard className="w-4 h-4" />,
  vaccination_certificate: <Syringe className="w-4 h-4" />,
  payment_receipt: <Receipt className="w-4 h-4" />,
  validation_slip: <Award className="w-4 h-4" />,
  care_partner_card: <ShieldCheck className="w-4 h-4" />,
};

const DOC_COLORS: Record<DocumentType, string> = {
  membership_card: 'bg-(--bpa-green-light) text-(--bpa-green)',
  vaccination_certificate: 'bg-blue-50 text-blue-600',
  payment_receipt: 'bg-amber-50 text-amber-600',
  validation_slip: 'bg-purple-50 text-purple-600',
  care_partner_card: 'bg-(--bpa-navy)/10 text-(--bpa-navy)',
};

function DocumentRow({ doc }: { doc: DashboardDocument }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${DOC_COLORS[doc.type]}`}>
        {DOC_ICONS[doc.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--bpa-navy) truncate">{doc.title}</p>
        <p className="text-xs text-gray-400">{formatDate(doc.issuedAt)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {doc.verifyUrl && (
          <Link
            href={doc.verifyUrl}
            className="p-1.5 rounded-lg bg-(--bpa-navy)/10 text-(--bpa-navy) hover:opacity-80 transition-colors"
            title="Verify"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
        <button
          disabled={!doc.downloadUrl}
          className={`p-1.5 rounded-lg transition-colors ${
            doc.downloadUrl
              ? 'bg-(--bpa-green-light) text-(--bpa-green) hover:opacity-80'
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          title={doc.downloadUrl ? 'Download' : 'Coming soon'}
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DocumentsSection({ documents }: Props) {
  return (
    <SectionCard
      title="My Documents"
      subtitle="Certificates, cards & receipts"
      icon={<FileText className="w-4 h-4" />}
    >
      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No documents yet"
          description="Your membership cards, certificates, and receipts will appear here after they are issued."
        />
      ) : (
        <div>
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
