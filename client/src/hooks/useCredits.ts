import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

export interface CreditData {
  success: boolean;
  remainingCredits: number;
  maxCredits: number;
  usedCredits: number;
  cycleStart: string;
  cycleEnd: string;
  plan: string;
}

export function useCredits() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<CreditData>({
    queryKey: ["user", "credits", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/me/credits");
      return res.json();
    },
    staleTime: 0, // Always fetch fresh data when component mounts or window focuses
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!user?.id, // Only fetch when user is authenticated
  });

  const credits = data?.remainingCredits ?? 0;
  const maxCredits = data?.maxCredits ?? 40;
  const usedCredits = data?.usedCredits ?? 0;
  const percent = Math.max(0, Math.min(100, Math.round((credits / maxCredits) * 100)));
  const cycleEnd = data?.cycleEnd ? new Date(data.cycleEnd) : null;

  const refreshCredits = () => {
    queryClient.invalidateQueries({ queryKey: ["user", "credits", user?.id] });
  };

  return {
    credits,
    maxCredits,
    usedCredits,
    percent,
    cycleEnd,
    isLoading,
    error,
    refreshCredits,
  };
}
