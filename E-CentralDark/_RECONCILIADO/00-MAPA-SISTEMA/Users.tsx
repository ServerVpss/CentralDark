import React, { useState } from "react";
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  UserCheck, 
  Mail,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Key,
  Users as UsersIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// --- Mock Data ---
const MOCK_USERS = [
  { id: "1", name: "Administrador Root", email: "admin@wabot.local", role: "Owner", status: "active", lastLogin: "Agora", avatar: "" },
  { id: "2", name: "Carlos Eduardo", email: "carlos@vendas.com", role: "Admin", status: "active", lastLogin: "Há 12 min", avatar: "" },
  { id: "3", name: "Maria Oliveira", email: "maria@suporte.com", role: "Member", status: "active", lastLogin: "Há 1h", avatar: "" },
  { id: "4", name: "João Silva", email: "joao@atendimento.com", role: "Viewer", status: "inactive", lastLogin: "Há 2 dias", avatar: "" },
  { id: "5", name: "Ana Beatriz", email: "ana@mkt.com", role: "Member", status: "active", lastLogin: "Hoje 08:00", avatar: "" },
];

export default function Users() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (id === "1") {
      toast.error("O proprietário root não pode ser removido!");
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    toast.error("Usuário removido do workspace");
  };

  const inviteUser = () => {
    toast.success("Convite enviado por e-mail!");
    const newUser = {
      id: Date.now().toString(),
      name: "Convidado Pendente",
      email: "invite@email.com",
      role: "Member",
      status: "pending",
      lastLogin: "Nunca",
      avatar: ""
    };
    setUsers([newUser, ...users]);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Owner": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1.5"><ShieldAlert className="w-3 h-3" /> Proprietário</Badge>;
      case "Admin": return <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5"><ShieldCheck className="w-3 h-3" /> Administrador</Badge>;
      case "Member": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5"><UserCheck className="w-3 h-3" /> Membro</Badge>;
      case "Viewer": return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 gap-1.5"><Clock className="w-3 h-3" /> Visualizador</Badge>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-primary" />
            Equipe & Membros
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie quem tem acesso ao seu console e defina níveis de permissão.</p>
        </div>
        <Button onClick={inviteUser} className="gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="w-4 h-4" /> Convidar Membro
        </Button>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card/40 border border-border rounded-2xl backdrop-blur-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <UsersIcon className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Total de Membros</p>
              <h3 className="text-2xl font-black">{users.length} <span className="text-sm font-normal text-muted-foreground">/ 10</span></h3>
           </div>
        </div>
        <div className="p-5 bg-card/40 border border-border rounded-2xl backdrop-blur-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Online Agora</p>
              <h3 className="text-2xl font-black">2</h3>
           </div>
        </div>
        <div className="p-5 bg-card/40 border border-border rounded-2xl backdrop-blur-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <Key className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Convites Pendentes</p>
              <h3 className="text-2xl font-black">1</h3>
           </div>
        </div>
      </div>

      {/* Main Content: Table */}
      <div className="bg-card/40 border border-border rounded-2xl backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-border bg-background/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou e-mail..." 
              className="pl-10 bg-background/50 border-border h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2"><Filter className="w-4 h-4" /> Filtros</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/30">
              <TableRow className="border-border/50">
                <TableHead className="w-[300px]">Membro</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-border/50 group hover:bg-primary/[0.02] transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                       <Badge className={
                         user.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                         user.status === "pending" ? "bg-warning/10 text-warning border-warning/20" :
                         "bg-muted text-muted-foreground border-border"
                       }>
                         {user.status === "active" ? "ATIVO" : user.status === "pending" ? "PENDENTE" : "INATIVO"}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                       {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-border w-48">
                          <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Editar Membro</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Key className="w-4 h-4" /> Redefinir Permissões</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive" 
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === "1"}
                          >
                            <Trash2 className="w-4 h-4" /> Remover Membro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length === 0 && (
           <div className="py-20 text-center space-y-4">
              <UsersIcon className="w-16 h-16 text-muted-foreground/10 mx-auto" />
              <p className="text-muted-foreground italic">Nenhum membro encontrado.</p>
           </div>
        )}
      </div>

      {/* Security Tip Box */}
      <motion.div variants={fadeUp} className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-sm">
         <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
         <div className="space-y-1">
            <h4 className="text-sm font-bold">Gerenciamento de Roles (RBAC)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
               Cada nível de acesso (Proprietário, Admin, Membro, Visualizador) possui permissões específicas. 
               Recomendamos manter o número de administradores o menor possível para garantir a integridade dos dados e conexões.
            </p>
         </div>
      </motion.div>
    </div>
  );
}
