import { InMemoryFinanceRepository } from '../repository/financeRepository';
import { AccountService } from '../service/accountService';
import { CategoryService } from '../service/categoryService';
import { FinanceQueryService } from '../service/financeQueryService';
import { TransactionService } from '../service/transactionService';

export const createTestFinanceServices = () => {
    const repository = new InMemoryFinanceRepository();
    const config = {
        now: () => new Date('2026-06-19T10:00:00.000Z'),
    };

    return {
        accounts: new AccountService(repository, config),
        categories: new CategoryService(repository, config),
        queries: new FinanceQueryService(repository),
        transactions: new TransactionService(repository, config),
    };
};
