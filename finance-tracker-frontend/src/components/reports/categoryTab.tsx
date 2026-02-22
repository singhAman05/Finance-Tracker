import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CategoryAnalysis } from "@/types/interfaces";

interface CategoriesTabProps {
  categoryData: CategoryAnalysis[];
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function CategoriesTab({ categoryData }: CategoriesTabProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="block font-bold text-text-primary">Category Breakdown</span>
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Full distribution list</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
              <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-left">Category</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Income</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Expenses</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Net Flow</TableHead>
              <TableHead className="pr-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Transactions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryData
              .toSorted((a, b) => b.expenses - a.expenses)
              .map((category) => (
                <TableRow key={category.id} className="group hover:bg-muted transition-colors border-b border-border last:border-0">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color || "var(--primary)" }} />
                      <span className="font-bold text-sm tracking-tight text-text-primary truncate max-w-[150px]">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm font-medium text-success">
                      {formatCurrency(category.income)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm font-medium text-danger">
                      {formatCurrency(category.expenses)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono text-sm font-bold ${category.net >= 0 ? "text-success" : "text-danger"}`}>
                      {category.net >= 0 ? "+" : ""}{formatCurrency(category.net)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <span className="text-xs font-bold text-text-secondary">
                      {category.count} <span className="font-normal opacity-60 ml-0.5 text-[10px] uppercase tracking-wider">txns</span>
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
