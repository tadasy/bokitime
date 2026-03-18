import { Outlet } from "react-router";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function App() {
  return (
    <AuthGuard>
      <div className="flex h-full flex-col bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
