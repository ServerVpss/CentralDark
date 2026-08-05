import { auth, defineMcp } from "@lovable.dev/mcp-js";
import meuPerfil from "./tools/meu-perfil";
import listarRoadmap from "./tools/listar-roadmap";
import criarItemRoadmap from "./tools/criar-item-roadmap";
import saudeDosModulos from "./tools/saude-dos-modulos";
import listarModulosPortal from "./tools/listar-modulos-portal";

// O emissor OAuth precisa ser o host direto do Supabase, montado a partir do
// project ref (inlinado pelo Vite no build).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "centraldark",
  title: "CentralDark",
  version: "0.1.0",
  instructions:
    "Ferramentas do CentralDark. Use `meu_perfil` para saber quem está conectado, `listar_roadmap` e `criar_item_roadmap` para o roadmap do projeto, `saude_dos_modulos` para o estado operacional e `listar_modulos_portal` para os módulos publicados. Tudo roda com a permissão do usuário conectado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [meuPerfil, listarRoadmap, criarItemRoadmap, saudeDosModulos, listarModulosPortal],
});
