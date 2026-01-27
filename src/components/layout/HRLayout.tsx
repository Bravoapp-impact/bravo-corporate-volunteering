import { ReactNode } from "react";
import { BarChart3, Calendar, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AdminLayout, SidebarItem } from "./AdminLayout";

interface HRLayoutProps {
  children: ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/hr",
  },
  {
    label: "Esperienze",
    icon: Calendar,
    href: "/hr/experiences",
  },
  {
    label: "Dipendenti",
    icon: Users,
    href: "/hr/employees",
  },
];

export function HRLayout({ children }: HRLayoutProps) {
  const { profile } = useAuth();
  const companyName = profile?.companies?.name;

  const dropdownHeader = (
    <>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">
          {profile?.first_name} {profile?.last_name}
        </p>
        <p className="text-xs text-muted-foreground">{profile?.email}</p>
        {companyName && (
          <p className="text-xs text-primary mt-1">{companyName}</p>
        )}
      </div>
      <DropdownMenuSeparator />
    </>
  );

  return (
    <AdminLayout
      sidebarItems={sidebarItems}
      badgeLabel="HR Admin"
      profilePath="/hr/profile"
      basePath="/hr"
      showCompanyLogo
      dropdownHeader={dropdownHeader}
    >
      {children}
    </AdminLayout>
  );
}
