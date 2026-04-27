// src/lib/runtime-config.ts
export type RuntimeConfig = {
  apiUrl: string;
  appUrl: string;
};

let cachedConfig: RuntimeConfig | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) return cachedConfig;

  const res = await fetch("/api/config", { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to load runtime config");
  }

  const config: RuntimeConfig = await res.json();
  cachedConfig = config;
  return config;
}

export async function getApiUrl(path: string): Promise<string> {
  const { apiUrl } = await getRuntimeConfig();

  if (!apiUrl) {
    return path;
  }

  return new URL(path, apiUrl).toString();
}
