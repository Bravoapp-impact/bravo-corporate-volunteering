import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
  className?: string;
}

export function LoadingState({
  message = "Caricamento...",
  fullHeight = true,
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullHeight ? "min-h-[60vh]" : "py-12"
      } ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
