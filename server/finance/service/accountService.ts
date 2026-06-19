import { FinanceError } from '../errors/financeError';
import type { Account, CreateAccountInput, UpdateAccountInput } from '../model/types';
import type { FinanceRepository } from '../repository/financeRepository';
import { createSequentialIdGenerator } from '../utils/idGenerator';
import type { IdGenerator } from '../utils/idGenerator';
import { normalizeAmount } from '../utils/money';
import { normalizeAccountType, normalizeName } from '../validation/validators';
import { FinanceServiceConfig, resolveClock } from './serviceConfig';

export class AccountService {
    private readonly accountIdGenerator: IdGenerator;
    private readonly now: () => Date;

    constructor(
        private readonly repository: FinanceRepository,
        config: FinanceServiceConfig = {},
    ) {
        this.accountIdGenerator = config.accountIdGenerator ?? createSequentialIdGenerator('account');
        this.now = resolveClock(config);
    }

    public async createAccount(input: CreateAccountInput): Promise<Account> {
        const account: Account = {
            id: this.accountIdGenerator(),
            name: normalizeName(input.name, 'account name'),
            type: normalizeAccountType(input.type),
            balance: normalizeAmount(input.initialBalance ?? 0, 'initialBalance'),
            createdAt: this.now().toISOString(),
        };

        return this.repository.saveAccount(account);
    }

    public async updateAccount(accountId: string, input: UpdateAccountInput): Promise<Account> {
        const account = await this.repository.findAccountById(accountId);
        if (!account) {
            throw new FinanceError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
        }
        const updated: Account = {
            ...account,
            name: input.name !== undefined ? normalizeName(input.name, 'account name') : account.name,
            type: input.type !== undefined ? normalizeAccountType(input.type) : account.type,
        };
        return this.repository.saveAccount(updated);
    }

    public async deleteAccount(accountId: string): Promise<void> {
        const account = await this.repository.findAccountById(accountId);

        if (!account) {
            throw new FinanceError('ACCOUNT_NOT_FOUND', 'Account not found', 404);
        }

        if ((await this.repository.listTransactionsByAccount(accountId)).length > 0) {
            throw new FinanceError('ACCOUNT_HAS_TRANSACTIONS', 'An account with transactions cannot be deleted', 409);
        }

        await this.repository.deleteAccount(accountId);
    }
}
