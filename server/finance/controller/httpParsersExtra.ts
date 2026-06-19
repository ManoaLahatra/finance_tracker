import { FinanceError } from '../errors/financeError';
import type { AccountType, TransactionType } from '../model/types';

const accountTypes: readonly string[] = ['checking', 'savings', 'cash'];
const transactionTypes: readonly string[] = ['income', 'expense'];

export const readOptionalNullableNumber = (
    record: Record<string, unknown>,
    fieldName: string,
): number | null | undefined => {
    const value = record[fieldName];

    if (value === undefined || value === null) {
        return value;
    }

    if (typeof value !== 'number') {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be a number`, 400);
    }

    return value;
};

export const readAccountType = (value: string, fieldName: string): AccountType => {
    if (!isAccountType(value)) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} is invalid`, 400);
    }

    return value;
};

export const readTransactionType = (value: string, fieldName: string): TransactionType => {
    if (!isTransactionType(value)) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} is invalid`, 400);
    }

    return value;
};

const isAccountType = (value: string): value is AccountType => {
    return accountTypes.includes(value);
};

const isTransactionType = (value: string): value is TransactionType => {
    return transactionTypes.includes(value);
};
