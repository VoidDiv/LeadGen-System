  "use client";

  import { useEffect, type ReactNode } from "react";
  import { X } from "lucide-react";

  interface Props {
    title: string;
    onClose: () => void;
    children: ReactNode;
  }

  export default function Modal({ title, onClose, children }: Props) {
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white sm:max-w-lg sm:rounded-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    );
  }
