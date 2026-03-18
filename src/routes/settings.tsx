import { LogOut, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light" as const, label: "ライト", icon: Sun },
  { value: "dark" as const, label: "ダーク", icon: Moon },
  { value: "system" as const, label: "システム", icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

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

      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-sm font-medium">テーマ</p>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-3 text-xs transition-colors",
                  theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
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
