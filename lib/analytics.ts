// ─── Global type augmentation ─────────────────────────────────────────────────
// Prevents TypeScript errors when calling window.gtag / window.fbq

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// ─── Internal BPA Operations Event Logging ────────────────────────────────────
async function logInternalEvent(
  type: string,
  moduleName: string,
  action: string,
  title: string,
  metadata?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;
  try {
    let visitorId = localStorage.getItem('bpa_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('bpa_visitor_id', visitorId);
    }
    let sessionId = sessionStorage.getItem('bpa_session_id');
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('bpa_session_id', sessionId);
    }

    const payload = {
      type,
      module: moduleName,
      action,
      title,
      path: window.location.pathname,
      referrer: document.referrer || 'Direct',
      device: window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop',
      sessionId,
      visitorId,
      metadata
    };

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    await fetch(`${apiBase}/public/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[BPA Analytics] Internal tracking failed silently:', err);
  }
}

// ─── Safe wrappers ────────────────────────────────────────────────────────────
// All calls are no-ops when:
//   • running on the server (typeof window === 'undefined')
//   • the script hasn't loaded yet (window.gtag / window.fbq undefined)
//   • the relevant env-var was never provided

function safeGtag(command: string, ...args: unknown[]) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(command, ...args);
}

function safeFbq(event: string, name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq(event, name, params as Record<string, unknown>);
}

// ─── Page view ────────────────────────────────────────────────────────────────

export function trackPageView(path: string) {
  safeGtag('event', 'page_view', { page_path: path });
  safeFbq('track', 'PageView');
  
  // Internal logging
  logInternalEvent('PAGE_VIEW', 'Website', 'page_view', `Visited ${path}`);
  if (path.includes('/membership')) {
    logInternalEvent('MEMBERSHIP_PAGE_VIEWED', 'Membership', 'viewed', 'Membership Page Viewed');
  }
}

// ─── Conversion: campaign registration ───────────────────────────────────────

export interface CampaignRegistrationParams {
  campaignId: string;
  campaignTitle: string;
  bookingNumber: string;
  petCount: number;
  valueBdt: number;
  isFree: boolean;
}

export function trackCampaignRegistration(params: CampaignRegistrationParams) {
  safeGtag('event', 'campaign_registration', {
    campaign_id: params.campaignId,
    campaign_title: params.campaignTitle,
    booking_number: params.bookingNumber,
    pet_count: params.petCount,
    value: params.valueBdt,
    currency: 'BDT',
    is_free: params.isFree,
  });
  if (params.isFree) {
    safeFbq('track', 'Lead', { content_name: params.campaignTitle });
  } else {
    safeFbq('track', 'InitiateCheckout', {
      value: params.valueBdt,
      currency: 'BDT',
      content_name: params.campaignTitle,
      num_items: params.petCount,
    });
  }

  // Internal log
  logInternalEvent(
    'CAMPAIGN_REGISTER_STARTED', 
    'Campaign', 
    'register_started', 
    `Campaign Registration Started: ${params.campaignTitle}`,
    { campaignId: params.campaignId, valueBdt: params.valueBdt }
  );
}

// ─── Conversion: booking confirmed ───────────────────────────────────────────

export interface BookingSuccessParams {
  bookingNumber: string;
  campaignTitle: string;
  status: string;
}

export function trackBookingSuccess(params: BookingSuccessParams) {
  safeGtag('event', 'booking_success', {
    booking_number: params.bookingNumber,
    campaign_title: params.campaignTitle,
    booking_status: params.status,
  });
  safeFbq('track', 'CompleteRegistration', {
    content_name: params.campaignTitle,
  });

  // Internal log
  logInternalEvent(
    'FORM_SUBMITTED', 
    'Campaign', 
    'booking_confirmed', 
    `Campaign Booking Confirmed: ${params.campaignTitle}`,
    { bookingNumber: params.bookingNumber, status: params.status }
  );
}

// ─── Conversion: payment completed ───────────────────────────────────────────

export interface PaymentSuccessParams {
  txn?: string;
  value?: number;
  currency?: string;
  itemName?: string;
}

export function trackPaymentSuccess(params: PaymentSuccessParams) {
  const currency = params.currency ?? 'BDT';
  const value = params.value ?? 0;
  safeGtag('event', 'purchase', {
    transaction_id: params.txn ?? '',
    value,
    currency,
    items: [{ item_name: params.itemName ?? 'BPA Payment', quantity: 1, price: value }],
  });
  safeFbq('track', 'Purchase', { value, currency, content_name: params.itemName ?? 'BPA Payment' });
  if (ADS_ID) {
    safeGtag('event', 'conversion', {
      send_to: `${ADS_ID}/purchase`,
      value,
      currency,
      transaction_id: params.txn ?? '',
    });
  }

  // Internal log
  logInternalEvent(
    'FORM_SUBMITTED', 
    'Payment', 
    'purchase_completed', 
    `Payment Success: ${params.itemName || 'BPA Payment'}`,
    { txn: params.txn, value, currency }
  );
}

// ─── Conversion: contact form ─────────────────────────────────────────────────

export function trackContactSubmit() {
  safeGtag('event', 'contact_form_submit', { event_category: 'engagement' });
  safeFbq('track', 'Contact');

  // Internal log
  logInternalEvent('CONTACT_FORM_SUBMITTED', 'Contact', 'inquiry_submitted', 'Contact Inquiry Form Submitted');
}

// ─── Conversion: membership application ──────────────────────────────────────

export function trackMembershipSubmit(membershipType?: string) {
  safeGtag('event', 'membership_submit', {
    membership_type: membershipType ?? '',
    event_category: 'conversion',
  });
  safeFbq('track', 'Lead', { content_name: 'Membership Application' });

  // Internal log
  logInternalEvent(
    'FORM_SUBMITTED', 
    'Membership', 
    'application_submitted', 
    `Membership Applied: ${membershipType || 'Standard'}`
  );
}

// ─── Conversion: community care contribution ──────────────────────────────────

export function trackContributionSubmit(amountBdt: number) {
  safeGtag('event', 'contribution_submit', {
    value: amountBdt,
    currency: 'BDT',
    event_category: 'conversion',
  });
  safeFbq('track', 'Donate', { value: amountBdt, currency: 'BDT' });

  // Internal log
  logInternalEvent(
    'FORM_SUBMITTED', 
    'Donation', 
    'donation_completed', 
    `Donation Completed: ৳${amountBdt}`,
    { amountBdt }
  );
}

// ─── Start trackers ───────────────────────────────────────────────────────────

export function trackMembershipPurchaseStart() {
  logInternalEvent('MEMBERSHIP_PURCHASE_STARTED', 'Membership', 'purchase_started', 'Membership Purchase Form Initiated');
}

export function trackDonationStart() {
  logInternalEvent('DONATION_STARTED', 'Donation', 'donation_started', 'Donation Payment Form Initiated');
}

export function trackPetCensusStart() {
  logInternalEvent('PET_CENSUS_STARTED', 'Pet Census', 'census_started', 'Pet Census Submission Form Initiated');
}

export function trackCampaignRegisterStart(title: string) {
  logInternalEvent('CAMPAIGN_REGISTER_STARTED', 'Campaign', 'register_started', `Campaign Register Form Initiated: ${title}`);
}

// ─── Generic helpers ──────────────────────────────────────────────────────────
// These are lower-level primitives for one-off events not covered above.

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  safeGtag('event', eventName, params ?? {});
}

export function trackLead(contentName?: string) {
  safeGtag('event', 'generate_lead', { content_name: contentName ?? '' });
  safeFbq('track', 'Lead', { content_name: contentName ?? '' });
  if (ADS_ID) safeGtag('event', 'conversion', { send_to: `${ADS_ID}/lead` });
}

export function trackRegistration(params: CampaignRegistrationParams) {
  trackCampaignRegistration(params);
}

export function trackPurchase(params: { txn?: string; value?: number; currency?: string }) {
  safeGtag('event', 'purchase', {
    transaction_id: params.txn ?? '',
    value: params.value ?? 0,
    currency: params.currency ?? 'BDT',
  });
  safeFbq('track', 'Purchase', {
    value: params.value ?? 0,
    currency: params.currency ?? 'BDT',
  });
  if (ADS_ID) {
    safeGtag('event', 'conversion', {
      send_to: `${ADS_ID}/purchase`,
      value: params.value ?? 0,
      currency: params.currency ?? 'BDT',
      transaction_id: params.txn ?? '',
    });
  }
}

export function trackContact() {
  trackContactSubmit();
}
