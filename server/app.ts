import express, { Router } from 'express';
import { createFinanceRouter } from './finance/controller/financeRouter';
import { createFinanceModule } from './finance/service/financeModule';

class App {

    public router: Router = express.Router();

    constructor() {
        const finance = createFinanceModule();

        this.router.use(express.json());
        this.router.use(createFinanceRouter(finance));
    }
}

const api = new App()

export default api;
