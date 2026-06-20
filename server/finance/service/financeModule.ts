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

const createPrismaClient = (): Promise<PrismaClient> => {
  if (process.env.VERCEL === '1') {
    return import('@prisma/adapter-libsql').then(({ PrismaLibSQL }) => {
      const adapter = new PrismaLibSQL({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      return new PrismaClient({ adapter });
    });
  }
  return Promise.resolve(new PrismaClient());
};

export const createFinanceModule = async (
  repository?: FinanceRepository,
): Promise<FinanceModule> => {
  const repo =
    repository ??
    new PrismaFinanceRepository(
      await createPrismaClient(),
    );

  return {
    accounts: new AccountService(repo),
    categories: new CategoryService(repo),
    transactions: new TransactionService(repo),
    queries: new FinanceQueryService(repo),
  };
};
