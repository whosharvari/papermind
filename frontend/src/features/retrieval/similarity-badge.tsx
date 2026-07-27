import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatSimilarity, similarityTier } from "@/lib/similarity";

const TIER_CLASSES: Record<ReturnType<typeof similarityTier>, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

interface SimilarityBadgeProps {
  score: number;
}

export function SimilarityBadge({ score }: SimilarityBadgeProps) {
  const tier = similarityTier(score);
  return (
    <Badge variant="outline" className={cn("border-transparent font-mono", TIER_CLASSES[tier])}>
      {formatSimilarity(score)}
    </Badge>
  );
}
