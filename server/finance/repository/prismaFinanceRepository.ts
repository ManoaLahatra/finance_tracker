import { PrismaClient } from "@prisma/client";
import type { Account, Category, Transaction } from "../model/types";
import type { FinanceRepository } from "./financeRepository";

export class PrismaFinanceRepository implements FinanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async listAccounts(): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany();
    return accounts as Account[];
  }

  public async findAccountById(id: string): Promise<Account | undefined> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    return (account as Account | null) ?? undefined;
  }

  public async saveAccount(account: Account): Promise<Account> {
    const result = await this.prisma.account.upsert({
      where: { id: account.id },
      update: {
        name: account.name,
        type: account.type,
        balance: account.balance,
        createdAt: account.createdAt,
      },
      create: {
        id: account.id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        createdAt: account.createdAt,
      },
    });
    return result as Account;
  }

  public async deleteAccount(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }

  public async listCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany();
    return categories as Category[];
  }

  public async findCategoryById(id: string): Promise<Category | undefined> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return (category as Category | null) ?? undefined;
  }

  public async saveCategory(category: Category): Promise<Category> {
    const result = await this.prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        monthlySpendingLimit: category.monthlySpendingLimit,
        createdAt: category.createdAt,
      },
      create: {
        id: category.id,
        name: category.name,
        monthlySpendingLimit: category.monthlySpendingLimit,
        createdAt: category.createdAt,
      },
    });
    return result as Category;
  }

  public async listTransactions(): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany();
    return transactions as Transaction[];
  }

  public async listTransactionsByAccount(
    accountId: string,
  ): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { accountId },
    });
    return transactions as Transaction[];
  }

  public async listTransactionsByDateRange(
    accountId: string,
    from: string,
    to: string,
  ): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
        date: { gte: from, lte: to },
      },
    });
    return transactions as Transaction[];
  }

  public async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const result = await this.prisma.transaction.upsert({
      where: { id: transaction.id },
      update: {
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        note: transaction.note,
        warning: transaction.warning,
        createdAt: transaction.createdAt,
      },
      create: {
        id: transaction.id,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        note: transaction.note,
        warning: transaction.warning,
        createdAt: transaction.createdAt,
      },
    });
    return result as Transaction;
  }
}
