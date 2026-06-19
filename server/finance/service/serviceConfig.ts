import type { IdGenerator } from '../utils/idGenerator';

export type ServiceClock = () => Date;

export type FinanceServiceConfig = {
    accountIdGenerator?: IdGenerator;
    categoryIdGenerator?: IdGenerator;
    transactionIdGenerator?: IdGenerator;
    now?: ServiceClock;
};

export const resolveClock = (config: FinanceServiceConfig): ServiceClock => {
    return config.now ?? (() => new Date());
};
