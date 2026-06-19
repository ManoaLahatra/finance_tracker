export type FinanceErrorCode =
    | 'ACCOUNT_NOT_FOUND'
    | 'CATEGORY_NOT_FOUND'
    | 'INVALID_INPUT'
    | 'ACCOUNT_HAS_TRANSACTIONS'
    | 'INSUFFICIENT_FUNDS'
    | 'INVALID_TRANSFER';

export class FinanceError extends Error {
    public readonly code: FinanceErrorCode;
    public readonly statusCode: number;

    constructor(code: FinanceErrorCode, message: string, statusCode: number) {
        super(message);
        this.name = 'FinanceError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

export const isFinanceError = (error: unknown): error is FinanceError => {
    return error instanceof FinanceError;
};
