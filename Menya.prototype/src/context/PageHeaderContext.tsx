import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * The shared page header lives in AppShell. Views no longer render their own
 * <h1> block — the header owns the title (from AppShell's route map), plus a
 * subtitle slot and an actions slot that each view fills via the components
 * below. Slots are plain DOM nodes; children portal into them so view state and
 * handlers keep working normally.
 */
type PageHeaderSlots = { subtitleEl: HTMLElement | null; actionsEl: HTMLElement | null };

export const PageHeaderContext = createContext<PageHeaderSlots>({
  subtitleEl: null,
  actionsEl: null,
});

/** Render a one-line subtitle under the page title in the shared header. */
export function PageHeaderSubtitle({ children }: { children: ReactNode }) {
  const { subtitleEl } = useContext(PageHeaderContext);
  return subtitleEl ? createPortal(children, subtitleEl) : null;
}

/** Render page-level action buttons on the right of the shared header. */
export function PageHeaderActions({ children }: { children: ReactNode }) {
  const { actionsEl } = useContext(PageHeaderContext);
  return actionsEl ? createPortal(children, actionsEl) : null;
}
