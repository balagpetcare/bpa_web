'use client';

import { useEffect } from 'react';
import { trackPaymentSuccess } from '@/lib/analytics';

interface Props {
  txn?: string;
  value?: number;
  currency?: string;
  itemName?: string;
}

export default function PaymentSuccessEvent({ txn, value, currency, itemName }: Props) {
  useEffect(() => {
    trackPaymentSuccess({ txn, value, currency, itemName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
