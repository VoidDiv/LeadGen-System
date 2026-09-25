"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { addContent, deleteContent, subscribeContent, updateContent } from "@/lib/content";
import type { ContentInput, ContentItem } from "@/types";

/** Live list of the signed-in admin's content plan, plus add / update / remove. */
export function useContent() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeContent(
      uid,
      (data) => {
        setItems(data);
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
  }, [uid]);

  const add = useCallback((input: ContentInput) => addContent(uid!, input), [uid]);
  const update = useCallback((id: string, patch: Partial<ContentInput>) => updateContent(uid!, id, patch), [uid]);
  const remove = useCallback((id: string) => deleteContent(uid!, id), [uid]);

  return { items, loading, error, add, update, remove };
}
