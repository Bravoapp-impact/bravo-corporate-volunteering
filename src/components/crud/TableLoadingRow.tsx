import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableLoadingRowProps {
  colSpan: number;
  message?: string;
}

export function TableLoadingRow({
  colSpan,
  message = "Caricamento...",
}: TableLoadingRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
