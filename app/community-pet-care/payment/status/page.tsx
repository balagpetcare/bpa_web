import type { Metadata } from 'next';
import PaymentStatusView from '../components/PaymentStatusView';

export const metadata: Metadata = {
  title: 'Care Partner Card — Payment Status',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function PaymentStatusPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  return (
    <section className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-12">
      <PaymentStatusView reference={ref || ''} initialType="status" />
    </section>
  );
}
