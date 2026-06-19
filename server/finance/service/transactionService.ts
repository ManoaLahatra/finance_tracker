import { FinanceError } from '../errors/financeError';
import type { Account, Category, CreateTransactionInput, Transaction, TransferInput } from '../model/types';
import { CategoryLimitPolicy } from '../policy/categoryLimitPolicy';
import type { FinanceRepository } from '../repository/financeRepository';
import { normalizeIsoDate } from '../utils/dateUtils';
import { createSequentialIdGenerator } from '../utils/idGenerator';
import type { IdGenerator } from '../utils/idGenerator';
import { addMoney, normalizeStrictlyPositiveAmount, subtractMoney } from '../utils/money';
import { normalizeOptionalNote, normalizeTransactionType } from '../validation/validators';
import { FinanceServiceConfig, resolveClock } from './serviceConfig';

export class TransactionService {
    private readonly transactionIdGenerator: IdGenerator;
    private readonly now: () => Date;
    private readonly categoryLimitPolicy: CategoryLimitPolicy;

    constructor(
        private readonly repository: FinanceRepository,
        config: FinanceServiceConfig = {},
    ) {
        this.transactionIdGenerator = config.transactionIdGenerator ?? createSequentialIdGenerator('transaction');
        this.now = resolveClock(config);
        this.categoryLimitPolicy = new CategoryLimitPolicy(repository);
    }

    public async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
        const account = await this.getAccount(input.accountId);
        await this.ensureCategoryExists(input.categoryId);

        const type = normalizeTransactionType(input.type);
        const amount = normalizeStrictlyPositiveAmount(input.amount);
        const date = normalizeIsoDate(input.date);

        if (type === 'expense' && account.balance < amount) {
            throw new FinanceError('INSUFFICIENT_FUNDS', 'Transaction cannot bring account balance below zero', 409);
        }

        const transaction: Transaction = {
            id: this.transactionIdGenerator(),
            accountId: input.accountId,
            categoryId: input.categoryId,
            type,
            amount,
            date,
            note: normalizeOptionalNote(input.note),
            warning: type === 'expense'
                ? await this.categoryLimitPolicy.getExpenseWarning(input.categoryId, amount, date)
                : null,
            createdAt: this.now().toISOString(),
        };

        await this.repository.saveAccount(this.applyBalanceChange(account, transaction));
        return this.repository.saveTransaction(transaction);
    }

    private async getAccount(accountId: string): Promise<Account> {
        const account = await this.repository.findAccountById(accountId);

        if (!account) {
            throw new FinanceError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
        }

        return account;
    }

    private async ensureCategoryExists(categoryId: string): Promise<void> {
        if (!(await this.repository.findCategoryById(categoryId))) {
            throw new FinanceError('CATEGORY_NOT_FOUND', 'Category not found', 404);
        }
    }

    private applyBalanceChange(account: Account, transaction: Transaction): Account {
        return {
            ...account,
            balance: transaction.type === 'income'
                ? addMoney(account.balance, transaction.amount)
                : subtractMoney(account.balance, transaction.amount),
        };
    }

    private applyTransferWithdraw(account: Account, amount: number): Account {
        if (account.balance < amount) {
            throw new FinanceError('INSUFFICIENT_FUNDS', 'Source account has insufficient funds for transfer', 409);
        }
        return { ...account, balance: subtractMoney(account.balance, amount) };
    }

    private applyTransferDeposit(account: Account, amount: number): Account {
        return { ...account, balance: addMoney(account.balance, amount) };
    }

    private async ensureTransferCategory(): Promise<Category> {
        const categories = await this.repository.listCategories();
        const existing = categories.find((c) => c.name === 'Transfer');
        if (existing) return existing;

        const transferCat: Category = {
            id: 'transfer',
            name: 'Transfer',
            monthlySpendingLimit: null,
            createdAt: this.now().toISOString(),
        };
        return this.repository.saveCategory(transferCat);
    }

    public async transfer(input: TransferInput): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
        const amount = normalizeStrictlyPositiveAmount(input.amount);
        const date = normalizeIsoDate(input.date);
        const note = normalizeOptionalNote(input.note);

        if (input.fromAccountId === input.toAccountId) {
            throw new FinanceError('INVALID_TRANSFER', 'Cannot transfer to the same account', 400);
        }

        const fromAccount = await this.getAccount(input.fromAccountId);
        const toAccount = await this.getAccount(input.toAccountId);
        const transferCategory = await this.ensureTransferCategory();

        const now = this.now().toISOString();
        const fromTransaction: Transaction = {
            id: this.transactionIdGenerator(),
            accountId: input.fromAccountId,
            categoryId: transferCategory.id,
            type: 'expense',
            amount,
            date,
            note: note ? `Transfer to ${toAccount.name}: ${note}` : `Transfer to ${toAccount.name}`,
            warning: null,
            createdAt: now,
        };

        const toTransaction: Transaction = {
            id: this.transactionIdGenerator(),
            accountId: input.toAccountId,
            categoryId: transferCategory.id,
            type: 'income',
            amount,
            date,
            note: note ? `Transfer from ${fromAccount.name}: ${note}` : `Transfer from ${fromAccount.name}`,
            warning: null,
            createdAt: now,
        };

        await this.repository.saveAccount(this.applyTransferWithdraw(fromAccount, amount));
        await this.repository.saveAccount(this.applyTransferDeposit(toAccount, amount));
        await this.repository.saveTransaction(fromTransaction);
        await this.repository.saveTransaction(toTransaction);

        return { fromTransaction, toTransaction };
    }
}
