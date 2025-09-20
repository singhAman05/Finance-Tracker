import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export default function CategoriesTab({ categoryData }: CategoriesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryData
              .toSorted((a, b) => b.net - a.net)
              .map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right text-green-600">
                    ${category.income.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    ${category.expenses.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      category.net >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${category.net.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{category.count}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
