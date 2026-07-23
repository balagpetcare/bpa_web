const DEV_REMOTE_PATTERNS = [
  { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: '192.168.10.111', port: '4000', pathname: '/uploads/**' },
  { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
];

const PLACEHOLDER_PATTERN = { protocol: 'https', hostname: 'placehold.co', pathname: '/**' };
const UNSPLASH_PATTERN = { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' };
const DEV_HOSTNAME_PATTERN = /^192\.168\.\d{1,3}\.\d{1,3}$/;

const DEFAULT_MAP_TILE_ORIGINS = [
  'https://a.tile.openstreetmap.org',
  'https://b.tile.openstreetmap.org',
  'https://c.tile.openstreetmap.org',
];
// Leaflet's default marker icon images ship from this CDN — see
// components/clinics/ClinicMap.tsx. Fixed (not env-driven) since it's a
// package-icon asset host, not a swappable map data provider.
const LEAFLET_ICON_ORIGIN = 'https://unpkg.com';

/**
 * Map tile origins allowed by the CSP — environment-driven so switching
 * `NEXT_PUBLIC_MAP_TILE_URL` to a different provider (e.g. a paid MapTiler/
 * Mapbox raster endpoint) never requires a CSP code change, only a new env
 * value. Falls back to the public OpenStreetMap tile servers.
 */
export function getAllowedMapTileOrigins(env = process.env) {
  const raw = env.NEXT_PUBLIC_MAP_TILE_URL;
  if (!raw) return DEFAULT_MAP_TILE_ORIGINS;
  // `{s}` is Leaflet's own subdomain-load-balancing placeholder (a/b/c...);
  // CSP's `*` wildcard is the equivalent way to allow any subdomain.
  const configured = normalizeOrigin(raw.includes('{s}') ? raw.replace('{s}', '*') : raw);
  return configured ? [configured] : DEFAULT_MAP_TILE_ORIGINS;
}

function normalizeOrigin(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return null;
  }
}

function apiOriginFromBase(raw) {
  if (!raw) return null;
  return normalizeOrigin(String(raw).replace(/\/api\/v1\/?$/, ''));
}

function patternFromUrl(raw, pathname = '/**') {
  const origin = normalizeOrigin(raw);
  if (!origin) return null;
  const url = new URL(origin);
  return {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port || undefined,
    pathname,
  };
}

function uniquePatterns(patterns) {
  const seen = new Set();
  return patterns.filter((pattern) => {
    if (!pattern) return false;
    const key = JSON.stringify(pattern);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAllowedMediaOrigins(env = process.env) {
  const origins = new Set([
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'http://192.168.10.111:4000',
  ]);

  const candidates = [
    apiOriginFromBase(env.NEXT_PUBLIC_API_BASE_URL),
    apiOriginFromBase(env.NEXT_PUBLIC_API_URL),
    normalizeOrigin(env.NEXT_PUBLIC_MEDIA_CDN_URL),
    normalizeOrigin(env.NEXT_PUBLIC_CDN_URL),
    normalizeOrigin(env.NEXT_PUBLIC_B2_PUBLIC_URL),
    normalizeOrigin(env.NEXT_PUBLIC_BACKBLAZE_B2_URL),
  ];

  for (const origin of candidates) {
    if (origin) origins.add(origin);
  }

  return Array.from(origins);
}

export function getRemotePatterns(env = process.env) {
  const envPatterns = uniquePatterns(
    [
      patternFromUrl(apiOriginFromBase(env.NEXT_PUBLIC_API_BASE_URL) ?? apiOriginFromBase(env.NEXT_PUBLIC_API_URL), '/uploads/**'),
      patternFromUrl(env.NEXT_PUBLIC_MEDIA_CDN_URL),
      patternFromUrl(env.NEXT_PUBLIC_CDN_URL),
      patternFromUrl(env.NEXT_PUBLIC_B2_PUBLIC_URL),
      patternFromUrl(env.NEXT_PUBLIC_BACKBLAZE_B2_URL),
    ],
  );

  return uniquePatterns([...DEV_REMOTE_PATTERNS, ...envPatterns, PLACEHOLDER_PATTERN, UNSPLASH_PATTERN]);
}

export function getContentSecurityPolicy(env = process.env) {
  const isDevelopment = env.NODE_ENV === 'development';
  const mediaOrigins = getAllowedMediaOrigins(env)
    .filter(Boolean)
    .filter((origin) => isDevelopment || !DEV_HOSTNAME_PATTERN.test(new URL(origin).hostname));

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
    'https://www.googletagmanager.com',
  ];

  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ];

  const connectSrc = [
    "'self'",
    ...mediaOrigins,
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
    ...(isDevelopment ? ['ws:', 'wss:'] : []),
  ];

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    ...mediaOrigins,
    'https://images.unsplash.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://www.facebook.com',
    ...getAllowedMapTileOrigins(env),
    LEAFLET_ICON_ORIGIN,
  ];

  const mediaSrc = [
    "'self'",
    'data:',
    'blob:',
    ...mediaOrigins,
  ];

  const fontSrc = [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ];

  const frameSrc = [
    "'self'",
    'https://www.googletagmanager.com',
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
  ];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `font-src ${fontSrc.join(' ')}`,
    "worker-src 'self' blob:",
    `media-src ${mediaSrc.join(' ')}`,
    `frame-src ${frameSrc.join(' ')}`,
  ].join('; ');
}
