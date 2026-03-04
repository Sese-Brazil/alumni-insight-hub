import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Active: 'bg-success/10 text-success',
  Inactive: 'bg-muted text-muted-foreground',
  Completed: 'bg-success/10 text-success',
  Pending: 'bg-warning/10 text-warning',
  'Not Started': 'bg-muted text-muted-foreground',
  Employed: 'bg-success/10 text-success',
  Unemployed: 'bg-destructive/10 text-destructive',
  'Self-Employed': 'bg-info/10 text-info',
  Freelancer: 'bg-info/10 text-info',
  'Further Studies': 'bg-primary/10 text-primary',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusStyles[status] || 'bg-muted text-muted-foreground', className)}>
      {status}
    </span>
  );
}
