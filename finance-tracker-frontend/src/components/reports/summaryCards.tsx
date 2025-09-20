import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netWorthChange: number;
}

export default function SummaryCards({
  totalBalance,
  totalIncome,
  totalExpenses,
  netWorthChange,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
          <p className="text-muted-foreground text-sm mt-2">
            Across all accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">This period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">This period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Net Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${
              netWorthChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {netWorthChange >= 0 ? "+" : "-"}$
            {Math.abs(netWorthChange).toFixed(2)}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {netWorthChange >= 0 ? "Positive" : "Negative"} cash flow
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
