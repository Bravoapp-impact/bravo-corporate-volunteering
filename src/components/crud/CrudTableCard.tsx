import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CrudSearchBar } from "./CrudSearchBar";
import { cn } from "@/lib/utils";

interface CrudTableCardProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  hideSearch?: boolean;
}

export function CrudTableCard({
  title,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Cerca...",
  filters,
  actions,
  children,
  className,
  hideSearch = false,
}: CrudTableCardProps) {
  const showSearchRow = !hideSearch && onSearchChange;

  return (
    <Card className={cn("border-border/50 bg-card/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          {/* Header row: title + actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>

          {/* Search and filters row */}
          {(showSearchRow || filters) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {showSearchRow && (
                <CrudSearchBar
                  value={searchValue}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder}
                  className="sm:w-64"
                />
              )}
              {filters && (
                <div className="flex flex-wrap items-center gap-2">
                  {filters}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
