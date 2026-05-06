"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import { getLocaleForCurrency } from "@/lib/utils";

interface BankCardProps {
  bankName: string;
  cardNumber: string;
  balance?: number; // optional if you want to make it flexible
}

export function BankCard({ bankName, cardNumber, balance = 0 }: BankCardProps) {
  const { symbol, currency } = useCurrency();
  return (
    <Card className="w-full md:w-72 rounded-xl shadow-lg bg-gradient-to-br from-indigo-600 to-purple-500 text-white transition-transform hover:scale-105 duration-300">
      <CardContent className="p-5 space-y-3">
        <div className="text-xl font-semibold">{bankName}</div>
        <div className="text-sm tracking-widest">{cardNumber}</div>
        <div className="text-2xl font-bold mt-4">
          {symbol}{balance.toLocaleString(getLocaleForCurrency(currency))}
        </div>
      </CardContent>
    </Card>
  );
}
