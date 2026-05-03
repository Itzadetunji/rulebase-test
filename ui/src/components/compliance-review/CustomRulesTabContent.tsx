import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useDeleteRuleMutation,
	useGetRulesQuery,
	useSetRuleModeMutation,
	useUpsertRuleMutation,
} from "@/hooks/use-custom-rules-queries";
import { cn } from "@/lib/utils";
import type { ComplianceRule, CustomRuleMode } from "@/types/compliance";
import { SharedCsvUploadCard } from "./SharedCsvUploadCard";

export function CustomRulesTabContent() {
	const getRulesQuery = useGetRulesQuery();
	const upsertRuleMutation = useUpsertRuleMutation();
	const deleteRuleMutation = useDeleteRuleMutation();
	const setRuleModeMutation = useSetRuleModeMutation();
	const [ruleId, setRuleId] = useState("");
	const [ruleTitle, setRuleTitle] = useState("");
	const [ruleDescription, setRuleDescription] = useState("");

	useEffect(() => {
		void getRulesQuery.refetch();
		// Run once on mount; query is otherwise refreshed via invalidation/refetch.
		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
	}, []);

	const clearForm = () => {
		setRuleId("");
		setRuleTitle("");
		setRuleDescription("");
	};

	const loadForEdit = (rule: ComplianceRule) => {
		setRuleId(rule.id);
		setRuleTitle(rule.title);
		setRuleDescription(rule.description);
	};

	const onSaveRule = async () => {
		await upsertRuleMutation.mutateAsync({
			id: ruleId,
			title: ruleTitle,
			description: ruleDescription,
		});
		clearForm();
	};

	const onModeChange = async (value: string) => {
		const mode = value as CustomRuleMode;
		await setRuleModeMutation.mutateAsync(mode);
	};

	const customRules = getRulesQuery.data?.rules ?? [];
	const customRulesMode = getRulesQuery.data?.mode ?? "default";
	const customRulesLoading =
		getRulesQuery.isFetching ||
		upsertRuleMutation.isPending ||
		deleteRuleMutation.isPending ||
		setRuleModeMutation.isPending;

	let customRulesStatusMessage = "";
	let customRulesStatusKind: "error" | "success" = "success";

	if (getRulesQuery.isError) {
		customRulesStatusMessage =
			getRulesQuery.error instanceof Error
				? getRulesQuery.error.message
				: "Unexpected error.";
		customRulesStatusKind = "error";
	}
	if (upsertRuleMutation.isError) {
		customRulesStatusMessage =
			upsertRuleMutation.error instanceof Error
				? upsertRuleMutation.error.message
				: "Unexpected error.";
		customRulesStatusKind = "error";
	}
	if (deleteRuleMutation.isError) {
		customRulesStatusMessage =
			deleteRuleMutation.error instanceof Error
				? deleteRuleMutation.error.message
				: "Unexpected error.";
		customRulesStatusKind = "error";
	}
	if (setRuleModeMutation.isError) {
		customRulesStatusMessage =
			setRuleModeMutation.error instanceof Error
				? setRuleModeMutation.error.message
				: "Unexpected error.";
		customRulesStatusKind = "error";
	}
	if (upsertRuleMutation.isSuccess) {
		customRulesStatusMessage = "Rule saved.";
	}
	if (deleteRuleMutation.isSuccess) {
		customRulesStatusMessage = "Rule deleted.";
	}
	if (setRuleModeMutation.isSuccess) {
		customRulesStatusMessage = "Rule mode updated.";
	}
	if (getRulesQuery.isSuccess && !customRulesStatusMessage) {
		customRulesStatusMessage = "Custom rules loaded.";
	}

	return (
		<TabsContent
			value="custom-rules"
			className="space-y-4"
		>
			<SharedCsvUploadCard disabled={customRulesLoading} />

			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Custom rules settings</CardTitle>
					<CardDescription className="text-xs">
						Load and manage project-specific rules that can run in default,
						custom, or combined mode with UDAAP.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 pt-4">
					<div className="space-y-1.5">
						<Label htmlFor="rules-mode">Rule mode</Label>
						<select
							id="rules-mode"
							className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-[3px]"
							value={customRulesMode}
							onChange={(event) => void onModeChange(event.target.value)}
							disabled={customRulesLoading}
						>
							<option value="default">default</option>
							<option value="custom">custom</option>
							<option value="combined">combined</option>
						</select>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => void getRulesQuery.refetch()}
						disabled={customRulesLoading}
						className="inline-flex items-center gap-2"
					>
						{customRulesLoading ? (
							<>
								<Spinner className="size-4" />
								Loading rules
							</>
						) : (
							"Load rules"
						)}
					</Button>
				</CardContent>
			</Card>

			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Create or edit custom rule</CardTitle>
					<CardDescription className="text-xs">
						Use the same rule id to update an existing rule.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					<div className="space-y-1.5">
						<Label htmlFor="rule-id">Rule ID</Label>
						<Input
							id="rule-id"
							value={ruleId}
							onChange={(event) => setRuleId(event.target.value)}
							placeholder="my-business-rule"
							disabled={customRulesLoading}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="rule-title">Rule title</Label>
						<Input
							id="rule-title"
							value={ruleTitle}
							onChange={(event) => setRuleTitle(event.target.value)}
							placeholder="Example: No unsupported product guarantees"
							disabled={customRulesLoading}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="rule-description">Rule description</Label>
						<Textarea
							id="rule-description"
							value={ruleDescription}
							onChange={(event) => setRuleDescription(event.target.value)}
							placeholder="Describe what reviewers should enforce."
							disabled={customRulesLoading}
							rows={3}
							className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full border px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
						/>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							onClick={() => void onSaveRule()}
							disabled={customRulesLoading}
						>
							Save rule
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={clearForm}
							disabled={customRulesLoading}
						>
							Clear
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Saved rules</CardTitle>
					<CardDescription className="text-xs">
						Saved custom rules currently active for this project.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{customRulesStatusMessage ? (
						<p
							className={cn(
								"text-xs",
								customRulesStatusKind === "error"
									? "text-destructive"
									: "text-muted-foreground",
							)}
						>
							{customRulesStatusMessage}
						</p>
					) : null}
					{customRules.length ? (
						<div className="space-y-2">
							{customRules.map((rule) => (
								<Card
									key={rule.id}
									size="sm"
									className="bg-muted/40"
								>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm">{rule.title}</CardTitle>
										<CardDescription className="font-mono text-xs">
											{rule.id}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-2 text-xs">
										<p className="text-muted-foreground">{rule.description}</p>
										<div className="flex flex-wrap gap-2">
											<Button
												type="button"
												size="sm"
												variant="outline"
												onClick={() => loadForEdit(rule)}
												disabled={customRulesLoading}
											>
												Edit
											</Button>
											<Button
												type="button"
												size="sm"
												variant="destructive"
												onClick={() => void deleteRuleMutation.mutateAsync(rule.id)}
												disabled={customRulesLoading}
											>
												Delete
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-xs">
							No custom rules yet.
						</p>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}
