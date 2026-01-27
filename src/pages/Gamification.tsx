import { Award, Crown, Gift, Medal, Star, Target, Trophy, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Level {
  level: number;
  name: string;
  xpRequired: number;
  reward: string;
  icon: React.ElementType;
  color: string;
}

const levels: Level[] = [
  { level: 1, name: "Iniciante", xpRequired: 0, reward: "Badge Iniciante", icon: Star, color: "text-muted-foreground" },
  { level: 5, name: "Aprendiz", xpRequired: 500, reward: "10% desconto", icon: Medal, color: "text-primary" },
  { level: 10, name: "Intermediário", xpRequired: 1500, reward: "Acesso Beta", icon: Award, color: "text-success" },
  { level: 15, name: "Avançado", xpRequired: 3000, reward: "Bot Extra Grátis", icon: Trophy, color: "text-warning" },
  { level: 20, name: "Expert", xpRequired: 5000, reward: "Suporte Prioritário", icon: Crown, color: "text-accent" },
  { level: 25, name: "Mestre", xpRequired: 8000, reward: "Consultoria Grátis", icon: Zap, color: "text-primary" },
];

const achievements = [
  { id: 1, name: "Primeiro Bot", description: "Criou seu primeiro bot", unlocked: true, icon: "🤖" },
  { id: 2, name: "Protetor", description: "Bloqueou 100 links de spam", unlocked: true, icon: "🛡️" },
  { id: 3, name: "Popular", description: "Alcançou 1000 usuários", unlocked: true, icon: "⭐" },
  { id: 4, name: "Maratonista", description: "30 dias consecutivos online", unlocked: false, icon: "🏃" },
  { id: 5, name: "Milionário", description: "1M de mensagens processadas", unlocked: false, icon: "💰" },
  { id: 6, name: "Lendário", description: "Alcançou nível 25", unlocked: false, icon: "👑" },
];

const leaderboard = [
  { rank: 1, name: "TechMaster Bot", xp: 12450, level: 22 },
  { rank: 2, name: "SuperAdmin", xp: 10230, level: 20 },
  { rank: 3, name: "BotKing", xp: 8790, level: 18 },
  { rank: 4, name: "Você", xp: 2450, level: 12, isYou: true },
  { rank: 5, name: "NovoBoteiro", xp: 2100, level: 11 },
];

export default function Gamification() {
  const currentXp = 2450;
  const currentLevel = 12;
  const nextLevelXp = 3000;
  const xpProgress = ((currentXp - 1500) / (nextLevelXp - 1500)) * 100;

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Gamificação</h1>
          <p className="text-muted-foreground">
            Ganhe XP, suba de nível e desbloqueie recompensas exclusivas
          </p>
        </div>

        {/* Current Progress */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <CardContent className="relative pt-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Level Circle */}
              <div className="relative">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="fill-none stroke-secondary"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="fill-none stroke-primary"
                      strokeWidth="12"
                      strokeDasharray="351.86"
                      strokeDashoffset={351.86 - (351.86 * xpProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold gradient-text">{currentLevel}</span>
                    <span className="text-xs text-muted-foreground">NÍVEL</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Trophy className="h-8 w-8 text-warning animate-pulse-slow" />
                </div>
              </div>

              {/* Progress Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">Mestre dos Bots</h2>
                <p className="text-muted-foreground">Continue assim! Você está indo muito bem.</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso para Nível 15</span>
                    <span className="font-medium text-primary">{currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-3 bg-secondary" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <div className="rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
                    +50 XP por bot ativo
                  </div>
                  <div className="rounded-full bg-success/10 px-4 py-1 text-sm text-success">
                    +10 XP por spam bloqueado
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Levels */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Níveis e Recompensas
                </CardTitle>
                <CardDescription>
                  Desbloqueie recompensas ao atingir novos níveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {levels.map((level) => {
                    const unlocked = currentLevel >= level.level;
                    return (
                      <div
                        key={level.level}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border p-4 transition-all",
                          unlocked
                            ? "border-primary/30 bg-primary/5"
                            : "border-border bg-secondary/20 opacity-60"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-xl p-3",
                            unlocked ? "bg-primary/20" : "bg-secondary"
                          )}
                        >
                          <level.icon className={cn("h-6 w-6", level.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Nível {level.level}</span>
                            <span className="text-sm text-muted-foreground">— {level.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {level.xpRequired.toLocaleString()} XP necessários
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-warning" />
                            <span className="text-sm font-medium">{level.reward}</span>
                          </div>
                          {unlocked && (
                            <span className="text-xs text-success">✓ Desbloqueado</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-warning" />
                  Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 transition-colors",
                        user.isYou ? "bg-primary/10 border border-primary/30" : "bg-secondary/30"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          user.rank === 1 && "bg-warning text-warning-foreground",
                          user.rank === 2 && "bg-muted-foreground/50 text-foreground",
                          user.rank === 3 && "bg-orange-600/50 text-foreground",
                          user.rank > 3 && "bg-secondary text-muted-foreground"
                        )}
                      >
                        {user.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium truncate", user.isYou && "text-primary")}>
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nível {user.level} • {user.xp.toLocaleString()} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg p-3 text-center transition-all",
                        achievement.unlocked
                          ? "bg-primary/10"
                          : "bg-secondary/30 opacity-50 grayscale"
                      )}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <span className="text-xs font-medium truncate w-full">
                        {achievement.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
