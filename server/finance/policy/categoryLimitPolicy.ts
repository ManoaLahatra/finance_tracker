import { addMoney } from '../utils/money';
import type { FinanceRepository } from '../repository/financeRepository';

export class CategoryLimitPolicy {
    constructor(private readonly repository: FinanceRepository) {}

    public async getExpenseWarning(categoryId: string, newExpenseAmount: number, date: string): Promise<string | null> {
        const category = await this.repository.findCategoryById(categoryId);

        if (!category?.monthlySpendingLimit) {
            return null;
        }

        const projectedMonthlySpent = addMoney(
            await this.getMonthlySpent(categoryId, date.slice(0, 7)),
            newExpenseAmount,
        );

        if (projectedMonthlySpent <= category.monthlySpendingLimit) {
            return null;
        }

        return `Monthly limit exceeded for ${category.name}`;
    }

    private async getMonthlySpent(categoryId: string, month: string): Promise<number> {
        const transactions = await this.repository.listTransactions();
        return transactions
            .filter((transaction) => {
                return transaction.type === 'expense'
                    && transaction.categoryId === categoryId
                    && transaction.date.startsWith(`${month}-`);
            })
            .reduce((sum, transaction) => addMoney(sum, transaction.amount), 0);
    }
}
