/* ============================================================
   FILE: app/reports/page.tsx   (NEW)   - the Reports page  (URL: /reports)
   Weekly and monthly reports: leads gathered, prospects contacted, responses,
   follow-ups, appointments and content, by platform, category group and state.
   You can copy the report as text (to paste into an email or message), download
   the leads of the period as a CSV file, or print it / save it as a PDF.
   Your "Observations" are kept on this device for each period.
   ============================================================ */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ReportView from "@/components/reports/ReportView";
import { useContent } from "@/hooks/useContent";
import { useLeads } from "@/hooks/useLeads";
import { msToISO, todayISO } from "@/lib/dates";
import { downloadTextFile } from "@/lib/download";
import { PERIODS, computeReport, customRange, inRange, leadsToCSV, rangeFor, reportToText, type PeriodId } from "@/lib/reports";

const notesKey = (from: string, to: string) => `gfi-report-notes:${from}:${to}`;

export default function ReportsPage() {
  const { leads, loading: loadingLeads, error: leadsError } = useLeads();
  const { items, loading: loadingContent, error: contentError } = useContent();

  const today = todayISO();
  const [period, setPeriod] = useState<PeriodId>("this-week");
  const [from, setFrom] = useState(() => rangeFor("this-month", todayISO()).from);
  const [to, setTo] = useState(() => todayISO());
  // The observations of ONE period. The text carries the period it belongs to, so a period never shows another period's notes
  const [draft, setDraft] = useState<{ key: string; text: string }>({ key: "", text: "" });
  const [copied, setCopied] = useState(false);

  const range = useMemo(
    () => (period === "custom" ? customRange(from || today, to || today) : rangeFor(period, today)),
    [period, from, to, today],
  );
  const report = useMemo(() => computeReport(leads, items, range, today), [leads, items, range, today]);

  const key = notesKey(range.from, range.to);
  const loaded = draft.key === key;
  const notes = loaded ? draft.text : "";

  // The observations belong to the period: they come back when you open the same period again
  useEffect(() => {
    try {
      setDraft({ key, text: localStorage.getItem(key) ?? "" });
    } catch {
      setDraft({ key, text: "" });
    }
  }, [key]);

  function changeNotes(value: string) {
    setDraft({ key, text: value });
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      /* private mode: the notes still work, they are just not kept */
    }
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportToText(report, notes));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.alert("Couldn't copy the report. Use Print and save it as a PDF instead.");
    }
  }

  const gathered = useMemo(() => leads.filter((l) => inRange(msToISO(l.createdAt), range)), [leads, range]);

  if (loadingLeads || loadingContent) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Weekly and monthly summaries. Copy them, download the leads, or print."
        action={
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={copyReport} data-testid="copy-report">
              <Copy size={16} /> {copied ? "Copied" : "Copy report"}
            </Button>
            <Button
              variant="secondary"
              disabled={gathered.length === 0}
              onClick={() => downloadTextFile(`leads-${range.from}_to_${range.to}.csv`, leadsToCSV(gathered, today))}
              title="The leads added in this period, as a CSV file"
              data-testid="download-csv"
            >
              <Download size={16} /> Leads CSV
            </Button>
            <Button onClick={() => window.print()}>
              <Printer size={16} /> Print / PDF
            </Button>
          </div>
        }
      />

      {(leadsError || contentError) && (
        <p role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&apos;t load everything: {leadsError ?? contentError}
        </p>
      )}

      <div className="no-print mb-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Report period">
        {[...PERIODS, { id: "custom" as const, label: "Custom dates" }].map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              period === p.id ? "bg-brand-800 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-2 pl-1">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="input w-40" />
            <span className="text-sm text-slate-500">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="input w-40" />
          </div>
        )}
      </div>

      <ReportView report={report} />

      <section className="panel mt-6 break-inside-avoid p-5">
        <h3 className="text-base font-semibold text-slate-900">Observations</h3>
        <p className="no-print mt-1 text-xs text-slate-500">
          Anything worth remembering this period. It is included when you copy or print the report, and kept on this device.
        </p>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => changeNotes(e.target.value)}
          aria-label="Observations"
          readOnly={!loaded}
          placeholder="e.g. LinkedIn replies were strongest on Tuesday posts."
          className="input no-print mt-3"
        />
        {/* the printed page shows the notes as plain text */}
        <p className="mt-3 hidden whitespace-pre-wrap text-sm text-slate-800 print:block">{notes || "None."}</p>
      </section>
    </div>
  );
}