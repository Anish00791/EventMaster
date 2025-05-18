import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        // Log the full error response for debugging
        console.error('Server error response:', errorData);
        
        // Check if there are validation details to extract
        if (errorData.details) {
          try {
            // Try to parse the details if it's a JSON string
            const parsedDetails = typeof errorData.details === 'string' ? 
              JSON.parse(errorData.details) : errorData.details;
            
            if (Array.isArray(parsedDetails)) {
              // Format validation errors in a readable way
              const formattedErrors = parsedDetails
                .map((err: any) => `${err.path?.join('.')}: ${err.message}`)
                .join('; ');
              throw new Error(formattedErrors || errorData.message || `${res.status}: ${res.statusText}`);
            }
          } catch (parseError) {
            // If parsing fails, use the details string as is
          }
        }
        
        throw new Error(errorData.message || errorData.details || `${res.status}: ${res.statusText}`);
      } else {
        // Fall back to text if not JSON
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      // If JSON parsing fails, fall back to status text
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data ? { ...data, password: data.hasOwnProperty('password') ? '[REDACTED]' : undefined } : 'No data');
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    console.error(`API Error: ${method} ${url}`, {
      status: res.status,
      statusText: res.statusText
    });
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
