import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";

export default function AppSidebarExample() {
  return (
    <SidebarProvider>
      <div className="flex h-64">
        <AppSidebar />
        <div className="flex-1 p-4 bg-background">
          Conteúdo principal
        </div>
      </div>
    </SidebarProvider>
  );
}
