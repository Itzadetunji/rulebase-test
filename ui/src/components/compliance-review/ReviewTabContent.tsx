import { Fragment } from "react";
import {
	BuildingsIcon,
	ChartBarIcon,
	ListIcon,
	Phone,
	UsersIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { getMutationErrorMessage, useRunReviewMutation } from "@/hooks/use-compliance-queries";
import { populationCategory, riskFromResult } from "@/lib/review-helpers";
import { cn } from "@/lib/utils";
import { useComplianceReviewStore } from "@/stores/compliance-review-store";
import type { ReviewResult, RuleFinding } from "@/types/compliance";
import { SharedCsvUploadCard } from "./SharedCsvUploadCard";

function findingStatusVariant(
	status: RuleFinding["status"],
): "default" | "destructive" | "secondary" {
	if (status === "flagged") return "destructive";
	if (status === "warning") return "secondary";
	return "default";
}

function FindingsList({ findings }: { findings: RuleFinding[] }) {
	if (!findings.length) {
		return (
			<p className="text-muted-foreground text-xs">No findings returned.</p>
		);
	}

	return (
		<div className="space-y-3">
			{findings.map((finding) => (
				<Card
					key={finding.ruleId}
					size="sm"
					className="bg-muted/40"
				>
					<CardHeader className="pb-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant={findingStatusVariant(finding.status)}>
								{finding.status} · {finding.severity}
							</Badge>
							<CardTitle className="font-medium text-xs">
								{finding.ruleTitle}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-1.5 text-xs leading-relaxed">
						<p className="text-foreground">
							<span className="font-medium">Rationale:</span>{" "}
							{finding.rationale}
						</p>
						<p className="text-muted-foreground">
							<span className="font-medium text-foreground">Evidence:</span>{" "}
							{finding.evidence}
						</p>
						<p className="text-foreground">
							<span className="font-medium">Suggested rewrite:</span>{" "}
							{finding.suggestedRewrite}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function ReviewTabContent() {
	const file = useComplianceReviewStore((state) => state.file);
	const openIndex = useComplianceReviewStore((state) => state.openIndex);
	const toggleRow = useComplianceReviewStore((state) => state.toggleRow);
	const runReviewMutation = useRunReviewMutation();
	const loading = runReviewMutation.isPending;
	const results: ReviewResult[] = runReviewMutation.data?.results ?? [];
	const summary = runReviewMutation.data?.summary;

	const onRunReview = async () => {
		await runReviewMutation.mutateAsync({
			file,
		});
	};

	let reviewStatusMessage = "";
	let reviewStatusKind: "error" | "success" = "success";

	if (runReviewMutation.isError) {
		reviewStatusMessage = getMutationErrorMessage(runReviewMutation.error);
		reviewStatusKind = "error";
	}

	if (runReviewMutation.isSuccess) {
		reviewStatusMessage = "Review completed.";
		reviewStatusKind = "success";
	}

	return (
		<TabsContent
			value="review"
			className="space-y-4"
		>
			<SharedCsvUploadCard disabled={loading} />

			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Run general UDAAP review</CardTitle>
					<CardDescription className="text-xs">
						Analyze all rows in the attached CSV with standard compliance rules.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4">
					<Button
						type="button"
						onClick={() => void onRunReview()}
						disabled={loading}
						className="inline-flex items-center gap-2"
					>
						{runReviewMutation.isPending ? (
							<>
								<Spinner className="size-4" />
								Running review
							</>
						) : (
							"Run review"
						)}
					</Button>
				</CardContent>
			</Card>

			{reviewStatusMessage ? (
				<p
					className={cn(
						"text-xs",
						reviewStatusKind === "error"
							? "text-destructive"
							: "text-muted-foreground",
					)}
				>
					{reviewStatusMessage}
				</p>
			) : null}

			{summary ? (
				<div className="flex flex-wrap gap-2 text-xs">
					<Badge
						variant="secondary"
						className="h-7 px-2.5"
					>
						Total: <span className="ml-1 font-semibold">{summary.totalRows}</span>
					</Badge>
					<Badge
						variant="outline"
						className="h-7 border-transparent bg-emerald-50 px-2.5 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/25"
					>
						Compliant:{" "}
						<span className="ml-1 font-semibold">{summary.compliantRows}</span>
					</Badge>
					<Badge
						variant="outline"
						className="h-7 border-transparent bg-red-50 px-2.5 text-red-800 ring-1 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-500/25"
					>
						Flagged: <span className="ml-1 font-semibold">{summary.flaggedRows}</span>
					</Badge>
				</div>
			) : null}

			<Card className="overflow-hidden shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Review results</CardTitle>
					<CardDescription className="text-xs">
						Click a row to expand findings and transcript metadata.
					</CardDescription>
				</CardHeader>
				<CardContent className="px-4 pb-4 pt-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="min-w-[100px]">
									<span className="inline-flex items-center gap-2">
										<UsersIcon className="text-muted-foreground size-4" />
										Employee
									</span>
								</TableHead>
								<TableHead>
									<span className="inline-flex items-center gap-2">
										<ChartBarIcon className="text-muted-foreground size-4" />
										Risk level
									</span>
								</TableHead>
								<TableHead>
									<span className="inline-flex items-center gap-2">
										<Phone className="text-muted-foreground size-4" />
										Ticket ID
									</span>
								</TableHead>
								<TableHead>
									<span className="inline-flex items-center gap-2">
										<BuildingsIcon className="text-muted-foreground size-4" />
										Customer
									</span>
								</TableHead>
								<TableHead className="min-w-[140px]">
									<span className="inline-flex items-center gap-2">
										<ListIcon className="text-muted-foreground size-4" />
										Population category
									</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{!results.length && !runReviewMutation.data && !runReviewMutation.isPending ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-muted-foreground py-12 text-center text-xs"
									>
										No rows yet. Upload a CSV and run review.
									</TableCell>
								</TableRow>
							) : null}

							{!results.length && runReviewMutation.data && !runReviewMutation.isPending ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-muted-foreground py-12 text-center text-xs"
									>
										No results.
									</TableCell>
								</TableRow>
							) : null}

							{results.map((result, index) => {
								const risk = riskFromResult(result);
								const open = openIndex === index;

								return (
									<Fragment key={`${result.interactionId}-${index}`}>
										<TableRow
											className="hover:bg-muted/40 cursor-pointer"
											onClick={() => toggleRow(index)}
											aria-expanded={open}
											data-state={open ? "selected" : undefined}
										>
											<TableCell className="font-medium">
												{result.agentId ?? "—"}
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={cn(
														"h-6 border-transparent px-2.5 font-medium ring-1 ring-inset",
														risk.badgeClass,
													)}
												>
													{risk.label}
												</Badge>
											</TableCell>
											<TableCell className="font-mono text-[0.8rem]">
												{result.interactionId}
											</TableCell>
											<TableCell>{result.customerId ?? "—"}</TableCell>
											<TableCell className="whitespace-normal">
												{populationCategory(result.channel)}
											</TableCell>
										</TableRow>
										{open ? (
											<TableRow className="bg-muted/20 hover:bg-muted/20">
												<TableCell
													colSpan={5}
													className="whitespace-normal py-4"
												>
													<p className="text-muted-foreground mb-3 text-xs">
														{result.channel} · {result.timestamp}
													</p>
													{result.error ? (
														<p className="text-destructive mb-3 text-xs font-medium">
															Evaluation error: {result.error}
														</p>
													) : null}
													<FindingsList findings={result.findings ?? []} />
												</TableCell>
											</TableRow>
										) : null}
									</Fragment>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
