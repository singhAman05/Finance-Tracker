import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MonthlyData } from "@/types/interfaces";

interface TrendsTabProps {
  monthlyData: MonthlyData[];
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
        <p className="font-bold">{label}</p>
        <p className="text-green-600">Income: ${payload[0].value.toFixed(2)}</p>
        <p className="text-red-600">Expenses: ${payload[1].value.toFixed(2)}</p>
        <p className="text-blue-600">
          Net: ${(payload[0].value - payload[1].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function TrendsTab({ monthlyData }: TrendsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
