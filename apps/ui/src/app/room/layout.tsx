"use client";

import { useEffect, useState } from "react";

const RELOAD_FLAG = "cocursor:isolation-reload";

/**
 * WebContainer needs a cross-origin isolated page, which only the COOP/COEP
 * headers on a full document load can give. Reaching /room by client-side
 * navigation (a Link from /main, or Clerk's redirect after sign-in) keeps the
 * previous document and its headers, so boot failed with "Failed to start
 * WebContainer". Reload once to fetch /room as a real document; if it is still
 * not isolated after that, render anyway so the real error surfaces instead of
 * reloading forever.
 */
export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alreadyReloaded = false;
    try {
      alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
    } catch {}

    if (window.crossOriginIsolated || alreadyReloaded) {
      try {
        sessionStorage.removeItem(RELOAD_FLAG);
      } catch {}
      setReady(true);
      return;
    }

    try {
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {}
    window.location.reload();
  }, []);

  return ready ? children : null;
}
