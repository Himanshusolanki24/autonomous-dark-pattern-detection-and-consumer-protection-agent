import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABELS } from "@/lib/constants";
import { cn, severityTone } from "@/lib/utils";
import type { Severity } from "@/lib/types";

function SeverityBadge({ severity }: { severity: Severity }) {
  const tone = severityTone(severity);
  return (
    <Badge className={cn(tone.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}

export { SeverityBadge };