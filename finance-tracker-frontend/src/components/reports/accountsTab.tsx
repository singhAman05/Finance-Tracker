"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import type { AccountInsight } from "@/service/service_reports";

interface AccountsTabProps {
  accountData: AccountInsight[];
}

export default function AccountsTab({ accountData }: AccountsTabProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Account Analysis</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Account</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expense</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right pr-6">Tx Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountData.map((acc) => (
              <TableRow key={acc.id}>
                <TableCell className="pl-6">{acc.name}</TableCell>
                <TableCell>{acc.bankName}</TableCell>
                <TableCell className="text-right text-success">{formatCurrency(acc.income)}</TableCell>
                <TableCell className="text-right text-danger">{formatCurrency(acc.expenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(acc.net)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(acc.balance)}</TableCell>
                <TableCell className="text-right pr-6">{acc.txCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
