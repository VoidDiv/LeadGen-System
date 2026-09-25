"use client";

import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } catch {
              setBusy(false);
              window.alert("That didn't work. Check your connection and try again.");
            }
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
