import { FinanceError } from '../errors/financeError';
import type { AccountType, TransactionType } from '../model/types';

const accountTypes: readonly AccountType[] = ['checking', 'savings', 'cash'];
const transactionTypes: readonly TransactionType[] = ['income', 'expense'];

export const normalizeName = (name: string, fieldName: string): string => {
    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} is required`, 400);
    }

    return trimmedName;
};

export const normalizeAccountType = (type: AccountType): AccountType => {
    if (!accountTypes.includes(type)) {
        throw new FinanceError('INVALID_INPUT', 'Invalid account type', 400);
    }

    return type;
};

export const normalizeTransactionType = (type: TransactionType): TransactionType => {
    if (!transactionTypes.includes(type)) {
        throw new FinanceError('INVALID_INPUT', 'Invalid transaction type', 400);
    }

    return type;
};

export const normalizeOptionalNote = (note: string | null | undefined): string | null => {
    if (note === undefined || note === null) {
        return null;
    }

    const trimmedNote = note.trim();
    return trimmedNote.length > 0 ? trimmedNote : null;
};
