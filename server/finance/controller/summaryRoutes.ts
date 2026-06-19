import { NextFunction, Request, Response, Router } from 'express';
import type { FinanceModule } from '../service/financeModule';
import { parseRequiredStringQuery } from './httpParsers';

export const registerSummaryRoutes = (router: Router, finance: FinanceModule): void => {
    router.get('/summary', async (request: Request, response: Response, next: NextFunction) => {
        try {
            const accountId = parseRequiredStringQuery(request.query.accountId, 'accountId');
            const month = parseRequiredStringQuery(request.query.month, 'month');
            response.json({ data: await finance.queries.getMonthlySummary(accountId, month) });
        } catch (error) {
            next(error);
        }
    });
};
