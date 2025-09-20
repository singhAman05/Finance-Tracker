// addTransaction.tsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setCategories } from "../redux/slices/slice_categories"; // Import setCategories
import { RootState } from "@/app/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  fetchCategories,
  filterCategoriesByType,
  Category,
} from "@/service/service_categories";
import { fetchAccounts, getBankLogoUrl } from "@/service/service_accounts";
import { addTransactionService } from "@/service/service_transactions";
import { addTransaction } from "../redux/slices/slice_transactions";

export default function AddTransaction() {
  const dispatch = useDispatch();

  // Use Redux state for both accounts and categories
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accounts and categories if not already in Redux
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Fetch accounts if not in Redux
        if (accounts.length === 0) {
          const accountsData = await fetchAccounts();
          dispatch(setAccounts(accountsData));

          // Set default account if available
          if (accountsData.length > 0) {
            setAccountId(accountsData[0].id);
          }
        } else if (accountId === "" && accounts.length > 0) {
          // Set default account from existing Redux state
          setAccountId(accounts[0].id);
        }

        // Fetch categories if not in Redux
        if (categories.length === 0) {
          const categoriesData = await fetchCategories();
          dispatch(setCategories(categoriesData));
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load required data");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [open, accounts, categories, dispatch, accountId]);

  // Reset form when closing dialog
  useEffect(() => {
    if (!open) {
      setDate(new Date());
      setType("expense");
      setCategory("");
      setAmount("");
      setDescription("");
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [open, accounts]);

  const filteredCategories = filterCategoriesByType(categories, type);

  const onSubmit = async () => {
    if (!accountId || !category || !amount) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      account_id: accountId,
      category_id: category,
      amount: parseFloat(amount),
      date:
        date?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      description: description.trim() || undefined,
      is_recurring: false,
      recurrence_rule: undefined,
    };

    const result = await addTransactionService(payload);

    if (result.error) {
      console.error("Transaction Error:", result.error);
      alert("Failed to add transaction");
    } else {
      console.log("Transaction added successfully:", result.data);
      // Add to Redux state
      dispatch(addTransaction(result.data));
    }

    // Close dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm transition-all duration-300">
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-gray-200 shadow-xl">
        <div className="bg-white rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Transaction
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Record a transaction
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center p-6 text-red-500">
              <p>{error}</p>
              <Button className="mt-4" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="px-6 py-4">
                {/* Expense/Income Toggle */}
                <div className="bg-gray-100 rounded-lg p-1 flex mb-6">
                  <Button
                    variant={type === "expense" ? "default" : "ghost"}
                    className={`flex-1 py-2 rounded-md transition-all duration-300 ${
                      type === "expense"
                        ? "bg-gray-900 text-white shadow-sm hover:bg-gray-800"
                        : "text-gray-500 bg-transparent hover:bg-gray-200/50"
                    }`}
                    onClick={() => setType("expense")}
                  >
                    <Minus className="mr-2 h-4 w-4" /> Expense
                  </Button>
                  <Button
                    variant={type === "income" ? "default" : "ghost"}
                    className={`flex-1 py-2 rounded-md transition-all duration-300 ${
                      type === "income"
                        ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                        : "text-gray-500 bg-transparent hover:bg-gray-200/50"
                    }`}
                    onClick={() => setType("income")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Income
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Account Selection */}
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-gray-700 font-medium">Account</Label>
                    <Select value={accountId} onValueChange={setAccountId}>
                      <SelectTrigger className="bg-white border-gray-200 hover:border-gray-300 text-gray-700">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="border border-gray-200 shadow-md">
                        {accounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            className="hover:bg-gray-50 focus:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <img
                                src={getBankLogoUrl(account.bank)}
                                alt={account.bank}
                                className="w-6 h-6 mr-2 rounded-sm"
                              />
                              <div>
                                <span className="font-medium">
                                  {account.name}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  •••• {account.lastDigits}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 font-medium">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                        >
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-auto max-w-xs sm:max-w-sm overflow-auto border border-gray-200 shadow-md">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Category Selector */}
                  <div className="space-y-1">
                    <Label className="text-gray-700 font-medium">
                      Category
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white border-gray-200 hover:border-gray-300 text-gray-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border border-gray-200 shadow-md">
                        {filteredCategories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="hover:bg-gray-50 focus:bg-gray-50"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-gray-700 font-medium">Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">
                          {type === "expense" ? "-" : "+"}
                        </span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8 pr-12 py-2.5 border-gray-200 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-gray-700 font-medium">
                      Description
                    </Label>
                    <Input
                      placeholder="Add a note (optional)"
                      className="border-gray-200 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm transition-all duration-300"
                  onClick={onSubmit}
                >
                  Add Transaction
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
