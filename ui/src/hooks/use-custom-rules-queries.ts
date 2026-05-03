import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, CUSTOM_RULES_URL, customRuleByIdUrl } from "@/lib/api";
import type { ComplianceRule, CustomRulesPayload } from "@/types/compliance";

const CUSTOM_RULES_QUERY_KEY = ["custom-rules"];

export const useGetRulesQuery = () => {
	return useQuery({
		queryKey: CUSTOM_RULES_QUERY_KEY,
		queryFn: async () => {
			const response = await apiClient.get<CustomRulesPayload>(CUSTOM_RULES_URL);
			return response.data;
		},
	});
};

export const useCreateRuleMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (rule: Omit<ComplianceRule, "id">) => {
			const response = await apiClient.post<CustomRulesPayload>(CUSTOM_RULES_URL, {
				title: rule.title,
				description: rule.description,
			});
			return response.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: CUSTOM_RULES_QUERY_KEY });
		},
	});
};

export const useUpdateRuleMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (rule: ComplianceRule) => {
			const response = await apiClient.patch<CustomRulesPayload>(
				customRuleByIdUrl(rule.id),
				{
					title: rule.title,
					description: rule.description,
				},
			);
			return response.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: CUSTOM_RULES_QUERY_KEY });
		},
	});
};

export const useDeleteRuleMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ruleId: string) => {
			const response = await apiClient.delete<CustomRulesPayload>(
				customRuleByIdUrl(ruleId),
			);
			return response.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: CUSTOM_RULES_QUERY_KEY });
		},
	});
};
