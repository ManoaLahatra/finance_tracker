import { describe, expect, it } from "vitest";
import { FinanceError } from "../errors/financeError";
import { createTestFinanceServices } from "./testFinanceServices";

describe("transfers between accounts", () => {
  it("transfers money from one account to another", async () => {
    const { accounts, queries, transactions } = createTestFinanceServices();
    const from = await accounts.createAccount({ name: "Checking", type: "checking", initialBalance: 500 });
    const to = await accounts.createAccount({ name: "Savings", type: "savings", initialBalance: 200 });

    await transactions.transfer({
      fromAccountId: from.id,
      toAccountId: to.id,
      amount: 150,
      date: "2026-06-15",
    });

    const allAccounts = await queries.listAccounts();
    const fromUpdated = allAccounts.find((a) => a.id === from.id)!;
    const toUpdated = allAccounts.find((a) => a.id === to.id)!;
    expect(fromUpdated.balance).toBe(350);
    expect(toUpdated.balance).toBe(350);
  });

  it("rejects transfer to the same account", async () => {
    const { accounts, transactions } = createTestFinanceServices();
    const acc = await accounts.createAccount({ name: "Same", type: "checking", initialBalance: 100 });

    await expect(
      transactions.transfer({
        fromAccountId: acc.id,
        toAccountId: acc.id,
        amount: 50,
        date: "2026-06-15",
      }),
    ).rejects.toThrow(FinanceError);
  });

  it("rejects transfer when source has insufficient funds", async () => {
    const { accounts, transactions } = createTestFinanceServices();
    const from = await accounts.createAccount({ name: "Poor", type: "checking", initialBalance: 10 });
    const to = await accounts.createAccount({ name: "Rich", type: "savings", initialBalance: 1000 });

    await expect(
      transactions.transfer({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: 50,
        date: "2026-06-15",
      }),
    ).rejects.toThrow(FinanceError);
  });

  it("creates two transactions (expense from source, income to dest)", async () => {
    const { accounts, queries, transactions } = createTestFinanceServices();
    const from = await accounts.createAccount({ name: "A", type: "checking", initialBalance: 100 });
    const to = await accounts.createAccount({ name: "B", type: "savings", initialBalance: 0 });

    await transactions.transfer({
      fromAccountId: from.id,
      toAccountId: to.id,
      amount: 60,
      date: "2026-06-15",
      note: "test note",
    });

    const allTxns = await queries.listTransactions();
    expect(allTxns).toHaveLength(2);

    const outTxn = allTxns.find((t) => t.accountId === from.id);
    const inTxn = allTxns.find((t) => t.accountId === to.id);
    expect(outTxn).toBeDefined();
    expect(inTxn).toBeDefined();
    expect(outTxn!.type).toBe("expense");
    expect(outTxn!.amount).toBe(60);
    expect(inTxn!.type).toBe("income");
    expect(inTxn!.amount).toBe(60);
    expect(outTxn!.note).toContain("test note");
    expect(inTxn!.note).toContain("test note");
  });

  it("excludes transfers from summary income/expenses", async () => {
    const { accounts, categories, queries, transactions } = createTestFinanceServices();
    const from = await accounts.createAccount({ name: "Checking", type: "checking", initialBalance: 1000 });
    const to = await accounts.createAccount({ name: "Savings", type: "savings", initialBalance: 0 });
    const salary = await categories.createCategory({ name: "Salary" });

    await transactions.createTransaction({
      accountId: from.id,
      categoryId: salary.id,
      type: "income",
      amount: 500,
      date: "2026-06-01",
    });
    await transactions.transfer({
      fromAccountId: from.id,
      toAccountId: to.id,
      amount: 200,
      date: "2026-06-10",
    });

    const summary = await queries.getMonthlySummary(from.id, "2026-06");
    expect(summary.totalIncome).toBe(500);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.totalTransferOut).toBe(200);
    expect(summary.totalTransferIn).toBe(0);
  });
});
