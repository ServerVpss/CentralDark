import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Crown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuthContext } from "@/shared/auth/AuthProvider";

export function MobileAvatarMenu() {
  const { user, profile, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0 overflow-hidden">
          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-3d-primary">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs">
          <div className="flex items-center gap-1">
            {profile?.full_name || "Usuário"}
            <Crown className="h-3 w-3 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground font-normal truncate">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer text-xs">
          <Settings className="mr-2 h-3.5 w-3.5" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive text-xs">
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
