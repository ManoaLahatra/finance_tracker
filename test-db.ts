import { createFinanceModule } from './server/finance/service/financeModule.js';

async function test() {
    try {
        const module = createFinanceModule();
        const accounts = await module.queries.listAccounts();
        console.log('Success:', accounts);
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
