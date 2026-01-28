import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "skeleton rounded-lg bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-light rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 animate-pulse">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
  );
}
