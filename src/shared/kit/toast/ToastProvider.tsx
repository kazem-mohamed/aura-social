import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastApi, type ToastInput, type ToastRecord } from "./toastContext";
import { ToastShelf } from "./ToastShelf";

/** Holds up to three toasts; older ones leave as new ones arrive. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    const tone = input.tone ?? "success";
    setToasts((list) => [
      ...list.slice(-2),
      {
        id,
        tone,
        title: input.title,
        description: input.description,
        action: input.action,
        duration: input.duration ?? (tone === "error" ? 5000 : 2400),
      },
    ]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastShelf toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
