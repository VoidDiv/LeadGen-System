/* ============================================================
   FILE: lib/utils.ts   (REPLACE whole file)
   ADDED: normalizeProfileUrl (to spot a lead that is already saved),
   normalizeHashtags and buildPostText (for the content plan).
   safeUrl is unchanged.
   ============================================================ */

/** Makes a pasted profile link safe to open: adds https:// when missing. */
export function safeUrl(url: string): string {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

/**
 * The part of a profile link that says WHO it is, so the same person is recognised however the link was pasted:
 *   "https://www.linkedin.com/in/john-doe/?utm=x"  and  "linkedin.com/in/john-doe"  -> "linkedin.com/in/john-doe"
 * (Facebook's profile.php keeps its ?id=, because the id is the person.) Empty text gives "".
 */
export function normalizeProfileUrl(url: string): string {
  let u = url.trim().toLowerCase();
  if (!u) return "";
  u = u.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/^(www|m|mobile)\./, "");
  u = u.split("#")[0];
  const [path, query = ""] = u.split("?");
  let out = path.replace(/\/+$/, "");
  if (/profile\.php$/.test(out)) {
    const id = query.match(/(?:^|&)id=(\d+)/);
    if (id) out += `?id=${id[1]}`;
  }
  return out;
}

/** "retirement, #Veterans  tax" -> "#retirement #Veterans #tax" (no repeats, no symbols). */
export function normalizeHashtags(input: string): string {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of input.split(/[\s,]+/)) {
    const word = raw.replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
    if (!word || seen.has(word.toLowerCase())) continue;
    seen.add(word.toLowerCase());
    tags.push(`#${word}`);
  }
  return tags.join(" ");
}

/** The text to paste into a social-media post: caption, then the call to action, then the hashtags. */
export function buildPostText(item: { caption: string; cta: string; hashtags: string }): string {
  return [item.caption, item.cta, item.hashtags]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n\n");
}