import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { AccountAnalysis } from "@/types/interfaces";

interface AccountsTabProps {
  accountData: AccountAnalysis[];
}

import { Landmark } from "lucide-react";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function AccountsTab({ accountData }: AccountsTabProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="block font-bold text-text-primary">Account Analysis</span>
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Asset Performance</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
              <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-left">Account</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Income</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Expenses</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Net Flow</TableHead>
              <TableHead className="pr-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountData
              .toSorted((a, b) => b.currentBalance - a.currentBalance)
              .map((account) => (
                <TableRow key={account.id} className="group hover:bg-muted transition-colors border-b border-border last:border-0">
                  <TableCell className="pl-8 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight text-text-primary truncate max-w-[180px]">{account.name}</span>
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-medium mt-0.5">{account.bankName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm font-medium text-success">
                      {formatCurrency(account.income)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm font-medium text-danger">
                      {formatCurrency(account.expenses)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono text-sm font-bold ${account.net >= 0 ? "text-success" : "text-danger"}`}>
                      {account.net >= 0 ? "+" : ""}{formatCurrency(account.net)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <span className="font-mono text-sm font-black text-text-primary">
                      {formatCurrency(account.currentBalance)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
