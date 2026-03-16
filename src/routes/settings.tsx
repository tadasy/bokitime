import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-24 pt-4">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="h-12 w-12 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full gap-2 text-destructive"
        onClick={() => logout()}
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        BokiTime v1.0.0
      </p>
    </div>
  );
}
