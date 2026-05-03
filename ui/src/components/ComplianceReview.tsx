import { Fragment } from "react";
import { Upload, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { populationCategory, riskFromResult } from "@/lib/review-helpers";
import { useComplianceReviewStore } from "@/stores/compliance-review-store";
import { cn } from "@/lib/utils";
import type { ReviewResult, RuleFinding } from "@/types/compliance";
import { Textarea } from "./ui/textarea";

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

function downloadSampleCsv() {
	const csv = `${SAMPLE_CSV_HEADERS.join(",")}\n${SAMPLE_CSV_ROW.map((value) =>
		JSON.stringify(value),
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

function SharedCsvUploadCard() {
	const file = useComplianceReviewStore((state) => state.file);
	const setFile = useComplianceReviewStore((state) => state.setFile);
	const reviewLoading = useComplianceReviewStore(
		(state) => state.reviewLoading,
	);
	const actionLoading = useComplianceReviewStore(
		(state) => state.actionLoading,
	);
	const loading = reviewLoading || actionLoading;

	return (
		<Card className="shadow-sm ring-border/80">
			<CardHeader className="border-border border-b pb-4">
				<CardTitle>Upload CSV</CardTitle>
				<CardDescription className="text-xs">
					Expected columns include{" "}
					<code className="bg-muted px-1">
						interaction_id, timestamp, channel, agent_id, customer_id,
						transcript
					</code>
					.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				<div className="min-w-[240px] flex-1 space-y-1.5">
					<Label>CSV file</Label>
					<FileUpload
						maxFiles={1}
						maxSize={10 * 1024 * 1024}
						accept=".csv,text/csv"
						className="w-full"
						value={file ? [file] : []}
						onValueChange={(files: File[]) => setFile(files[0] ?? null)}
						disabled={loading}
					>
						<FileUploadDropzone className="py-3">
							<div className="flex items-center gap-2">
								<Upload className="size-4 text-muted-foreground" />
								<span className="text-sm">Drop CSV or</span>
								<FileUploadTrigger asChild>
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0"
									>
										browse
									</Button>
								</FileUploadTrigger>
							</div>
						</FileUploadDropzone>
						<FileUploadList className="gap-1">
							{file ? (
								<FileUploadItem
									value={file}
									className="p-2"
								>
									<FileUploadItemPreview className="size-8" />
									<FileUploadItemMetadata size="sm" />
									<FileUploadItemDelete asChild>
										<Button
											variant="ghost"
											size="icon"
											className="size-6"
										>
											<X className="size-3" />
										</Button>
									</FileUploadItemDelete>
								</FileUploadItem>
							) : null}
						</FileUploadList>
					</FileUpload>
				</div>
				<Button
					type="button"
					variant="outline"
					className="w-fit"
					onClick={downloadSampleCsv}
					disabled={loading}
				>
					Download sample CSV
				</Button>
			</CardContent>
		</Card>
	);
}

function ReviewTabContent() {
	const reviewLoading = useComplianceReviewStore(
		(state) => state.reviewLoading,
	);
	const actionLoading = useComplianceReviewStore(
		(state) => state.actionLoading,
	);
	const reviewStatusMessage = useComplianceReviewStore(
		(state) => state.reviewStatusMessage,
	);
	const reviewPayload = useComplianceReviewStore(
		(state) => state.reviewPayload,
	);
	const openIndex = useComplianceReviewStore((state) => state.openIndex);
	const toggleRow = useComplianceReviewStore((state) => state.toggleRow);
	const runReview = useComplianceReviewStore((state) => state.runReview);
	const loading = reviewLoading || actionLoading;
	const results: ReviewResult[] = reviewPayload?.results ?? [];
	const summary = reviewPayload?.summary;

	return (
		<TabsContent
			value="review"
			className="space-y-4"
		>
			<SharedCsvUploadCard />

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
						<span className="ml-1 font-semibold">{summary.compliantRows}</span>
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
	);
}

function ActionTabContent() {
	const reviewLoading = useComplianceReviewStore(
		(state) => state.reviewLoading,
	);
	const actionLoading = useComplianceReviewStore(
		(state) => state.actionLoading,
	);
	const actionPrompt = useComplianceReviewStore((state) => state.actionPrompt);
	const actionStatusMessage = useComplianceReviewStore(
		(state) => state.actionStatusMessage,
	);
	const actionPayload = useComplianceReviewStore(
		(state) => state.actionPayload,
	);
	const setActionPrompt = useComplianceReviewStore(
		(state) => state.setActionPrompt,
	);
	const runComplianceAction = useComplianceReviewStore(
		(state) => state.runComplianceAction,
	);
	const loading = reviewLoading || actionLoading;

	return (
		<TabsContent
			value="action"
			className="space-y-4"
		>
			<SharedCsvUploadCard />

			<Card className="shadow-sm ring-border/80">
				<CardHeader className="border-border border-b pb-4">
					<CardTitle>Prompt AI with the same CSV</CardTitle>
					<CardDescription className="text-xs">
						Enter a compliance-specific action, like identifying high-risk rows
						or drafting compliant rewrites.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					<div className="space-y-1.5">
						<Label htmlFor="action-prompt">Compliance prompt</Label>
						<Textarea
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
						<div className="bg-muted/40 rounded-md p-3 text-sm leading-relaxed">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									h1: ({ children }) => (
										<h1 className="mb-2 text-lg font-semibold">{children}</h1>
									),
									h2: ({ children }) => (
										<h2 className="mb-2 text-base font-semibold">{children}</h2>
									),
									h3: ({ children }) => (
										<h3 className="mb-1 text-sm font-semibold">{children}</h3>
									),
									p: ({ children }) => (
										<p className="mb-2 whitespace-pre-wrap">{children}</p>
									),
									ul: ({ children }) => (
										<ul className="mb-2 list-disc space-y-1 pl-5">
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol className="mb-2 list-decimal space-y-1 pl-5">
											{children}
										</ol>
									),
									li: ({ children }) => <li>{children}</li>,
									code: ({ children }) => (
										<code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
											{children}
										</code>
									),
									pre: ({ children }) => (
										<pre className="bg-background mb-2 overflow-x-auto rounded p-2">
											{children}
										</pre>
									),
									table: ({ children }) => (
										<div className="mb-2 overflow-x-auto">
											<table className="w-full border-collapse text-left text-xs">
												{children}
											</table>
										</div>
									),
									th: ({ children }) => (
										<th className="border-border border px-2 py-1 font-semibold">
											{children}
										</th>
									),
									td: ({ children }) => (
										<td className="border-border border px-2 py-1">
											{children}
										</td>
									),
								}}
							>
								{actionPayload.output}
							</ReactMarkdown>
						</div>
					</CardContent>
				</Card>
			) : null}
		</TabsContent>
	);
}

export function ComplianceReview() {
	const activeTab = useComplianceReviewStore((state) => state.activeTab);
	const setActiveTab = useComplianceReviewStore((state) => state.setActiveTab);

	return (
		<div className="bg-background mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8 antialiased">
			<header className="mb-8 space-y-1">
				<h1 className="text-xl font-semibold tracking-tight text-foreground">
					Compliance review: UDAAP (Unfair, Deceptive, or Abusive Acts or
					Practices)
				</h1>
			</header>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="mb-4">
					<TabsTrigger value="review">UDAAP Review</TabsTrigger>
					<TabsTrigger value="action">Compliance Prompt Action</TabsTrigger>
				</TabsList>
				<ReviewTabContent />
				<ActionTabContent />
			</Tabs>
		</div>
	);
}
