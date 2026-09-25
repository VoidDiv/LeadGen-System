"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { addLead, deleteLead, subscribeLeads, updateLead } from "@/lib/leads";
import type { Lead, LeadInput } from "@/types";

/** Live list of the signed-in admin's leads, plus add / update / remove. */
export function useLeads() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeLeads(
      uid,
      (data) => {
        setLeads(data);
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
  }, [uid]);

  const add = useCallback((input: LeadInput) => addLead(uid!, input), [uid]);
  const update = useCallback((id: string, patch: Partial<LeadInput>) => updateLead(uid!, id, patch), [uid]);
  const remove = useCallback((id: string) => deleteLead(uid!, id), [uid]);

  return { leads, loading, error, add, update, remove };
}
