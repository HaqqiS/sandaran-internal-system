import * as React from "react";

const MOBILE_BREAKPOINT = 768;
// Phones in landscape are wider than 768px but very short. Treat them as
// mobile too, otherwise rotating swaps Drawer <-> Dialog and remounts the
// form (losing typed text on iOS).
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px), (pointer: coarse) and (max-height: 500px)`;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches, // client
    () => false, // server
  );
}
