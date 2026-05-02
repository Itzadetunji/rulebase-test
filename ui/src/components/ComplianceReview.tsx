import { Fragment, useState } from "react";
import axios from "axios";
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
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient, REVIEW_ACTION_URL, REVIEW_URL } from "@/lib/api";
import { populationCategory, riskFromResult } from "@/lib/review-helpers";
import { cn } from "@/lib/utils";
import type {
	ComplianceActionPayload,
	ReviewPayload,
	ReviewResult,
	RuleFinding,
} from "@/types/compliance";

type ErrorBody = { error?: string };

const SAMPLE_CSV_HEADERS = [
	"interaction_id",
	"timestamp",
	"channel",
	"agent_id",
	"customer_id",
	"transcript",
];

const SAMPLE_CSV_ROW = [
	"INT-1001",
	"2026-05-02T09:30:00Z",
	"phone",
	"AGENT-007",
	"CUST-2249",
	"Hello, I can help explain your options and next steps.",
];

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

export function ComplianceReview() {
	const [file, setFile] = useState<File | null>(null);
	const [activeTab, setActiveTab] = useState("review");
	const [reviewLoading, setReviewLoading] = useState(false);
	const [reviewStatusMessage, setReviewStatusMessage] = useState("");
	const [reviewPayload, setReviewPayload] = useState<ReviewPayload | null>(null);
	const [actionPrompt, setActionPrompt] = useState("");
	const [actionLoading, setActionLoading] = useState(false);
	const [actionStatusMessage, setActionStatusMessage] = useState("");
	const [actionPayload, setActionPayload] =
		useState<ComplianceActionPayload | null>(null);
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const loading = reviewLoading || actionLoading;

	const toggleRow = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	function downloadSampleCsv() {
		const csv = `${SAMPLE_CSV_HEADERS.join(",")}\n${SAMPLE_CSV_ROW.map(
			(value) => JSON.stringify(value),
		).join(",")}\n`;
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "sample-interactions.csv";
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}

	async function runReview() {
		if (!file) {
			setReviewStatusMessage("Please choose a CSV file.");
			return;
		}
		setReviewLoading(true);
		setReviewStatusMessage("Running compliance review…");
		setReviewPayload(null);
		setOpenIndex(null);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const { data } = await apiClient.post<ReviewPayload>(
				REVIEW_URL,
				formData,
			);
			setReviewPayload(data);
			setReviewStatusMessage("Review completed.");
		} catch (error) {
			let message = "Unexpected error.";
			if (axios.isAxiosError(error)) {
				const body = error.response?.data as ErrorBody | undefined;
				message = body?.error ?? error.response?.statusText ?? error.message;
			}
			setReviewStatusMessage(message);
			setReviewPayload(null);
		} finally {
			setReviewLoading(false);
		}
	}

	async function runComplianceAction() {
		if (!file) {
			setActionStatusMessage("Please choose a CSV file.");
			return;
		}
		if (!actionPrompt.trim()) {
			setActionStatusMessage("Please enter a compliance action prompt.");
			return;
		}
		setActionLoading(true);
		setActionStatusMessage("Running compliance action…");
		setActionPayload(null);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("prompt", actionPrompt.trim());
			const { data } = await apiClient.post<ComplianceActionPayload>(
				REVIEW_ACTION_URL,
				formData,
			);
			setActionPayload(data);
			setActionStatusMessage("Compliance action completed.");
		} catch (error) {
			let message = "Unexpected error.";
			if (axios.isAxiosError(error)) {
				const body = error.response?.data as ErrorBody | undefined;
				message = body?.error ?? error.response?.statusText ?? error.message;
			}
			setActionStatusMessage(message);
			setActionPayload(null);
		} finally {
			setActionLoading(false);
		}
	}

	const results: ReviewResult[] = reviewPayload?.results ?? [];
	const summary = reviewPayload?.summary;

	return (
		<div className="bg-background mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8 antialiased">
			<header className="mb-8 space-y-1">
				<h1 className="text-xl font-semibold tracking-tight text-foreground">
					Compliance review: UDAAP (Unfair, Deceptive, or Abusive Acts or
					Practices)
				</h1>
			</header>

			<Card className="mb-6 shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-6">
					<CardTitle>Upload CSV</CardTitle>
					<CardDescription className="text-xs">
						Attach one CSV once, then use either tab below.
					</CardDescription>
					<CardDescription className="text-xs">
						Expected columns include{" "}
						<code className="bg-muted px-1">
							interaction_id, timestamp, channel, agent_id, customer_id,
							transcript
						</code>
						.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap items-end gap-4 pt-6">
					<div className="min-w-[200px] flex-1 space-y-1.5">
						<Label htmlFor="csv-file">CSV file</Label>
						<input
							id="csv-file"
							name="file"
							type="file"
							accept=".csv,text/csv"
							className="peer sr-only"
							disabled={loading}
							onChange={(e) => {
								setFile(e.target.files?.[0] ?? null);
							}}
						/>
						<label
							htmlFor="csv-file"
							className={cn(
								"border-input bg-background hover:bg-accent/40 flex min-h-8 cursor-pointer items-center border px-2.5 py-1 text-xs transition-colors outline-none",
								"peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 peer-focus-visible:ring-1",
								"peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:bg-input/50 peer-disabled:opacity-50 dark:bg-input/30 dark:hover:bg-accent/25 dark:peer-disabled:bg-input/80",
							)}
							aria-label="Choose CSV file"
						>
							<span
								className={cn(
									"truncate",
									file ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{file?.name ?? "No file chosen"}
							</span>
						</label>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={downloadSampleCsv}
						disabled={loading}
					>
						Download sample CSV
					</Button>
				</CardContent>
			</Card>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="mb-4">
					<TabsTrigger value="review">UDAAP Review</TabsTrigger>
					<TabsTrigger value="action">Compliance Prompt Action</TabsTrigger>
				</TabsList>

				<TabsContent
					value="review"
					className="space-y-4"
				>
					<Card className="shadow-sm ring-border/80">
						<CardHeader className="border-border border-b pb-4">
							<CardTitle>Run general UDAAP review</CardTitle>
							<CardDescription className="text-xs">
								Analyze all rows in the attached CSV with standard compliance
								rules.
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-4">
							<Button
								type="button"
								onClick={() => void runReview()}
								disabled={loading}
							>
								{reviewLoading ? "Running…" : "Run review"}
							</Button>
						</CardContent>
					</Card>

					{reviewStatusMessage ? (
						<p
							className={cn(
								"text-xs",
								!reviewPayload &&
									reviewStatusMessage !== "Review completed." &&
									"text-destructive",
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
								Total:{" "}
								<span className="ml-1 font-semibold">{summary.totalRows}</span>
							</Badge>
							<Badge
								variant="outline"
								className="h-7 border-transparent bg-emerald-50 px-2.5 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/25"
							>
								Compliant:{" "}
								<span className="ml-1 font-semibold">
									{summary.compliantRows}
								</span>
							</Badge>
							<Badge
								variant="outline"
								className="h-7 border-transparent bg-red-50 px-2.5 text-red-800 ring-1 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-500/25"
							>
								Flagged:{" "}
								<span className="ml-1 font-semibold">{summary.flaggedRows}</span>
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
									{!results.length && !reviewPayload && !reviewLoading ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-muted-foreground py-12 text-center text-xs"
											>
												No rows yet. Upload a CSV and run review.
											</TableCell>
										</TableRow>
									) : null}

									{!results.length && reviewPayload && !reviewLoading ? (
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

				<TabsContent
					value="action"
					className="space-y-4"
				>
					<Card className="shadow-sm ring-border/80">
						<CardHeader className="border-border border-b pb-4">
							<CardTitle>Prompt AI with the same CSV</CardTitle>
							<CardDescription className="text-xs">
								Enter a compliance-specific action, like identifying high-risk
								rows or drafting compliant rewrites.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 pt-4">
							<div className="space-y-1.5">
								<Label htmlFor="action-prompt">Compliance prompt</Label>
								<textarea
									id="action-prompt"
									value={actionPrompt}
									onChange={(e) => setActionPrompt(e.target.value)}
									placeholder="Example: List the top 5 highest-risk interactions and explain why."
									disabled={loading}
									rows={4}
									className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full border px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
								/>
							</div>
							<Button
								type="button"
								onClick={() => void runComplianceAction()}
								disabled={loading}
							>
								{actionLoading ? "Running…" : "Run action"}
							</Button>
						</CardContent>
					</Card>

					{actionStatusMessage ? (
						<p
							className={cn(
								"text-xs",
								!actionPayload &&
									actionStatusMessage !== "Compliance action completed." &&
									"text-destructive",
							)}
						>
							{actionStatusMessage}
						</p>
					) : null}

					{actionPayload ? (
						<Card className="shadow-sm ring-border/80">
							<CardHeader className="border-border border-b pb-4">
								<CardTitle>Action output</CardTitle>
								<CardDescription className="text-xs">
									Generated from your current CSV plus prompt.
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-4">
								<p className="bg-muted/40 whitespace-pre-wrap rounded-md p-3 text-sm leading-relaxed">
									{actionPayload.output}
								</p>
							</CardContent>
						</Card>
					) : null}
				</TabsContent>
			</Tabs>
		</div>
	);
}
