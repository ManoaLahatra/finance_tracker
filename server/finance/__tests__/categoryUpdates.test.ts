import { describe, expect, it } from "vitest";
import { FinanceError } from "../errors/financeError";
import { createTestFinanceServices } from "./testFinanceServices";

describe("category updates", () => {
  it("updates category name", async () => {
    const { categories, queries } = createTestFinanceServices();
    const cat = await categories.createCategory({ name: "Old" });

    await categories.updateCategory(cat.id, { name: "New Name" });

    const all = await queries.listCategories();
    const updated = all.find((c) => c.id === cat.id)!;
    expect(updated.name).toBe("New Name");
  });

  it("sets a spending limit", async () => {
    const { categories, queries } = createTestFinanceServices();
    const cat = await categories.createCategory({ name: "Food" });

    await categories.updateCategory(cat.id, { monthlySpendingLimit: 500 });

    const updated = await queries.listCategories().then((c) => c.find((x) => x.id === cat.id)!);
    expect(updated.monthlySpendingLimit).toBe(500);
  });

  it("removes a spending limit", async () => {
    const { categories, queries } = createTestFinanceServices();
    const cat = await categories.createCategory({ name: "Food", monthlySpendingLimit: 300 });

    await categories.updateCategory(cat.id, { monthlySpendingLimit: null });

    const updated = await queries.listCategories().then((c) => c.find((x) => x.id === cat.id)!);
    expect(updated.monthlySpendingLimit).toBeNull();
  });

  it("throws when category not found", async () => {
    const { categories } = createTestFinanceServices();
    await expect(
      categories.updateCategory("nonexistent", { name: "X" }),
    ).rejects.toThrow(FinanceError);
  });
});
