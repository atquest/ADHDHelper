import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, data ? { data } : "");
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json",
        "Cache-Control": "no-cache, no-store",
        "Pragma": "no-cache"
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`Response status for ${method} ${url}:`, res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error response from ${method} ${url}:`, errorText);
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
    
    return res;
  } catch (error) {
    console.error(`Failed to make ${method} request to ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache"
        },
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Unauthorized request, returning null as configured");
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Query data fetched for ${queryKey[0]}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
