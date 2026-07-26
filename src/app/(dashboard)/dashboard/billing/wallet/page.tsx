"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, AlertCircle } from "lucide-react";

interface WalletTransaction {
  id: string;
  type: "TOPUP" | "SERVICE_FEE" | "ADJUSTMENT" | "REFUND";
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/wallets/mine");
      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
    } catch {
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const isLow = balance !== null && balance <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet size={24} className="text-blue-600" />
          Service Wallet
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Prepaid balance used to cover the platform service fee whenever a charge is posted.
        </p>
      </div>

      <div className={`rounded-2xl p-6 border ${isLow ? "bg-red-50 border-red-200" : "bg-white border-slate-200 shadow-sm"}`}>
        <p className="text-sm text-slate-500">Current Balance</p>
        <p className={`text-4xl font-bold mt-1 ${isLow ? "text-red-700" : "text-slate-900"}`}>
          ₦{(balance ?? 0).toLocaleString()}
        </p>
        {isLow && (
          <div className="flex items-center gap-2 mt-3 text-sm text-red-700">
            <AlertCircle size={16} />
            Balance is at or below zero — posting charges may fail until this is topped up. Contact support to top up.
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No wallet activity yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit ? "bg-emerald-50" : "bg-red-50"}`}>
                      {isCredit ? (
                        <ArrowUpCircle size={16} className="text-emerald-600" />
                      ) : (
                        <ArrowDownCircle size={16} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tx.description ?? tx.type}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isCredit ? "text-emerald-700" : "text-red-700"}`}>
                      {isCredit ? "+" : ""}₦{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Balance: ₦{tx.balanceAfter.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}