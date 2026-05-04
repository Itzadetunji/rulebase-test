import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CustomRuleMode } from "@/types/compliance";

const RULE_MODE_OPTIONS: Array<{ value: CustomRuleMode; label: string }> = [
	{ value: "default", label: "Default" },
	{ value: "custom", label: "Custom" },
	{ value: "combined", label: "Combined" },
];

type RuleModeSelectProps = {
	id: string;
	label?: string;
	value: CustomRuleMode;
	onValueChange: (value: CustomRuleMode) => void;
	disabled?: boolean;
};

export function RuleModeSelect({
	id,
	label = "Rule mode",
	value,
	onValueChange,
	disabled = false,
}: RuleModeSelectProps) {
	return (
		<div className="space-y-1.5">
			<Label
				htmlFor={id}
				className="text-sm font-medium"
			>
				{label}
			</Label>
			<Select
				value={value}
				onValueChange={(nextValue) => onValueChange(nextValue as CustomRuleMode)}
				disabled={disabled}
			>
				<SelectTrigger
					id={id}
					className="w-full"
				>
					<SelectValue placeholder="Select rule mode" />
				</SelectTrigger>
				<SelectContent position="popper">
					{RULE_MODE_OPTIONS.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
