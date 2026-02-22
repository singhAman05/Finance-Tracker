import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Transaction } from "@/types/interfaces";

interface TransactionsTabProps {
  transactions: Transaction[];
  accountMap: Record<string, any>;
  categoryMap: Record<string, any>;
}

import { Calendar, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function TransactionsTab({
  transactions,
  accountMap,
  categoryMap,
}: TransactionsTabProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="block font-bold text-text-primary">Transaction History</span>
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">{transactions.length} items found</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
              <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Date</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Description</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Account</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions
              .toSorted(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((tx) => {
                const account = accountMap[tx.account_id];
                const category = categoryMap[tx.category_id];
                const isExpense = tx.type === "expense";

                return (
                  <TableRow key={tx.id} className="group hover:bg-muted transition-colors border-b border-border last:border-0">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center text-xs text-text-secondary font-medium">
                        <Calendar className="mr-2 h-3.5 w-3.5 opacity-60" />
                        {format(new Date(tx.date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight text-text-primary">
                          {tx.description || "Transaction"}
                        </span>
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-black mt-0.5">
                          {category?.name || "Uncategorized"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-xs font-bold text-text-secondary px-2.5 py-1 rounded-full bg-muted border border-border">
                        {account?.name || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8 py-4">
                      <span
                        className={cn(
                          "font-mono font-bold text-sm tracking-tight",
                          isExpense ? "text-danger" : "text-success"
                        )}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
