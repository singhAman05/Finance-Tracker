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

export default function TransactionsTab({
  transactions,
  accountMap,
  categoryMap,
}: TransactionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
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
                const isExpense = tx.amount > 0;

                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.description || "Transaction"}
                    </TableCell>
                    <TableCell>{account?.name || "Unknown"}</TableCell>
                    <TableCell>{category?.name || "Uncategorized"}</TableCell>
                    <TableCell
                      className={`text-right ${
                        isExpense ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isExpense ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
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
