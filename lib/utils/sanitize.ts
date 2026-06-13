import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a',
  'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'figure', 'figcaption',
  'div', 'span',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'width', 'height', 'class', 'loading'],
  'th': ['colspan', 'rowspan', 'scope'],
  'td': ['colspan', 'rowspan'],
  '*': ['class'],
};

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  // Force rel="noopener noreferrer" on all external links
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs['href'] ?? '';
      const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
      };
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  // Strip style attributes that can carry JS (expression(), behavior:)
  allowedStyles: {},
};

/**
 * Sanitizes CMS-generated HTML using a strict allowlist.
 * Safe to use server-side in Next.js RSC context.
 */
export function sanitizeCmsHtml(dirty: string): string {
  return sanitizeHtml(dirty, SANITIZE_OPTIONS);
}
