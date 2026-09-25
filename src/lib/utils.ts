/** Makes a pasted profile link safe to open: adds https:// when missing. */
export function safeUrl(url: string): string {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
