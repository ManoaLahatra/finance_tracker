import express from "express";
import { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { InMemoryFinanceRepository } from "../repository/financeRepository";
import { createFinanceRouter } from "../controller/financeRouter";
import { createFinanceModule } from "../service/financeModule";

type StartedServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

let currentServer: StartedServer | null = null;

const startApi = async (): Promise<StartedServer> => {
  const app = express();

  app.use(express.json());
  app.use(
    createFinanceRouter(createFinanceModule(new InMemoryFinanceRepository())),
  );

  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Expected HTTP server to listen on a TCP port");
  }

  return {
    baseUrl: `http://127.0.0.1:${(address as AddressInfo).port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
};

const postJson = async <ResponseBody>(
  url: string,
  body: object,
): Promise<ResponseBody> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json() as Promise<ResponseBody>;
};

afterEach(async () => {
  if (!currentServer) {
    return;
  }

  await currentServer.close();
  currentServer = null;
});

describe("finance HTTP API", () => {
  it("creates accounts through the REST API", async () => {
    currentServer = await startApi();

    const response = await postJson<{
      data: { id: string; name: string; balance: number };
    }>(`${currentServer.baseUrl}/accounts`, {
      name: "Checking",
      type: "checking",
      initialBalance: 100,
    });

    expect(response).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: expect.any(String),
          name: "Checking",
          balance: 100,
        }),
      }),
    );
  });

  it("returns a typed error response when input is invalid", async () => {
    currentServer = await startApi();

    const response = await fetch(`${currentServer.baseUrl}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "",
        type: "checking",
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_INPUT",
        message: "account name is required",
      },
    });
  });
});
