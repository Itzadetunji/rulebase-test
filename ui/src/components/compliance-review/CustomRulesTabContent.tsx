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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateRuleMutation,
	useDeleteRuleMutation,
	useGetRulesQuery,
	useUpdateRuleMutation,
} from "@/hooks/use-custom-rules-queries";
import { useComplianceReviewStore } from "@/stores/compliance-review-store";
import type { ComplianceRule } from "@/types/compliance";
import { toast } from "sonner";
import { RuleModeSelect } from "./RuleModeSelect";

export function CustomRulesTabContent() {
	const getRulesQuery = useGetRulesQuery();
	const createRuleMutation = useCreateRuleMutation();
	const updateRuleMutation = useUpdateRuleMutation();
	const deleteRuleMutation = useDeleteRuleMutation();
	const customRulesMode = useComplianceReviewStore(
		(state) => state.customRulesMode,
	);
	const setCustomRulesMode = useComplianceReviewStore(
		(state) => state.setCustomRulesMode,
	);
	const [ruleTitle, setRuleTitle] = useState("");
	const [ruleDescription, setRuleDescription] = useState("");
	const [sheetRuleId, setSheetRuleId] = useState<string | null>(null);
	const [sheetRuleTitle, setSheetRuleTitle] = useState("");
	const [sheetRuleDescription, setSheetRuleDescription] = useState("");
	const trimmedRuleTitle = ruleTitle.trim();
	const trimmedRuleDescription = ruleDescription.trim();
	const trimmedSheetRuleTitle = sheetRuleTitle.trim();
	const trimmedSheetRuleDescription = sheetRuleDescription.trim();
	const canCreateRule =
		trimmedRuleTitle.length > 0 && trimmedRuleDescription.length > 0;
	const canSaveSheetRule =
		trimmedSheetRuleTitle.length > 0 && trimmedSheetRuleDescription.length > 0;

	const clearForm = () => {
		setRuleTitle("");
		setRuleDescription("");
	};

	const openRuleSheet = (rule: ComplianceRule) => {
		setSheetRuleId(rule.id);
		setSheetRuleTitle(rule.title);
		setSheetRuleDescription(rule.description);
	};

	const closeRuleSheet = () => {
		setSheetRuleId(null);
		setSheetRuleTitle("");
		setSheetRuleDescription("");
	};

	const onCreateRule = async () => {
		if (!canCreateRule) {
			toast.error("Rule title and description are required.");
			return;
		}
		await createRuleMutation.mutateAsync({
			title: trimmedRuleTitle,
			description: trimmedRuleDescription,
		});
		clearForm();
	};

	const onSaveSheetRule = async () => {
		if (!sheetRuleId) return;
		if (!canSaveSheetRule) {
			toast.error("Rule title and description are required.");
			return;
		}
		await updateRuleMutation.mutateAsync({
			id: sheetRuleId,
			title: trimmedSheetRuleTitle,
			description: trimmedSheetRuleDescription,
		});
		closeRuleSheet();
	};

	const onDeleteSheetRule = async () => {
		if (!sheetRuleId) return;
		await deleteRuleMutation.mutateAsync(sheetRuleId);
		closeRuleSheet();
	};

	const customRules = getRulesQuery.data?.rules ?? [];
	const customRulesLoading =
		getRulesQuery.isFetching ||
		createRuleMutation.isPending ||
		updateRuleMutation.isPending ||
		deleteRuleMutation.isPending;

	useEffect(() => {
		if (!getRulesQuery.isError) return;
		toast.error(
			getRulesQuery.error instanceof Error
				? getRulesQuery.error.message
				: "Unexpected error.",
		);
	}, [getRulesQuery.isError, getRulesQuery.error]);

	useEffect(() => {
		if (!createRuleMutation.isError) return;
		toast.error(
			createRuleMutation.error instanceof Error
				? createRuleMutation.error.message
				: "Unexpected error.",
		);
	}, [createRuleMutation.isError, createRuleMutation.error]);

	useEffect(() => {
		if (!createRuleMutation.isSuccess) return;
		toast.success("Rule saved.");
	}, [createRuleMutation.isSuccess]);

	useEffect(() => {
		if (!updateRuleMutation.isError) return;
		toast.error(
			updateRuleMutation.error instanceof Error
				? updateRuleMutation.error.message
				: "Unexpected error.",
		);
	}, [updateRuleMutation.isError, updateRuleMutation.error]);

	useEffect(() => {
		if (!updateRuleMutation.isSuccess) return;
		toast.success("Rule saved.");
	}, [updateRuleMutation.isSuccess]);

	useEffect(() => {
		if (!deleteRuleMutation.isError) return;
		toast.error(
			deleteRuleMutation.error instanceof Error
				? deleteRuleMutation.error.message
				: "Unexpected error.",
		);
	}, [deleteRuleMutation.isError, deleteRuleMutation.error]);

	useEffect(() => {
		if (!deleteRuleMutation.isSuccess) return;
		toast.success("Rule deleted.");
	}, [deleteRuleMutation.isSuccess]);

	return (
		<TabsContent
			value="custom-rules"
			className="space-y-4"
		>
			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Business rules settings</CardTitle>
					<CardDescription className="text-xs">
						Load and manage project-specific rules that can run in default,
						business, or combined mode with UDAAP.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 pt-4">
					<RuleModeSelect
						id="rules-mode"
						value={customRulesMode}
						onValueChange={setCustomRulesMode}
						disabled={customRulesLoading}
					/>
				</CardContent>
			</Card>

			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Create or edit business rule</CardTitle>
					<CardDescription className="text-xs">
						Rule IDs are generated automatically as UUIDs.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
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
							onClick={() => void onCreateRule()}
							disabled={customRulesLoading || !canCreateRule}
						>
							Create rule
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
						Click any row to open a sheet and edit the rule.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					{customRules.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>ID</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{customRules.map((rule) => (
									<TableRow
										key={rule.id}
										className="hover:bg-muted/40 cursor-pointer"
										onClick={() => openRuleSheet(rule)}
									>
										<TableCell className="font-medium">{rule.title}</TableCell>
										<TableCell className="text-muted-foreground">
											{rule.description}
										</TableCell>
										<TableCell className="font-mono text-xs">
											{rule.id}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground px-4 pb-4 pt-2 text-xs">
							No business rules yet.
						</p>
					)}
				</CardContent>
			</Card>

			<Sheet
				open={Boolean(sheetRuleId)}
				onOpenChange={(open) => {
					if (!open) {
						closeRuleSheet();
					}
				}}
			>
				<SheetContent
					side="right"
					className="w-full max-w-xl p-0"
				>
					<SheetHeader className="border-border border-b">
						<SheetTitle>Rule details</SheetTitle>
						<SheetDescription className="font-mono text-xs">
							{sheetRuleId}
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-3 p-4">
						<div className="space-y-1.5">
							<Label htmlFor="sheet-rule-title">Rule title</Label>
							<Input
								id="sheet-rule-title"
								value={sheetRuleTitle}
								onChange={(event) => setSheetRuleTitle(event.target.value)}
								disabled={customRulesLoading}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="sheet-rule-description">Rule description</Label>
							<Textarea
								id="sheet-rule-description"
								value={sheetRuleDescription}
								onChange={(event) =>
									setSheetRuleDescription(event.target.value)
								}
								disabled={customRulesLoading}
								rows={5}
								className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full border px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
							/>
						</div>
					</div>

					<SheetFooter className="border-border border-t">
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								onClick={() => void onSaveSheetRule()}
								disabled={customRulesLoading || !canSaveSheetRule}
							>
								Save changes
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={() => void onDeleteSheetRule()}
								disabled={customRulesLoading}
							>
								Delete rule
							</Button>
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</TabsContent>
	);
}
