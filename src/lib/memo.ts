import "server-only";

/**
 * Tiny in-isolate cache for hot, rarely-changing reads (settings, content
 * overrides, team, laws). A Worker isolate serves many requests, so this
 * removes most D1 round trips from public pages.
 *
 * Writes made through the admin panel call `forgetAll()` so the isolate that
 * handled the edit shows it at once; other isolates pick it up within `ttlMs`.
 */
const store = new Map<string, { expires: number; value: Promise<unknown> }>();

export function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  const value = load();
  store.set(key, { expires: Date.now() + ttlMs, value });
  // Never cache a failure.
  value.catch(() => store.delete(key));
  return value;
}

export function forgetAll(): void {
  store.clear();
}
