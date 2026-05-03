import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	getMutationErrorMessage,
	useRunComplianceActionMutation,
} from "@/hooks/use-compliance-queries";
import { cn } from "@/lib/utils";
import { useComplianceReviewStore } from "@/stores/compliance-review-store";
import { SharedCsvUploadCard } from "./SharedCsvUploadCard";

export function ActionTabContent() {
	const file = useComplianceReviewStore((state) => state.file);
	const actionPrompt = useComplianceReviewStore((state) => state.actionPrompt);
	const setActionPrompt = useComplianceReviewStore(
		(state) => state.setActionPrompt,
	);
	const runComplianceActionMutation = useRunComplianceActionMutation();
	const loading = runComplianceActionMutation.isPending;

	const onRunComplianceAction = async () => {
		await runComplianceActionMutation.mutateAsync({
			file,
			prompt: actionPrompt,
		});
	};
	const actionStatusMessage = runComplianceActionMutation.isError
		? getMutationErrorMessage(runComplianceActionMutation.error)
		: runComplianceActionMutation.isSuccess
			? "Compliance action completed."
			: "";
	const actionStatusKind = runComplianceActionMutation.isError
		? "error"
		: "success";

	return (
		<TabsContent
			value="action"
			className="space-y-4"
		>
			<SharedCsvUploadCard disabled={loading} />

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
						onClick={() => void onRunComplianceAction()}
						disabled={loading}
						className="inline-flex items-center gap-2"
					>
						{runComplianceActionMutation.isPending ? (
							<>
								<Spinner className="size-4" />
								Running action
							</>
						) : (
							"Run action"
						)}
					</Button>
				</CardContent>
			</Card>

			{actionStatusMessage ? (
				<p
					className={cn(
						"text-xs",
						actionStatusKind === "error"
							? "text-destructive"
							: "text-muted-foreground",
					)}
				>
					{actionStatusMessage}
				</p>
			) : null}

			{runComplianceActionMutation.data ? (
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
								{runComplianceActionMutation.data.output}
							</ReactMarkdown>
						</div>
					</CardContent>
				</Card>
			) : null}
		</TabsContent>
	);
}
