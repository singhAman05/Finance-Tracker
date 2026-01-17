import TransactionPage from "@/components/transactions/transactionPage";
import { cookies } from "next/headers";
export default function Dashboard() {
  cookies();
  return <TransactionPage />;
}
