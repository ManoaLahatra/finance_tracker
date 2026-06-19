import { NextFunction, Request, Response, Router } from "express";
import type { FinanceModule } from "../service/financeModule";
import {
  parseCreateAccountInput,
  parseRequiredRouteParam,
  parseUpdateAccountInput,
} from "./httpParsers";

export const registerAccountRoutes = (
  router: Router,
  finance: FinanceModule,
): void => {
  router.get(
    "/accounts",
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.json({ data: await finance.queries.listAccounts() });
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/accounts/:accountId",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const accountId = parseRequiredRouteParam(
          request.params.accountId,
          "accountId",
        );
        const accounts = await finance.queries.listAccounts();
        const account = accounts.find((a) => a.id === accountId);
        if (!account) {
          response.status(404).json({
            error: {
              code: "ACCOUNT_NOT_FOUND",
              message: "Account not found",
            },
          });
          return;
        }
        response.json({ data: account });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/accounts",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const account = await finance.accounts.createAccount(
          parseCreateAccountInput(request.body),
        );
        response.status(201).json({ data: account });
      } catch (error) {
        next(error);
      }
    },
  );

  router.patch(
    "/accounts/:accountId",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const accountId = parseRequiredRouteParam(
          request.params.accountId,
          "accountId",
        );
        const account = await finance.accounts.updateAccount(
          accountId,
          parseUpdateAccountInput(request.body),
        );
        response.json({ data: account });
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    "/accounts/:accountId",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        await finance.accounts.deleteAccount(
          parseRequiredRouteParam(request.params.accountId, "accountId"),
        );
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );
};
