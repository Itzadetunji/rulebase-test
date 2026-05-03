import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { useComplianceReviewStore } from "@/stores/compliance-review-store";

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

type SharedCsvUploadCardProps = {
	disabled?: boolean;
};

export function SharedCsvUploadCard({ disabled = false }: SharedCsvUploadCardProps) {
	const file = useComplianceReviewStore((state) => state.file);
	const setFile = useComplianceReviewStore((state) => state.setFile);
	const loading = disabled;

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
