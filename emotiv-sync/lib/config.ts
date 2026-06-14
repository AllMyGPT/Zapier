/**
 * The app is mounted under emotiv.es/team so it can coexist with the sales
 * site and the accounting app on the same domain. Keep this in sync with
 * `basePath` in next.config.ts.
 */
export const BASE_PATH = '/team'

/** Absolute URL within the app, including origin + base path (client-side). */
export function appUrl(path: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${BASE_PATH}${path}`
}
