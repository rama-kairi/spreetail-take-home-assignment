import { useQuery } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { type HealthCheck, healthCheckSchema } from "@/lib/schemas";

async function fetchHealthCheck(): Promise<HealthCheck> {
	return fetchWithValidation(api.get("health").json(), healthCheckSchema);
}

export function useHealthCheck() {
	return useQuery({
		queryKey: ["health"],
		queryFn: fetchHealthCheck,
		staleTime: 1000 * 60, // 1 minute
	});
}
