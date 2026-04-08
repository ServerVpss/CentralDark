import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, User, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PixTransaction } from "@/hooks/usePixTransactions";

interface PixTransactionsTableProps {
  transactions: PixTransaction[] | undefined;
  isLoading: boolean;
}

export function PixTransactionsTable({ transactions, isLoading }: PixTransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset page when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  const totalItems = transactions?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = useMemo(
    () => transactions?.slice(startIndex, startIndex + pageSize) || [],
    [transactions, startIndex, pageSize]
  );

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

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
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Transações PIX ({totalItems})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Exibir:</span>
          <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[80px] h-8 bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
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

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} de {totalItems}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => goToPage(pageNum)}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
