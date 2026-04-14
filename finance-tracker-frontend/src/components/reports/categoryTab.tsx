"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import type { CategoryInsight } from "@/service/service_reports";

interface CategoriesTabProps {
  categoryData: CategoryInsight[];
}

export default function CategoriesTab({ categoryData }: CategoriesTabProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Category</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expense</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">Share</TableHead>
              <TableHead className="text-right pr-6">Tx Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryData.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-success">{formatCurrency(cat.income)}</TableCell>
                <TableCell className="text-right text-danger">{formatCurrency(cat.expenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(cat.net)}</TableCell>
                <TableCell className="text-right">{cat.shareOfExpense.toFixed(1)}%</TableCell>
                <TableCell className="text-right pr-6">{cat.txCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
