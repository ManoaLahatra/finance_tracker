import express, { Router } from 'express';
import { createFinanceRouter } from './finance/controller/financeRouter';
import { createFinanceModule } from './finance/service/financeModule';

const router: Router = express.Router();

router.use(express.json());

const init = createFinanceModule().then((finance) => {
  router.use(createFinanceRouter(finance));
});

export { init };
export default router;
