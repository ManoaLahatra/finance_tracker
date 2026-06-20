import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createFinanceRouter } from '../server/finance/controller/financeRouter';
import { createFinanceModule } from '../server/finance/service/financeModule';

const app = express();

app.use(express.json());

const ready = createFinanceModule()
  .then((finance) => {
    app.use(createFinanceRouter(finance));
    app.use((_req, res) => {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
    });
  })
  .catch((err: unknown) => {
    console.error('[finance] Init failed:', err);
    app.use((_req, res) => {
      res.status(500).json({
        error: {
          code: 'INIT_FAILED',
          message: 'Module initialization failed',
          details: err instanceof Error ? err.message : String(err),
        },
      });
    });
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

export default async function handler(request: IncomingMessage, response: ServerResponse) {
    await ready;
    request.url = normalizeVercelUrl(request.url);
    app(request, response);
}
