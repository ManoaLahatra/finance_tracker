import { FinanceError } from '../errors/financeError';

export const normalizeAmount = (amount: number, fieldName = 'amount'): number => {
    if (!Number.isFinite(amount) || amount < 0) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be a non-negative number`, 400);
    }

    return Math.round(amount * 100) / 100;
};

export const normalizeStrictlyPositiveAmount = (amount: number, fieldName = 'amount'): number => {
    const normalized = normalizeAmount(amount, fieldName);

    if (normalized <= 0) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be greater than zero`, 400);
    }

    return normalized;
};

export const roundMoney = (amount: number): number => {
    if (!Number.isFinite(amount)) {
        throw new FinanceError('INVALID_INPUT', 'amount must be finite', 400);
    }

    return Math.round(amount * 100) / 100;
};

export const addMoney = (left: number, right: number): number => {
    return roundMoney(left + right);
};

export const subtractMoney = (left: number, right: number): number => {
    return normalizeAmount(left - right);
};
