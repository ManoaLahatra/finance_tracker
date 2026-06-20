import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createFinanceRouter } from '../server/finance/controller/financeRouter';
import { createFinanceModule } from '../server/finance/service/financeModule';
import { InMemoryFinanceRepository } from '../server/finance/repository/financeRepository';

const app = express();
const isVercel = process.env.VERCEL === '1';
const finance = createFinanceModule(isVercel ? new InMemoryFinanceRepository() : undefined);

app.use(express.json());
app.use(createFinanceRouter(finance));

const normalizeVercelUrl = (url: string | undefined): string => {
    if (!url || url === '/api') {
        return '/';
    }

    if (url.startsWith('/api/')) {
        return url.slice('/api'.length);
    }

    return url;
};

export default function handler(request: IncomingMessage, response: ServerResponse) {
    request.url = normalizeVercelUrl(request.url);
    app(request, response);
}
