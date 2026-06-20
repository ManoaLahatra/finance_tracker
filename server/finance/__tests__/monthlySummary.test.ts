import { describe, expect, it } from "vitest";
import { createTestFinanceServices } from "./testFinanceServices";

describe("monthly summary", () => {
  it("includes income, expenses, net balance, and category progress", async () => {
    const { accounts, categories, queries, transactions } =
      createTestFinanceServices();
    const account = await accounts.createAccount({
      name: "Checking",
      type: "checking",
      initialBalance: 100,
    });
    const salary = await categories.createCategory({ name: "Salary" });
    const transport = await categories.createCategory({
      name: "Transport",
      monthlySpendingLimit: 120,
    });

    await transactions.createTransaction({
      accountId: account.id,
      categoryId: salary.id,
      type: "income",
      amount: 1000,
      date: "2026-06-01",
    });
    await transactions.createTransaction({
      accountId: account.id,
      categoryId: transport.id,
      type: "expense",
      amount: 30,
      date: "2026-06-10",
    });
    await transactions.createTransaction({
      accountId: account.id,
      categoryId: transport.id,
      type: "expense",
      amount: 20,
      date: "2026-07-01",
    });

    expect(await queries.getMonthlySummary(account.id, "2026-06")).toEqual({
      accountId: account.id,
      month: "2026-06",
      totalIncome: 1000,
      totalExpenses: 30,
      totalTransferIn: 0,
      totalTransferOut: 0,
      netBalance: 1050,
      spendingByCategory: [
        {
          categoryId: transport.id,
          categoryName: "Transport",
          spent: 30,
          monthlySpendingLimit: 120,
          progress: 0.25,
        },
      ],
    });
  });
});
