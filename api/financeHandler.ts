import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createFinanceRouter } from '../server/finance/controller/financeRouter';
import { createFinanceModule } from '../server/finance/service/financeModule';

const app = express();

app.use(express.json());
createFinanceModule().then((finance) => {
  app.use(createFinanceRouter(finance));
});

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
