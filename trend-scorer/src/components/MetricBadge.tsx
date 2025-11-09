import { LucideIcon } from "lucide-react";

interface MetricBadgeProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function MetricBadge({ icon: Icon, label, value, variant = 'default' }: MetricBadgeProps) {
  const variantStyles = {
    default: 'bg-secondary/50 text-foreground',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20'
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border ${variantStyles[variant]}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold font-mono">{value}</span>
      </div>
    </div>
  );
}
