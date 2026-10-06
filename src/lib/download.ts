/* ============================================================
   FILE: lib/download.ts   (NEW)
   Saves a piece of text as a file on the computer (used for the CSV export).
   ============================================================ */

export function downloadTextFile(filename: string, text: string, mime = "text/csv;charset=utf-8"): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}