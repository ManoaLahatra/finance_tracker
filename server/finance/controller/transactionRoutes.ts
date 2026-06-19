import { NextFunction, Request, Response, Router } from 'express';
import type { FinanceModule } from '../service/financeModule';
import { parseCreateTransactionInput, parseExportQuery, parseOptionalStringQuery, parseTransferInput } from './httpParsers';

export const registerTransactionRoutes = (router: Router, finance: FinanceModule): void => {
    router.get('/transactions', async (request: Request, response: Response, next: NextFunction) => {
        try {
            const accountId = parseOptionalStringQuery(request.query.accountId);
            response.json({ data: await finance.queries.listTransactions(accountId) });
        } catch (error) {
            next(error);
        }
    });

    router.post('/transactions', async (request: Request, response: Response, next: NextFunction) => {
        try {
            const transaction = await finance.transactions.createTransaction(parseCreateTransactionInput(request.body));
            response.status(201).json({ data: transaction });
        } catch (error) {
            next(error);
        }
    });

    router.post('/transactions/transfer', async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await finance.transactions.transfer(parseTransferInput(request.body));
            response.status(201).json({ data: result });
        } catch (error) {
            next(error);
        }
    });

    router.get('/transactions/export', async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { accountId, from, to } = parseExportQuery(request.query);
            const buffer = await finance.queries.exportTransactionsToXlsx(accountId, from, to);
            response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            response.setHeader('Content-Disposition', `attachment; filename="transactions-${from}-${to}.xlsx"`);
            response.send(Buffer.from(buffer));
        } catch (error) {
            next(error);
        }
    });
};
