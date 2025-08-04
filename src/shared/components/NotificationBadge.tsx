import { Badge } from "./Badge";
import { cn } from "@/shared/utils/lib";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
}

export function NotificationBadge({ 
  count, 
  className,
  showZero = false 
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className={cn(
        "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
} 