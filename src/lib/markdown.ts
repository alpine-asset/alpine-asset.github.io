/*
 * Tiny inline-Markdown renderer for the report lead paragraph.
 *
 * It supports exactly one mark — **bold** — and is used with Astro's `set:html`,
 * so escaping is a security boundary, not just cosmetics: the raw `&` and `<`
 * are escaped BEFORE the bold replacement runs, so author text can never inject
 * markup. Input today is trusted (report frontmatter), but this is exactly the
 * code most worth a unit test, since a regression in the escape order would be
 * an XSS-shaped bug. See tests/markdown.test.ts.
 */

/** Escape HTML-significant characters, then render `**bold**` → `<strong>`. */
export function renderInlineBold(md: string): string {
  return md
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
