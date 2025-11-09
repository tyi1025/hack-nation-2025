import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend = 'neutral' }: MetricCardProps) {
  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground font-mono">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          trend === 'up' ? 'bg-success/10 text-success' :
          trend === 'down' ? 'bg-destructive/10 text-destructive' :
          'bg-primary/10 text-primary'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
