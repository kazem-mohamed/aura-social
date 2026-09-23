import { createContext } from "react";

export interface ComposerApi {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

export const ComposerContext = createContext<ComposerApi | null>(null);
