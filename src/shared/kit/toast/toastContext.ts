import { createContext } from "react";

export type ToastTone = "success" | "info" | "warning" | "error";

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it lifts away. Defaults to 2400; errors to 5000. */
  duration?: number;
}

export interface ToastRecord {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration: number;
}

export interface ToastApi {
  show: (input: ToastInput) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
