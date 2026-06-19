import { FinanceError } from '../errors/financeError';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const monthPattern = /^\d{4}-\d{2}$/;

export const normalizeIsoDate = (date: string): string => {
    if (!isoDatePattern.test(date)) {
        throw new FinanceError('INVALID_INPUT', 'date must use YYYY-MM-DD format', 400);
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
        throw new FinanceError('INVALID_INPUT', 'date must be a valid calendar date', 400);
    }

    return date;
};

export const normalizeMonth = (month: string): string => {
    if (!monthPattern.test(month)) {
        throw new FinanceError('INVALID_INPUT', 'month must use YYYY-MM format', 400);
    }

    const parsedMonth = new Date(`${month}-01T00:00:00.000Z`);

    if (Number.isNaN(parsedMonth.getTime()) || parsedMonth.toISOString().slice(0, 7) !== month) {
        throw new FinanceError('INVALID_INPUT', 'month must be valid', 400);
    }

    return month;
};

export const isDateInMonth = (date: string, month: string): boolean => {
    return date.startsWith(`${month}-`);
};
