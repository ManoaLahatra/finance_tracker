import { isDateInMonth, normalizeIsoDate, normalizeMonth } from '../utils/dateUtils';
import ExcelJS from 'exceljs';
import { FinanceError } from '../errors/financeError';
import { addMoney, roundMoney } from '../utils/money';
import type { FinanceRepository } from '../repository/financeRepository';
import type { Account, Category, MonthlySummary, Transaction, AccountType } from '../model/types';

export class FinanceQueryService {
    constructor(private readonly repository: FinanceRepository) {}

    public async listAccounts(): Promise<Account[]> {
        return this.repository.listAccounts();
    }

    public async listCategories(): Promise<Category[]> {
        return this.repository.listCategories();
    }

    public async listTransactions(accountId?: string): Promise<Transaction[]> {
        if (!accountId) {
            return this.repository.listTransactions();
        }

        await this.ensureAccountExists(accountId);
        return this.repository.listTransactionsByAccount(accountId);
    }

    public async getMonthlySummary(accountId: string, monthInput: string): Promise<MonthlySummary> {
        const account = await this.repository.findAccountById(accountId);
        if (!account) {
            throw new FinanceError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
        }
        const month = normalizeMonth(monthInput);
        const categories = await this.repository.listCategories();
        const transferCategoryId = categories.find((c) => c.name === 'Transfer')?.id;

        const accountTransactions = await this.repository.listTransactionsByAccount(accountId);
        const monthlyTransactions = accountTransactions
            .filter((transaction) => isDateInMonth(transaction.date, month));

        const isTransfer = (t: Transaction) => transferCategoryId && t.categoryId === transferCategoryId;

        const totalIncome = monthlyTransactions
            .filter((transaction) => transaction.type === 'income' && !isTransfer(transaction))
            .reduce((sum, transaction) => addMoney(sum, transaction.amount), 0);

        const totalExpenses = monthlyTransactions
            .filter((transaction) => transaction.type === 'expense' && !isTransfer(transaction))
            .reduce((sum, transaction) => addMoney(sum, transaction.amount), 0);

        const totalTransferIn = monthlyTransactions
            .filter((transaction) => transaction.type === 'income' && isTransfer(transaction))
            .reduce((sum, transaction) => addMoney(sum, transaction.amount), 0);

        const totalTransferOut = monthlyTransactions
            .filter((transaction) => transaction.type === 'expense' && isTransfer(transaction))
            .reduce((sum, transaction) => addMoney(sum, transaction.amount), 0);

        const spendingByCategory = categories
            .filter((c) => !transferCategoryId || c.id !== transferCategoryId)
            .map((category) => {
                const spent = monthlyTransactions
                    .filter((transaction) => {
                        return transaction.type === 'expense' && transaction.categoryId === category.id;
                    })
                    .reduce((sum, transaction) => addMoney(sum, transaction.amount), 0);

                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    spent,
                    monthlySpendingLimit: category.monthlySpendingLimit,
                    progress: category.monthlySpendingLimit && category.monthlySpendingLimit > 0
                        ? Math.round((spent / category.monthlySpendingLimit) * 10000) / 10000
                        : null,
                };
            })
            .filter((categorySummary) => {
                return categorySummary.spent > 0 || categorySummary.monthlySpendingLimit !== null;
            });

        return {
            accountId,
            month,
            totalIncome,
            totalExpenses,
            totalTransferIn,
            totalTransferOut,
            netBalance: roundMoney(account.balance),
            spendingByCategory,
        };
    }

    private async ensureAccountExists(accountId: string): Promise<void> {
        if (!(await this.repository.findAccountById(accountId))) {
            throw new FinanceError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
        }
    }

    public async exportTransactionsToXlsx(accountId: string, from: string, to: string): Promise<ExcelJS.Buffer> {
        const fromDate = normalizeIsoDate(from);
        const toDate = normalizeIsoDate(to);
        await this.ensureAccountExists(accountId);
        const account = await this.repository.findAccountById(accountId) as Account;
        const categories = await this.repository.listCategories();
        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

        const transactions = await this.repository.listTransactionsByDateRange(accountId, fromDate, toDate);
        transactions.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions');

        sheet.columns = [
            { header: 'Date', key: 'date', width: 14 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Amount', key: 'amount', width: 14 },
            { header: 'Note', key: 'note', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 20 },
        ];

        sheet.getRow(1).font = { bold: true };

        transactions.forEach((t) => {
            sheet.addRow({
                date: t.date,
                type: t.type,
                category: categoryMap.get(t.categoryId) ?? 'Unknown',
                amount: t.type === 'income' ? t.amount : -t.amount,
                note: t.note ?? '',
                createdAt: t.createdAt,
            });
        });

        const totalRow = sheet.addRow({
            date: '',
            type: 'TOTAL',
            category: '',
            amount: transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
            note: '',
            createdAt: '',
        });
        totalRow.font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}
