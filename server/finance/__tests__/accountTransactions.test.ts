import { describe, expect, it } from "vitest";
import { FinanceError } from "../errors/financeError";
import { createTestFinanceServices } from "./testFinanceServices";

describe("account transaction rules", () => {
  it("updates account balance when income and expenses are recorded", async () => {
    const { accounts, categories, queries, transactions } =
      createTestFinanceServices();
    const account = await accounts.createAccount({
      name: "Checking",
      type: "checking",
      initialBalance: 100,
    });
    const salary = await categories.createCategory({ name: "Salary" });
    const food = await categories.createCategory({ name: "Food" });

    await transactions.createTransaction({
      accountId: account.id,
      categoryId: salary.id,
      type: "income",
      amount: 250,
      date: "2026-06-01",
    });
    await transactions.createTransaction({
      accountId: account.id,
      categoryId: food.id,
      type: "expense",
      amount: 75.25,
      date: "2026-06-02",
    });

    expect(await queries.listAccounts()).toEqual([
      expect.objectContaining({
        id: account.id,
        balance: 274.75,
      }),
    ]);
  });

  it("rejects an expense that would bring the account below zero", async () => {
    const { accounts, categories, transactions } = createTestFinanceServices();
    const account = await accounts.createAccount({
      name: "Cash",
      type: "cash",
      initialBalance: 20,
    });
    const food = await categories.createCategory({ name: "Food" });

    await expect(
      transactions.createTransaction({
        accountId: account.id,
        categoryId: food.id,
        type: "expense",
        amount: 20.01,
        date: "2026-06-03",
      }),
    ).rejects.toThrow(FinanceError);
  });

  it("does not delete an account that already has transactions", async () => {
    const { accounts, categories, transactions } = createTestFinanceServices();
    const account = await accounts.createAccount({
      name: "Savings",
      type: "savings",
      initialBalance: 100,
    });
    const salary = await categories.createCategory({ name: "Salary" });

    await transactions.createTransaction({
      accountId: account.id,
      categoryId: salary.id,
      type: "income",
      amount: 1,
      date: "2026-06-04",
    });

    await expect(accounts.deleteAccount(account.id)).rejects.toThrow(
      FinanceError,
    );
  });
});
