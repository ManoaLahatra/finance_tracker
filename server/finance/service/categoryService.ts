import { FinanceError } from '../errors/financeError';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../model/types';
import type { FinanceRepository } from '../repository/financeRepository';
import { createSequentialIdGenerator } from '../utils/idGenerator';
import type { IdGenerator } from '../utils/idGenerator';
import { normalizeAmount } from '../utils/money';
import { normalizeName } from '../validation/validators';
import { FinanceServiceConfig, resolveClock } from './serviceConfig';

export class CategoryService {
    private readonly categoryIdGenerator: IdGenerator;
    private readonly now: () => Date;

    constructor(
        private readonly repository: FinanceRepository,
        config: FinanceServiceConfig = {},
    ) {
        this.categoryIdGenerator = config.categoryIdGenerator ?? createSequentialIdGenerator('category');
        this.now = resolveClock(config);
    }

    public async createCategory(input: CreateCategoryInput): Promise<Category> {
        const monthlySpendingLimit = input.monthlySpendingLimit === undefined || input.monthlySpendingLimit === null
            ? null
            : normalizeAmount(input.monthlySpendingLimit, 'monthlySpendingLimit');

        const category: Category = {
            id: this.categoryIdGenerator(),
            name: normalizeName(input.name, 'category name'),
            monthlySpendingLimit,
            createdAt: this.now().toISOString(),
        };

        return this.repository.saveCategory(category);
    }

    public async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
        const existing = await this.repository.findCategoryById(id);
        if (!existing) {
            throw new FinanceError('CATEGORY_NOT_FOUND', 'Category not found', 404);
        }

        const monthlySpendingLimit = input.monthlySpendingLimit === undefined
            ? existing.monthlySpendingLimit
            : (input.monthlySpendingLimit === null
                ? null
                : normalizeAmount(input.monthlySpendingLimit, 'monthlySpendingLimit'));

        const updated: Category = {
            ...existing,
            name: input.name !== undefined ? normalizeName(input.name, 'category name') : existing.name,
            monthlySpendingLimit,
        };
        return this.repository.saveCategory(updated);
    }
}
