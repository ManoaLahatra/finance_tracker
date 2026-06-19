import { Request } from 'express';
import { FinanceError } from '../errors/financeError';
import {
    readAccountType,
    readOptionalNullableNumber,
    readTransactionType,
} from './httpParsersExtra';
import type { CreateAccountInput, CreateCategoryInput, CreateTransactionInput, TransferInput, UpdateAccountInput, UpdateCategoryInput } from '../model/types';

type QueryValue = string | undefined;

export const parseCreateAccountInput = (body: unknown): CreateAccountInput => {
    const record = ensureRecord(body);
    const name = readRequiredString(record, 'name');
    const type = readAccountType(readRequiredString(record, 'type'), 'type');
    const initialBalance = readOptionalNumber(record, 'initialBalance');

    return initialBalance === undefined
        ? { name, type }
        : { name, type, initialBalance };
};

export const parseCreateCategoryInput = (body: unknown): CreateCategoryInput => {
    const record = ensureRecord(body);

    return {
        name: readRequiredString(record, 'name'),
        monthlySpendingLimit: readOptionalNullableNumber(record, 'monthlySpendingLimit'),
    };
};

export const parseCreateTransactionInput = (body: unknown): CreateTransactionInput => {
    const record = ensureRecord(body);

    return {
        accountId: readRequiredString(record, 'accountId'),
        categoryId: readRequiredString(record, 'categoryId'),
        type: readTransactionType(readRequiredString(record, 'type'), 'type'),
        amount: readRequiredNumber(record, 'amount'),
        date: readRequiredString(record, 'date'),
        note: readOptionalNullableString(record, 'note'),
    };
};

export const parseRequiredStringQuery = (value: Request['query'][string], fieldName: string): string => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} query parameter is required`, 400);
    }

    return value;
};

export const parseRequiredRouteParam = (value: string | string[] | undefined, fieldName: string): string => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new FinanceError('INVALID_INPUT', `${fieldName} route parameter is required`, 400);
    }

    return value;
};

export const parseOptionalStringQuery = (value: Request['query'][string]): QueryValue => {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== 'string') {
        throw new FinanceError('INVALID_INPUT', 'Query parameter must be a string', 400);
    }

    return value;
};

export const parseTransferInput = (body: unknown): TransferInput => {
    const record = ensureRecord(body);
    return {
        fromAccountId: readRequiredString(record, 'fromAccountId'),
        toAccountId: readRequiredString(record, 'toAccountId'),
        amount: readRequiredNumber(record, 'amount'),
        date: readRequiredString(record, 'date'),
        note: readOptionalNullableString(record, 'note'),
    };
};

export const parseUpdateAccountInput = (body: unknown): UpdateAccountInput => {
    const record = ensureRecord(body);
    const result: UpdateAccountInput = {};
    if (record.name !== undefined) {
        result.name = readRequiredString(record, 'name');
    }
    if (record.type !== undefined) {
        result.type = readAccountType(readRequiredString(record, 'type'), 'type');
    }
    return result;
};

export const parseUpdateCategoryInput = (body: unknown): UpdateCategoryInput => {
    const record = ensureRecord(body);
    const result: UpdateCategoryInput = {};
    if (record.name !== undefined) {
        result.name = readRequiredString(record, 'name');
    }
    if (record.monthlySpendingLimit !== undefined) {
        result.monthlySpendingLimit = readOptionalNullableNumber(record, 'monthlySpendingLimit');
    }
    return result;
};

export const parseExportQuery = (query: Request['query']): { accountId: string; from: string; to: string } => {
    return {
        accountId: parseRequiredStringQuery(query.accountId, 'accountId'),
        from: parseRequiredStringQuery(query.from, 'from'),
        to: parseRequiredStringQuery(query.to, 'to'),
    };
};

const ensureRecord = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new FinanceError('INVALID_INPUT', 'Request body must be an object', 400);
    }

    return value as Record<string, unknown>;
};

const readRequiredString = (record: Record<string, unknown>, fieldName: string): string => {
    const value = record[fieldName];

    if (typeof value !== 'string') {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be a string`, 400);
    }

    return value;
};

const readOptionalNullableString = (record: Record<string, unknown>, fieldName: string): string | null | undefined => {
    const value = record[fieldName];

    if (value === undefined || value === null) {
        return value;
    }

    if (typeof value !== 'string') {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be a string`, 400);
    }

    return value;
};

const readRequiredNumber = (record: Record<string, unknown>, fieldName: string): number => {
    const value = record[fieldName];

    if (typeof value !== 'number') {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be a number`, 400);
    }

    return value;
};

export const readOptionalNumber = (record: Record<string, unknown>, fieldName: string): number | undefined => {
    const value = record[fieldName];

    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== 'number') {
        throw new FinanceError('INVALID_INPUT', `${fieldName} must be a number`, 400);
    }

    return value;
};
