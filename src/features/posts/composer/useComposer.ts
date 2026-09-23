import { useContext } from "react";
import { ComposerContext, type ComposerApi } from "./composerContext";

/** Open the new-post sheet from anywhere in the member shell. */
export function useComposer(): ComposerApi {
  const api = useContext(ComposerContext);
  if (!api) throw new Error("useComposer must be used inside <ComposerProvider>.");
  return api;
}
