import { QueryClient } from "@tanstack/react-query";

const API_VERSION = "v1";
const BASE_URL = (import.meta.env.VITE_GATEWAY_URL || "").replace(/\/$/, '');



function getVersionedUrl(path) {
  // Skip versioning for auth routes and already versioned paths
  if (path.startsWith('/api/auth') || path.includes(`/api/${API_VERSION}`)) {
    return `${BASE_URL}${path}`;
  }

  // Add version to API paths
  if (path.startsWith('/api/')) {
    return `${BASE_URL}${path.replace('/api/', `/api/${API_VERSION}/`)}`;
  }

  return `${BASE_URL}${path}`;
}

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method, url, data) {
  const versionedUrl = getVersionedUrl(url);
  const res = await fetch(versionedUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// on401 can be "returnNull" or "throw"
export const getQueryFn = ({ on401 }) => {
  return async ({ queryKey }) => {
    const url = queryKey[0];
    const versionedUrl = getVersionedUrl(url);

    const res = await fetch(versionedUrl, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
