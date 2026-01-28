import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PixTransaction } from "@/hooks/usePixTransactions";

interface PixTransactionsTableProps {
  transactions: PixTransaction[] | undefined;
  isLoading: boolean;
}

export function PixTransactionsTable({ transactions, isLoading }: PixTransactionsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/20 text-success border-success/30">✓ Pago</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-warning border-warning/30">Pendente</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground">Expirado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Transações PIX
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Transações PIX
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground">Usuário</TableHead>
              <TableHead className="text-muted-foreground">Gateway</TableHead>
              <TableHead className="text-muted-foreground">Valor</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Memo/ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-border">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{format(new Date(transaction.created_at), "dd/MM", { locale: ptBR })}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Telegram {transaction.telegram_user_id || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-primary/10">
                        <CreditCard className="h-3 w-3 text-primary" />
                      </div>
                      <span className="uppercase text-xs font-medium">{transaction.gateway}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {Number(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {transaction.external_id || transaction.e2e_id || transaction.id.slice(0, 12)}...
                    </code>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma transação encontrada neste período
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
