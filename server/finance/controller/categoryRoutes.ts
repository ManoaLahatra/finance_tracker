import { NextFunction, Request, Response, Router } from "express";
import type { FinanceModule } from "../service/financeModule";
import { parseCreateCategoryInput, parseUpdateCategoryInput } from "./httpParsers";
import { parseRequiredRouteParam } from "./httpParsers";

export const registerCategoryRoutes = (
  router: Router,
  finance: FinanceModule,
): void => {
  router.get(
    "/categories",
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.json({ data: await finance.queries.listCategories() });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/categories",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const category = await finance.categories.createCategory(
          parseCreateCategoryInput(request.body),
        );
        response.status(201).json({ data: category });
      } catch (error) {
        next(error);
      }
    },
  );

  router.patch(
    "/categories/:categoryId",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const categoryId = parseRequiredRouteParam(
          request.params.categoryId,
          "categoryId",
        );
        const category = await finance.categories.updateCategory(
          categoryId,
          parseUpdateCategoryInput(request.body),
        );
        response.json({ data: category });
      } catch (error) {
        next(error);
      }
    },
  );
};
