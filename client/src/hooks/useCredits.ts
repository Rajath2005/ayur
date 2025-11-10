import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useCredits() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", "credits"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/me/credits");
      return res.json();
    },
    staleTime: 15_000, // Cache for 15 seconds
    refetchOnWindowFocus: true,
  });

  const credits = data?.credits ?? 0;
  const maxCredits = data?.maxCredits ?? 40;
  const percent = Math.max(0, Math.min(100, Math.round((credits / maxCredits) * 100)));

  const refreshCredits = () => {
    queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
  };

  return {
    credits,
    maxCredits,
    percent,
    isLoading,
    error,
    refreshCredits,
  };
}
