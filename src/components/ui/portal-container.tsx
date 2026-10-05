"use client";

import * as React from "react";

/**
 * Lets nested overlays (Popover, etc.) portal INTO their parent overlay
 * (e.g. a vaul Drawer) instead of document.body.
 *
 * On iOS Safari, an input rendered in a portal outside the drawer's DOM
 * subtree is treated as "outside" by vaul / Radix focus + scroll handling,
 * which makes it impossible to tap/focus.
 */
const PortalContainerContext = React.createContext<HTMLElement | null>(null);

export const PortalContainerProvider = PortalContainerContext.Provider;

export function usePortalContainer() {
  return React.useContext(PortalContainerContext);
}
