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

export default function AccountsTab({ accountData }: AccountsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Net Flow</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountData
              .toSorted((a, b) => b.currentBalance - a.currentBalance)
              .map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.name} ({account.bankName})
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    ${account.income.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    ${account.expenses.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      account.net >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${account.net.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${account.currentBalance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
