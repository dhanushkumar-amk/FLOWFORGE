import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
    },
    mutations: {
      onError: (error: unknown) => {
        const message =
          (error as any)?.response?.data?.error ??
          (error as Error)?.message ??
          'Something went wrong';
        toast.error(message);
      },
    },
  },
});
