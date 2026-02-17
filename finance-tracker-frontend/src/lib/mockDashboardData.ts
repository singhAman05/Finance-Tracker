// Mock data for dashboard components without backend support yet

export const mockUpcomingBills = [
    { id: 1, name: "Rent Payment", dueDate: "2024-03-01", amount: 12000.0 },
    { id: 2, name: "Netflix", dueDate: "2024-02-20", amount: 199.00 },
    { id: 3, name: "Car Insurance", dueDate: "2024-02-25", amount: 1500.0 },
    { id: 4, name: "Broadband", dueDate: "2024-02-28", amount: 999.0 },
];

export const mockFinancialGoals = [
    {
        id: 1,
        name: "Emergency Fund",
        target: 100000,
        current: 45000,
        deadline: "2024-12-31",
    },
    {
        id: 2,
        name: "Vacation Fund",
        target: 50000,
        current: 12000,
        deadline: "2024-06-15",
    },
    {
        id: 3,
        name: "New Laptop",
        target: 80000,
        current: 35000,
        deadline: "2024-04-30",
    },
];

export const mockBudgetData = {
    health: 78,
    used: 15400,
    total: 20000,
    spending: [
        { name: "Housing", value: 12000, color: "bg-blue-500" },
        { name: "Food", value: 4500, color: "bg-green-500" },
        { name: "Transport", value: 2400, color: "bg-yellow-500" },
        { name: "Entertainment", value: 1300, color: "bg-purple-500" },
        { name: "Utilities", value: 900, color: "bg-orange-500" },
    ]
};
