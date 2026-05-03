import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComplianceReviewStore } from "@/stores/compliance-review-store";
import { ActionTabContent } from "@/components/compliance-review/ActionTabContent";
import { CustomRulesTabContent } from "@/components/compliance-review/CustomRulesTabContent";
import { ReviewTabContent } from "@/components/compliance-review/ReviewTabContent";

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
					<TabsTrigger value="custom-rules">Business Rules</TabsTrigger>
				</TabsList>
				<ReviewTabContent />
				<ActionTabContent />
				<CustomRulesTabContent />
			</Tabs>
		</div>
	);
}
