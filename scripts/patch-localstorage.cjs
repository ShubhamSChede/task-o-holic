// scripts/patch-localstorage.cjs
// Ensures a safe localStorage implementation in Node dev so Next.js dev tools
// that expect window.localStorage.getItem() don't crash the dev server.

/* eslint-disable no-undef */

try {
  const g = globalThis;

  const needsShim =
    typeof g.localStorage === 'undefined' ||
    typeof g.localStorage.getItem !== 'function' ||
    typeof g.localStorage.setItem !== 'function';

  if (needsShim) {
    const store = new Map();

    const shim = {
      getItem(key) {
        const k = String(key);
        return store.has(k) ? store.get(k) : null;
      },
      setItem(key, value) {
        store.set(String(key), String(value));
      },
      removeItem(key) {
        store.delete(String(key));
      },
      clear() {
        store.clear();
      },
      key(index) {
        const keys = Array.from(store.keys());
        return keys[index] ?? null;
      },
      get length() {
        return store.size;
      },
    };

    g.localStorage = shim;
  }
} catch {
  // Best-effort shim only; ignore if anything goes wrong
}

