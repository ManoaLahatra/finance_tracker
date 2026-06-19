import { NextFunction, Request, Response } from 'express';
import { isFinanceError } from '../errors/financeError';
import type { ErrorResponse } from './httpResponses';

export const handleFinanceError = (
    error: unknown,
    _request: Request,
    response: Response<ErrorResponse>,
    next: NextFunction,
): void => {
    void next;

    if (isFinanceError(error)) {
        response.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
            },
        });
        return;
    }

    console.error('[Unhandled Error]:', error);
    
    response.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected server error',
            details: error instanceof Error ? error.message : String(error)
        },
    });
};
