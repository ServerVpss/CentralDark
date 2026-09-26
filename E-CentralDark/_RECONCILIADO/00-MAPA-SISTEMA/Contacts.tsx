import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Download, 
  Upload, 
  Mail, 
  Phone, 
  Tag as TagIcon,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  UserCheck,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { contactService, Contact } from "@/services/contactService";
import { useAuth } from "@/contexts/AuthContext";

export default function Contacts() {
  const { workspace } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar contatos reais
  useEffect(() => {
    if (workspace?.id) {
      loadContacts();
    }
  }, [workspace?.id]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.list(workspace!.id);
      setContacts(data as Contact[]);
    } catch (error) {
      toast.error("Erro ao carregar contatos");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleDelete = async (id: string) => {
    try {
      await contactService.delete(id);
      setContacts(contacts.filter(c => c.id !== id));
      toast.success("Contato removido com sucesso");
    } catch (error) {
      toast.error("Erro ao remover contato");
    }
  };

  const handleAddContact = async () => {
    if (!workspace?.id) return;
    
    try {
      const newContact = await contactService.create({
        workspace_id: workspace.id,
        name: "Novo Contato",
        phone: "+55119" + Math.floor(Math.random() * 90000000 + 10000000),
        tags: ["Lead"],
        notes: ""
      });
      setContacts([newContact as Contact, ...contacts]);
      toast.success("Novo contato adicionado ao banco!");
    } catch (error) {
      toast.error("Erro ao adicionar contato");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-primary" />
            Gestão de Contatos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seu CRM real conectado ao Supabase.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex gap-2">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button onClick={handleAddContact} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Novo Contato
          </Button>
        </div>
      </div>

      {/* Main Content: Filter & Table */}
      <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-background/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou telefone..." 
              className="pl-10 bg-background/50 border-border" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-mono text-muted-foreground animate-pulse">Sincronizando com Supabase...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow>
                  <TableHead className="w-[250px]">Contato</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredContacts.map((contact, i) => (
                    <motion.tr 
                      key={contact.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      className="group hover:bg-primary/5 transition-colors border-b border-border/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{contact.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold">{contact.name || "Sem Nome"}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {contact.id?.substring(0,8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{contact.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {contact.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] font-medium bg-primary/5 border-primary/20">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          {contact.is_blocked ? "Bloqueado" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border-border">
                            <DropdownMenuItem className="gap-2"><Edit className="w-3.5 h-3.5" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(contact.id!)}>
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredContacts.length === 0 && (
            <div className="py-20 text-center space-y-3">
               <Search className="w-12 h-12 text-muted-foreground/20 mx-auto" />
               <p className="text-muted-foreground italic">Nenhum contato encontrado no seu banco.</p>
               <Button variant="link" onClick={handleAddContact}>Adicionar primeiro contato</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
