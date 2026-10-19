import { INestApplication } from "@nestjs/common";
import { ProcessTransactionsBulkResponse, TransactionStatus } from "@olimp/contracts";
import request from "supertest";
import { App } from "supertest/types";
import { createTestApp } from "./helpers/create-test-app";
import { resetAndSeed } from "./helpers/reset-and-seed";

describe("API (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetAndSeed(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns seeded persons and seeded bank", async () => {
    const personsResponse = await request(app.getHttpServer()).get("/v1/persons?page=1&limit=10").expect(200);
    const bankResponse = await request(app.getHttpServer()).get("/v1/banks/1").expect(200);

    expect(personsResponse.body).toHaveLength(5);
    expect(personsResponse.body.map((p: { name: string }) => p.name)).toEqual(
      expect.arrayContaining(["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Edward Norton"]),
    );

    expect(bankResponse.body).toMatchObject({ id: 1, balance: 100000 });
  });

  it("processes batch transactions and returns ordered results with timing", async () => {
    const key1 = `e2e-success-${Date.now()}-1`;
    const key2 = `e2e-fail-${Date.now()}-2`;

    const payload = {
      transactions: [
        { personId: 1, bankId: 1, amount: 50, key: key1 },
        { personId: 2, bankId: 1, amount: -200000, key: key2 },
      ],
    };

    const response = await request(app.getHttpServer()).post("/v1/transactions").send(payload).expect(201);
    const body = response.body as ProcessTransactionsBulkResponse;

    expect(body.processingTimeMs).toEqual(expect.any(Number));
    expect(body.transactions).toHaveLength(2);
    expect(body.transactions[0]).toMatchObject({
      key: key1,
      personId: 1,
      amount: 50,
      status: TransactionStatus.SUCCESS,
      errorMessage: null,
    });
    expect(body.transactions[1]).toMatchObject({
      key: key2,
      personId: 2,
      amount: -200000,
      status: TransactionStatus.FAILED,
    });
    expect(body.transactions[1].errorMessage).toContain("Insufficient bank funds");

    const bank = await request(app.getHttpServer()).get("/v1/banks/1").expect(200);
    expect(bank.body.balance).toBe(100050);

    const log = await request(app.getHttpServer()).get("/v1/transactions?page=1&limit=10").expect(200);
    expect(log.body).toHaveLength(2);
  });

  it("rejects amount equal to zero with 400 for the whole batch", async () => {
    const response = await request(app.getHttpServer())
      .post("/v1/transactions")
      .send({
        transactions: [{ personId: 1, bankId: 1, amount: 0, key: `e2e-zero-${Date.now()}` }],
      })
      .expect(400);

    expect(response.body.message).toEqual(expect.arrayContaining(["transactions.0.amount should not be equal to 0"]));
  });

  it("is idempotent by transaction key", async () => {
    const key = `e2e-idempotent-${Date.now()}`;
    const payload = {
      transactions: [{ personId: 1, bankId: 1, amount: 125, key }],
    };

    const first = await request(app.getHttpServer()).post("/v1/transactions").send(payload).expect(201);
    const second = await request(app.getHttpServer()).post("/v1/transactions").send(payload).expect(201);

    expect(first.body.transactions[0].status).toBe(TransactionStatus.SUCCESS);
    expect(second.body.transactions[0].status).toBe(TransactionStatus.SUCCESS);
    expect(second.body.transactions[0].transactionId).toBe(first.body.transactions[0].transactionId);

    const bank = await request(app.getHttpServer()).get("/v1/banks/1").expect(200);
    expect(bank.body.balance).toBe(100125);
  });
});
