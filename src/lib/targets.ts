/* ============================================================
   FILE: lib/targets.ts   (NEW)
   WHO we look for and WHERE: the target states and the target
   lead categories, written once, so the forms, filters, dashboard
   and reports all use the same lists.
   To add a state or a category, add it below. Nothing else changes.
   ============================================================ */

export const TARGET_STATES = [
  "Florida",
  "Georgia",
  "Ohio",
  "Virginia",
  "Maryland",
  "Texas",
  "Alabama",
  "Idaho",
  "California",
] as const;

/** For a lead outside the target states. */
export const STATE_OTHER = "Other";
/** The label used in reports for a lead whose state was never filled in. */
export const STATE_NOT_SET = "Not set";

export interface CategoryGroup {
  group: string;
  /** "prospect" = a person to reach; "partner" = a referral / networking partner */
  kind: "prospect" | "partner";
  items: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: "Retirement & Financial Education",
    kind: "prospect",
    items: [
      "Pre-retirees",
      "People approaching retirement",
      "Mid-career professionals",
      "People interested in retirement planning",
      "People interested in financial education",
      "People going through career transitions",
    ],
  },
  {
    group: "Military / Armed Forces",
    kind: "prospect",
    items: [
      "Veterans",
      "Active-duty military",
      "Military retirees",
      "Transitioning service members",
      "Military spouses",
      "Military families",
      "Reservists",
      "National Guard members",
      "Former military personnel",
    ],
  },
  {
    group: "Professionals",
    kind: "prospect",
    items: [
      "Executives",
      "CEOs",
      "CFOs",
      "COOs",
      "Directors",
      "Managers",
      "Physicians",
      "Dentists",
      "Pharmacists",
      "Engineers",
      "Attorneys",
      "IT professionals",
      "Software developers",
      "Consultants",
      "Corporate professionals",
      "High-income professionals",
    ],
  },
  {
    group: "Government / Public Service",
    kind: "prospect",
    items: [
      "Federal employees",
      "Government employees",
      "Government contractors",
      "Police officers",
      "Sheriffs",
      "Detectives",
      "State troopers",
      "Firefighters",
      "Fire chiefs",
      "First responders",
    ],
  },
  {
    group: "Education",
    kind: "prospect",
    items: [
      "Teachers",
      "Professors",
      "School administrators",
      "Principals",
      "Superintendents",
      "College/university employees",
    ],
  },
  {
    group: "Business / Entrepreneurship",
    kind: "prospect",
    items: ["Business owners", "Entrepreneurs", "Startup founders", "Agency owners", "Independent professionals"],
  },
  {
    group: "Referral / Networking Partners",
    kind: "partner",
    items: [
      "CPAs",
      "Accountants",
      "Tax professionals",
      "Tax advisors",
      "Estate-planning attorneys",
      "Insurance professionals",
      "Insurance brokers",
      "Mortgage brokers",
      "Loan officers",
      "HR managers",
      "HR directors",
      "Benefits managers",
      "Recruiters",
      "Career coaches",
      "Business consultants",
      "Financial educators",
      "Community leaders",
      "Nonprofit leaders",
    ],
  },
];

export const GROUP_OTHER = "Other";

/** Every category, once (for the suggestion list in the form). */
export const ALL_CATEGORIES: string[] = Array.from(new Set(CATEGORY_GROUPS.flatMap((g) => g.items)));

/* Leads saved before this list existed used these short names. They still land in the right group. */
const LEGACY: Record<string, string> = {
  "active military": "Military / Armed Forces",
  veteran: "Military / Armed Forces",
  "military spouse": "Military / Armed Forces",
  reservist: "Military / Armed Forces",
};

const LOOKUP = new Map<string, string>();
for (const g of CATEGORY_GROUPS) for (const item of g.items) if (!LOOKUP.has(item.toLowerCase())) LOOKUP.set(item.toLowerCase(), g.group);

/** Which group a category belongs to ("Other" when it is not on the list, or empty). */
export function groupOfCategory(category: string): string {
  const key = category.trim().toLowerCase();
  if (!key) return GROUP_OTHER;
  return LOOKUP.get(key) ?? LEGACY[key] ?? GROUP_OTHER;
}

/** The state to count a lead under in reports. */
export function stateBucket(state: string): string {
  const s = state.trim();
  if (!s) return STATE_NOT_SET;
  return (TARGET_STATES as readonly string[]).includes(s) ? s : STATE_OTHER;
}