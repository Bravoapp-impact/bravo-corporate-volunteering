import { LucideIcon } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableEmptyRowProps {
  colSpan: number;
  icon?: LucideIcon;
  message?: string;
  description?: string;
}

export function TableEmptyRow({
  colSpan,
  icon: Icon,
  message = "Nessun elemento trovato",
  description,
}: TableEmptyRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          {Icon && <Icon className="h-8 w-8 opacity-50" />}
          <p className="font-medium">{message}</p>
          {description && <p className="text-sm">{description}</p>}
        </div>
      </TableCell>
    </TableRow>
  );
}
