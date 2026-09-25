"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import ContentFormModal from "@/components/content/ContentFormModal";
import ContentTable from "@/components/content/ContentTable";
import { useContent } from "@/hooks/useContent";
import type { ContentItem, ContentStatus } from "@/types";

export default function ContentPage() {
  const { items, loading, error, add, update, remove } = useContent();
  const [form, setForm] = useState<{ item: ContentItem | null } | null>(null);
  const [toDelete, setToDelete] = useState<ContentItem | null>(null);

  async function changeStatus(item: ContentItem, status: ContentStatus) {
    try {
      await update(item.id, { status });
    } catch {
      window.alert("Couldn't change the status. Check your connection and try again.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Content"
        subtitle="Plan posts across LinkedIn, Facebook, Instagram, and TikTok."
        action={
          <Button onClick={() => setForm({ item: null })}>
            <Plus size={16} /> Add content
          </Button>
        }
      />

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&apos;t load content: {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-slate-600">
          Nothing planned yet. Use Add content to capture your first idea.
        </div>
      ) : (
        <ContentTable items={items} onEdit={(item) => setForm({ item })} onDelete={setToDelete} onStatusChange={changeStatus} />
      )}

      {form && (
        <ContentFormModal
          key={form.item?.id ?? "new"}
          item={form.item}
          onClose={() => setForm(null)}
          onSave={async (input) => {
            if (form.item) await update(form.item.id, input);
            else await add(input);
            setForm(null);
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete content"
          message={`Delete "${toDelete.title}"? This can't be undone.`}
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await remove(toDelete.id);
            setToDelete(null);
          }}
        />
      )}
    </div>
  );
}
