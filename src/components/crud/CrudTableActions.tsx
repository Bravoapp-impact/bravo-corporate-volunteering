import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CrudTableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  size?: "sm" | "default";
  className?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function CrudTableActions({
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  size = "sm",
  className,
  editLabel = "Modifica",
  deleteLabel = "Elimina",
}: CrudTableActionsProps) {
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className={buttonSize}
          onClick={onEdit}
          title={editLabel}
        >
          <Pencil className={iconSize} />
          <span className="sr-only">{editLabel}</span>
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(buttonSize, "text-destructive hover:text-destructive hover:bg-destructive/10")}
          onClick={onDelete}
          title={deleteLabel}
        >
          <Trash2 className={iconSize} />
          <span className="sr-only">{deleteLabel}</span>
        </Button>
      )}
    </div>
  );
}
