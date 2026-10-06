/* ============================================================
   FILE: lib/leads.ts   (REPLACE whole file)
   CHANGED: toLead also reads the new fields (state, profession,
   date contacted, response, status-changed time). A lead saved
   before these existed simply gets empty values, nothing breaks.
   ============================================================ */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lead, LeadInput } from "@/types";

const leadsCol = (uid: string) => collection(db(), "users", uid, "leads");
const leadDoc = (uid: string, id: string) => doc(db(), "users", uid, "leads", id);

function toLead(d: QueryDocumentSnapshot<DocumentData>): Lead {
  const x = d.data({ serverTimestamps: "estimate" });
  return {
    id: d.id,
    name: x.name ?? "",
    platform: x.platform ?? "LinkedIn",
    profileUrl: x.profileUrl ?? "",
    category: x.category ?? "",
    state: x.state ?? "",
    profession: x.profession ?? "",
    status: x.status ?? "New",
    dateContacted: x.dateContacted ?? null,
    response: x.response ?? "",
    notes: x.notes ?? "",
    followUpDate: x.followUpDate ?? null,
    followUpDone: Boolean(x.followUpDone),
    createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
    statusChangedAt: typeof x.statusChangedAt === "number" ? x.statusChangedAt : null,
  };
}

export function subscribeLeads(uid: string, onData: (leads: Lead[]) => void, onError: (e: Error) => void) {
  const q = query(leadsCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => onData(snap.docs.map(toLead)), onError);
}

export async function addLead(uid: string, input: LeadInput): Promise<void> {
  await addDoc(leadsCol(uid), { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateLead(uid: string, id: string, patch: Partial<LeadInput>): Promise<void> {
  await updateDoc(leadDoc(uid, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteLead(uid: string, id: string): Promise<void> {
  await deleteDoc(leadDoc(uid, id));
}