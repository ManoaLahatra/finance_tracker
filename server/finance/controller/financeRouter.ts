import express, { Request, Response, Router } from 'express';
import { registerAccountRoutes } from './accountRoutes';
import { registerCategoryRoutes } from './categoryRoutes';
import type { FinanceModule } from '../service/financeModule';
import { handleFinanceError } from './httpErrorHandler';
import { registerSummaryRoutes } from './summaryRoutes';
import { registerTransactionRoutes } from './transactionRoutes';

export const createFinanceRouter = (finance: FinanceModule): Router => {
    const router = express.Router();

    router.get('/', (_request: Request, response: Response) => {
        response.send('Welcome to the API!');
    });

    registerAccountRoutes(router, finance);
    registerCategoryRoutes(router, finance);
    registerTransactionRoutes(router, finance);
    registerSummaryRoutes(router, finance);

    router.use(handleFinanceError);

    return router;
};
