import type { Account, Category, Transaction } from '../model/types';

export type FinanceSnapshot = {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
};

export interface FinanceRepository {
    listAccounts(): Promise<Account[]>;
    findAccountById(id: string): Promise<Account | undefined>;
    saveAccount(account: Account): Promise<Account>;
    deleteAccount(id: string): Promise<void>;
    listCategories(): Promise<Category[]>;
    findCategoryById(id: string): Promise<Category | undefined>;
    saveCategory(category: Category): Promise<Category>;
    listTransactionsByDateRange(accountId: string, from: string, to: string): Promise<Transaction[]>;
    listTransactions(): Promise<Transaction[]>;
    listTransactionsByAccount(accountId: string): Promise<Transaction[]>;
    saveTransaction(transaction: Transaction): Promise<Transaction>;
}

export class InMemoryFinanceRepository implements FinanceRepository {
    private accounts = new Map<string, Account>();
    private categories = new Map<string, Category>();
    private transactions = new Map<string, Transaction>();

    constructor(snapshot?: Partial<FinanceSnapshot>) {
        snapshot?.accounts?.forEach((account) => this.accounts.set(account.id, account));
        snapshot?.categories?.forEach((category) => this.categories.set(category.id, category));
        snapshot?.transactions?.forEach((transaction) => this.transactions.set(transaction.id, transaction));
    }

    public async listAccounts(): Promise<Account[]> {
        return Array.from(this.accounts.values());
    }

    public async findAccountById(id: string): Promise<Account | undefined> {
        return this.accounts.get(id);
    }

    public async saveAccount(account: Account): Promise<Account> {
        this.accounts.set(account.id, account);
        return account;
    }

    public async deleteAccount(id: string): Promise<void> {
        this.accounts.delete(id);
    }

    public async listCategories(): Promise<Category[]> {
        return Array.from(this.categories.values());
    }

    public async findCategoryById(id: string): Promise<Category | undefined> {
        return this.categories.get(id);
    }

    public async saveCategory(category: Category): Promise<Category> {
        this.categories.set(category.id, category);
        return category;
    }

    public async listTransactions(): Promise<Transaction[]> {
        return Array.from(this.transactions.values());
    }

    public async listTransactionsByAccount(accountId: string): Promise<Transaction[]> {
        return (await this.listTransactions()).filter((transaction) => transaction.accountId === accountId);
    }

    public async saveTransaction(transaction: Transaction): Promise<Transaction> {
        this.transactions.set(transaction.id, transaction);
        return transaction;
    }

    public async listTransactionsByDateRange(accountId: string, from: string, to: string): Promise<Transaction[]> {
        return (await this.listTransactionsByAccount(accountId))
            .filter((t) => t.date >= from && t.date <= to);
    }
}
