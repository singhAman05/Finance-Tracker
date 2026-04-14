"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import { useDateFormat } from "@/hooks/useDateFormat";
import type { Transaction } from "@/types/interfaces";

interface TransactionsTabProps {
  transactions: Transaction[];
  accountMap: Record<string, any>;
  categoryMap: Record<string, any>;
}

export default function TransactionsTab({ transactions, accountMap, categoryMap }: TransactionsTabProps) {
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const sorted = transactions
    .slice()
    .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
    .slice(0, 100);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right pr-6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="pl-6">{formatDate(tx.date)}</TableCell>
                <TableCell>{tx.description || "Transaction"}</TableCell>
                <TableCell>{categoryMap[tx.category_id]?.name || "Unknown"}</TableCell>
                <TableCell>{accountMap[tx.account_id]?.name || "Unknown"}</TableCell>
                <TableCell className={`text-right pr-6 ${tx.type === "income" ? "text-success" : "text-danger"}`}>
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(Number(tx.amount) || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
