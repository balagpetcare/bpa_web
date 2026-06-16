import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Injects the GTM head snippet (via next/script afterInteractive)
 * and the required <noscript> iframe that must sit inside <body>.
 *
 * NOTE: If GTM is used to fire GA4 tags, set NEXT_PUBLIC_GA_ID to an empty
 * string to avoid double-counting pageviews.
 */
export default function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <>
      {/* GTM dataLayer push + loader script */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* Fallback noscript iframe — must be first element inside <body> */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager (noscript)"
        />
      </noscript>
    </>
  );
}
