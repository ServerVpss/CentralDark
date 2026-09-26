import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { Smartphone, Plug, Trash2, Camera, User as UserIcon, PlayCircle } from "lucide-react";
import { openGuidedTour } from "@/components/onboarding/GuidedTour";

export const Route = createFileRoute("/app/configuracoes")({ component: Settings });

function Settings() {
  const { user } = useAuth();
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email, phone")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setProfilePhone(profile?.phone ?? "");
  }, [profile?.full_name, profile?.phone]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sem usuário");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null, phone: profilePhone || null })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Perfil atualizado"); refetchProfile(); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Sem usuário logado. Faça login de novo.");
      if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem (JPG, PNG ou WEBP).");
      if (file.size > 5 * 1024 * 1024) throw new Error("Imagem maior que 5MB. Escolha uma menor.");

      // Garante que a sessão tá viva antes de subir (foto da câmera no celular costuma demorar e o token pode ter expirado)
      const { data: sess, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !sess.session) {
        throw new Error("Sessão expirada. Saia e entre de novo para enviar a foto.");
      }

      // Sanitiza extensão: deriva do MIME quando o arquivo vier sem extensão (típico de câmera mobile)
      const mimeToExt: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/heic": "heic",
        "image/heif": "heif",
      };
      const validExts = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);
      const rawExt = (file.name.includes(".") ? file.name.split(".").pop() || "" : "").toLowerCase();
      const ext = validExts.has(rawExt) ? rawExt : (mimeToExt[file.type] ?? "jpg");
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      setUploadProgress(10);

      // Upload via SDK (token automático + erro estruturado)
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
        });

      if (upErr) {
        const msg = upErr.message?.toLowerCase() ?? "";
        if (msg.includes("row-level security") || msg.includes("unauthorized") || msg.includes("403")) {
          throw new Error("Sem permissão para enviar a foto. Tente sair e entrar de novo.");
        }
        if (msg.includes("payload too large") || msg.includes("413")) {
          throw new Error("Arquivo muito grande para o servidor.");
        }
        throw new Error(`Falha ao enviar a foto: ${upErr.message}`);
      }

      setUploadProgress(90);

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_url: pub.publicUrl })
        .eq("id", user.id);
      if (profErr) throw new Error(`Foto enviada, mas não consegui salvar no perfil: ${profErr.message}`);

      setUploadProgress(100);
    },
    onSuccess: () => {
      toast.success("Foto atualizada");
      refetchProfile();
      qc.invalidateQueries({ queryKey: ["profile"] });
      setTimeout(() => setUploadProgress(0), 600);
    },
    onError: (e: Error) => {
      toast.error(friendlyError(e));
      setUploadProgress(0);
    },
  });

  const removeAvatar = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sem usuário");
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Foto removida"); refetchProfile(); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });


  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: conns } = useQuery({
    queryKey: ["wa-connections", ws?.id],
    enabled: !!ws?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_connections")
        .select("id, name, phone, provider, status, created_at").eq("workspace_id", ws!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addConn = useMutation({
    mutationFn: async () => {
      if (!ws?.id || !name) throw new Error("Nome obrigatório");
      const { error } = await supabase.from("whatsapp_connections").insert({
        workspace_id: ws.id, name, phone: phone || null, provider: "mock", status: "disconnected",
      });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); setPhone(""); qc.invalidateQueries({ queryKey: ["wa-connections"] }); toast.success("Conexão criada"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const delConn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wa-connections"] }); toast.success("Removida"); },
  });

  // [SEGURANÇA] Removido bloco "Tornar-me Super Admin" que aparecia pra qualquer
  // usuário autenticado sem super admin no sistema. Bootstrap agora é só por
  // backend com allowlist (BOOTSTRAP_SUPER_ADMIN_EMAILS) — ver claimSuperAdmin.



  const userInitials = (fullName || profile?.email || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Seu perfil e conexões.</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Meu perfil</h2>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              {/* Anel de progresso em volta do avatar */}
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  className="stroke-muted/40"
                  strokeWidth="4"
                />
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  className={uploadAvatar.isPending ? "stroke-primary" : "stroke-primary/0"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - uploadProgress / 100)}
                  style={{ transition: "stroke-dashoffset 200ms ease-out" }}
                />
              </svg>

              <Avatar className="absolute inset-1 h-[88px] w-[88px]">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={fullName || "Você"} />
                <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">{userInitials}</AvatarFallback>
              </Avatar>

              {/* Overlay durante upload */}
              {uploadAvatar.isPending && (
                <div className="absolute inset-1 grid h-[88px] w-[88px] place-items-center rounded-full bg-black/45 text-white">
                  <span className="text-xs font-bold tabular-nums">{uploadProgress}%</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-card hover:bg-primary/90 disabled:opacity-50"
                aria-label="Alterar foto"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadAvatar.mutate(f);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{profile?.email ?? ""}</p>
              <p className="text-xs text-muted-foreground">
                {uploadAvatar.isPending ? `Enviando foto... ${uploadProgress}%` : "JPG ou PNG, até 5MB"}
              </p>
              {profile?.avatar_url && !uploadAvatar.isPending && (
                <button
                  type="button"
                  onClick={() => removeAvatar.mutate()}
                  className="mt-1 text-xs text-destructive hover:underline"
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nome completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+55 11 99999-0000" />
            </div>
          </div>

          <div>
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              Salvar perfil
            </Button>
          </div>
        </div>
      </section>

      {/* Tour guiado — pode ser refeito a qualquer momento */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Tour guiado</h2>
        </div>
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Refazer o tour de boas-vindas</p>
            <p className="text-xs text-muted-foreground">
              Mostra de novo, passo a passo, as principais áreas do MultiZap.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              openGuidedTour();
              toast.success("Tour reiniciado");
            }}
          >
            <PlayCircle className="mr-2 h-4 w-4" /> Refazer tour
          </Button>
        </div>
      </section>


      {/* [SEGURANÇA] Card "Painel Master / Tornar-me Super Admin" removido daqui.
          Nunca pode aparecer pra usuário comum do workspace. Bootstrap de
          Super Admin só por backend, com allowlist via env e somente se ainda
          não existir nenhum Super Admin. */}



      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Conexões WhatsApp</h2>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome da conexão</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vendas BR" /></div>
            <div><Label>Telefone (opcional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-0000" /></div>
          </div>
          <Button onClick={() => addConn.mutate()} disabled={addConn.isPending}>
            <Plug className="mr-2 h-4 w-4" /> Adicionar conexão
          </Button>
        </div>

        <div className="space-y-2">
          {(conns ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone ?? "sem número"} · {c.provider}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 text-xs ${c.status === "connected" ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-500/10 text-zinc-500"}`}>
                  {c.status}
                </span>
                <Button size="icon" variant="ghost" onClick={() => delConn.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {(!conns || conns.length === 0) && <p className="text-sm text-muted-foreground">Nenhuma conexão cadastrada.</p>}
        </div>
      </section>
    </div>
  );
}
