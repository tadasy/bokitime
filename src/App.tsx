import { Outlet } from "react-router";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function App() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
