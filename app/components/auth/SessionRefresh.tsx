"use client";

import { useEffect } from "react";
import { getApiUrl } from "../../lib/runtime-config";

let refreshPromise: Promise<boolean> | null = null;

function getSafeRedirect(redirectTo: string) {
  try {
    const url = new URL(redirectTo, window.location.origin);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    if (url.pathname === "/" || url.pathname === "/dashboard") {
      return `/${url.search}${url.hash}`;
    }

    if (url.pathname.startsWith("/dashboard/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
  }

  return "/";
}

function refreshSession() {
  refreshPromise ??= (async () => {
    const endpoint = await getApiUrl("/api/v1/auth/refresh");
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  })().catch(() => false);

  return refreshPromise;
}

export default function SessionRefresh({ redirectTo = "/" }: { redirectTo?: string }) {
  useEffect(() => {
    let isActive = true;

    refreshSession().then((isRefreshed) => {
      if (!isActive || !isRefreshed) {
        return;
      }

      window.location.replace(getSafeRedirect(redirectTo));
    });

    return () => {
      isActive = false;
    };
  }, [redirectTo]);

  return null;
}
