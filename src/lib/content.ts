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
import type { ContentInput, ContentItem } from "@/types";

const contentCol = (uid: string) => collection(db(), "users", uid, "content");
const contentDoc = (uid: string, id: string) => doc(db(), "users", uid, "content", id);

function toItem(d: QueryDocumentSnapshot<DocumentData>): ContentItem {
  const x = d.data({ serverTimestamps: "estimate" });
  return {
    id: d.id,
    title: x.title ?? "",
    platform: x.platform ?? "LinkedIn",
    contentType: x.contentType ?? "Post",
    status: x.status ?? "Idea",
    scheduledDate: x.scheduledDate ?? null,
    notes: x.notes ?? "",
    createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export function subscribeContent(uid: string, onData: (items: ContentItem[]) => void, onError: (e: Error) => void) {
  const q = query(contentCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => onData(snap.docs.map(toItem)), onError);
}

export async function addContent(uid: string, input: ContentInput): Promise<void> {
  await addDoc(contentCol(uid), { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateContent(uid: string, id: string, patch: Partial<ContentInput>): Promise<void> {
  await updateDoc(contentDoc(uid, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteContent(uid: string, id: string): Promise<void> {
  await deleteDoc(contentDoc(uid, id));
}
