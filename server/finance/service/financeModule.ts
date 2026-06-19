import { PrismaClient } from "@prisma/client";
import { AccountService } from "./accountService";
import { CategoryService } from "./categoryService";
import { FinanceQueryService } from "./financeQueryService";
import { TransactionService } from "./transactionService";
import { PrismaFinanceRepository } from "../repository/prismaFinanceRepository";
import type { FinanceRepository } from "../repository/financeRepository";

export type FinanceModule = {
  accounts: AccountService;
  categories: CategoryService;
  transactions: TransactionService;
  queries: FinanceQueryService;
};

export const createFinanceModule = (
  repository?: FinanceRepository,
): FinanceModule => {
  const repo =
    repository ??
    new PrismaFinanceRepository(
      new PrismaClient(),
    );

  return {
    accounts: new AccountService(repo),
    categories: new CategoryService(repo),
    transactions: new TransactionService(repo),
    queries: new FinanceQueryService(repo),
  };
};
