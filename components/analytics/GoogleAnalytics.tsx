import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Loads the GA4 gtag.js snippet globally.
 *
 * Route-change pageviews are NOT fired here — that is handled by
 * AnalyticsPageView (a Client Component using usePathname).
 *
 * If you manage GA4 through Google Tag Manager, leave NEXT_PUBLIC_GA_ID
 * unset (or empty) to avoid double-counting pageviews.
 */
export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>
    </>
  );
}
