"use client";

import { useEffect } from "react";
import { getVersionedApiUrl } from "../../lib/runtime-config";

let refreshPromise: Promise<boolean> | null = null;

function getSafeRedirect(redirectTo: string) {
  try {
    const url = new URL(redirectTo, window.location.origin);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    if (url.pathname === "/") {
      return `/${url.search}${url.hash}`;
    }

    if (
      url.pathname === "/dashboard" ||
      url.pathname.startsWith("/dashboard/") ||
      url.pathname.startsWith("/categories/")
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
  }

  return "/";
}

function refreshSession() {
  refreshPromise ??= (async () => {
    const endpoint = await getVersionedApiUrl("/auth/refresh");
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  })().catch(() => false);

  return refreshPromise;
}

function shouldSkipSessionRefresh() {
  if (sessionStorage.getItem("auth_just_logged_out") !== "true") {
    return false;
  }

  sessionStorage.removeItem("auth_just_logged_out");
  return true;
}

export default function SessionRefresh({
  redirectTo = "/",
  disabled = false,
}: {
  redirectTo?: string;
  disabled?: boolean;
}) {
  useEffect(() => {
    if (disabled || shouldSkipSessionRefresh()) {
      return;
    }

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
  }, [disabled, redirectTo]);

  return null;
}
