import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtmlLib.defaults.allowedTags,
  "img",
  "h1",
  "h2",
  "h3",
  "h4",
  "span",
  "div",
  "figure",
  "figcaption",
  "u",
  "s",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
  "*": ["class"],
};

/**
 * Isomorphic HTML sanitizer safe for Server Components and Client Components.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}
