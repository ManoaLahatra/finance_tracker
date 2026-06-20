import { describe, expect, it } from "vitest";
import { createTestFinanceServices } from "./testFinanceServices";

describe("category monthly limits", () => {
  it("allows a category limit overrun but returns a visible warning", async () => {
    const { accounts, categories, transactions } = createTestFinanceServices();
    const account = await accounts.createAccount({
      name: "Checking",
      type: "checking",
      initialBalance: 500,
    });
    const food = await categories.createCategory({
      name: "Food",
      monthlySpendingLimit: 100,
    });

    await transactions.createTransaction({
      accountId: account.id,
      categoryId: food.id,
      type: "expense",
      amount: 80,
      date: "2026-06-05",
    });

    const transaction = await transactions.createTransaction({
      accountId: account.id,
      categoryId: food.id,
      type: "expense",
      amount: 25,
      date: "2026-06-06",
    });

    expect(transaction.warning).toBe("Monthly limit exceeded for Food");
  });

  it("checks category monthly limits across accounts", async () => {
    const { accounts, categories, transactions } = createTestFinanceServices();
    const checking = await accounts.createAccount({
      name: "Checking",
      type: "checking",
      initialBalance: 500,
    });
    const cash = await accounts.createAccount({
      name: "Cash",
      type: "cash",
      initialBalance: 500,
    });
    const transport = await categories.createCategory({
      name: "Transport",
      monthlySpendingLimit: 100,
    });

    await transactions.createTransaction({
      accountId: checking.id,
      categoryId: transport.id,
      type: "expense",
      amount: 90,
      date: "2026-06-05",
    });

    const transaction = await transactions.createTransaction({
      accountId: cash.id,
      categoryId: transport.id,
      type: "expense",
      amount: 15,
      date: "2026-06-06",
    });

    expect(transaction.warning).toBe("Monthly limit exceeded for Transport");
  });
});
