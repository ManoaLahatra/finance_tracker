import { describe, expect, it } from "vitest";
import { FinanceError } from "../errors/financeError";
import { createTestFinanceServices } from "./testFinanceServices";

describe("account updates", () => {
  it("updates account name", async () => {
    const { accounts, queries } = createTestFinanceServices();
    const acc = await accounts.createAccount({ name: "Old Name", type: "checking", initialBalance: 100 });

    await accounts.updateAccount(acc.id, { name: "New Name" });

    const all = await queries.listAccounts();
    const updated = all.find((a) => a.id === acc.id)!;
    expect(updated.name).toBe("New Name");
    expect(updated.type).toBe("checking");
    expect(updated.balance).toBe(100);
  });

  it("updates account type", async () => {
    const { accounts, queries } = createTestFinanceServices();
    const acc = await accounts.createAccount({ name: "Test", type: "checking", initialBalance: 50 });

    await accounts.updateAccount(acc.id, { type: "savings" });

    const updated = await queries.listAccounts().then((a) => a.find((x) => x.id === acc.id)!);
    expect(updated.type).toBe("savings");
  });

  it("throws on invalid account type", async () => {
    const { accounts } = createTestFinanceServices();
    const acc = await accounts.createAccount({ name: "Test", type: "checking", initialBalance: 0 });

    await expect(
      // @ts-expect-error testing invalid type
      accounts.updateAccount(acc.id, { type: "invalid" }),
    ).rejects.toThrow(FinanceError);
  });

  it("throws when account not found", async () => {
    const { accounts } = createTestFinanceServices();
    await expect(
      accounts.updateAccount("nonexistent", { name: "X" }),
    ).rejects.toThrow(FinanceError);
  });
});
