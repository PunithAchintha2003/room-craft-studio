/**
 * Resolves asset URLs (thumbnails, uploads) so they work in production.
 * - Relative paths (/uploads/...) are prefixed with the API base (HTTPS in production).
 * - localhost URLs from the API are rewritten to the current API origin to avoid mixed content.
 */
export function getAssetUrl(url: string | undefined | null): string {
  if (url == null || url === '') return '';
  if (url.startsWith('data:')) return url;

  const apiUrl = (import.meta as { env: Record<string, string> }).env['VITE_API_URL'] || 'http://localhost:5001/api';
  const base = apiUrl.replace(/\/api\/?$/, '');

  if (url.startsWith('/')) return `${base}${url}`;

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${base}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // not a valid URL, return as-is
  }
  return url;
}
