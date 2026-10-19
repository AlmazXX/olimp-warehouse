import { ConfigService } from "@nestjs/config";
import { TransactionStatus } from "@olimp/contracts";
import { BankRepository } from "src/common/repositories/bank.repository";
import { PersonRepository } from "src/common/repositories/person.repository";
import { TransactionRepository } from "src/common/repositories/transaction.repository";
import { DataSource } from "typeorm";
import { TransactionService } from "./transaction.service";

describe("TransactionService", () => {
  const mockTransactionRepository = {
    createFailedOrExisting: jest.fn(),
    findOrCreate: jest.fn(),
    updateStatus: jest.fn(),
  } as unknown as TransactionRepository;

  const mockPersonRepository = {
    findById: jest.fn(),
  } as unknown as PersonRepository;

  const mockBankRepository = {
    findById: jest.fn(),
  } as unknown as BankRepository;

  const mockConfig = {
    get: jest.fn().mockReturnValue(10),
  } as unknown as ConfigService;

  const mockDatasource = {
    transaction: jest.fn(),
  } as unknown as DataSource;

  let service: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionService(
      mockDatasource,
      mockTransactionRepository,
      mockPersonRepository,
      mockBankRepository,
      mockConfig as ConfigService<any, true>,
    );
  });

  it("creates failed transaction when person not found", async () => {
    (mockPersonRepository.findById as jest.Mock).mockResolvedValue(null);
    (mockBankRepository.findById as jest.Mock).mockResolvedValue({ id: 1, balance: 100000 });
    (mockTransactionRepository.createFailedOrExisting as jest.Mock).mockResolvedValue({
      id: 10,
      status: TransactionStatus.FAILED,
      errorMessage: "Person 999 not found",
    });

    const result = await service.processTransaction({
      personId: 999,
      bankId: 1,
      amount: 100,
      key: "missing-person",
    });

    expect(mockTransactionRepository.createFailedOrExisting).toHaveBeenCalledWith({
      personId: null,
      bankId: 1,
      amount: 100,
      key: "missing-person",
      errorMessage: "Person 999 not found",
    });
    expect(result.status).toBe(TransactionStatus.FAILED);
  });

  it("updates status to FAILED when processing throws", async () => {
    (mockPersonRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (mockBankRepository.findById as jest.Mock).mockResolvedValue({ id: 1, balance: 100000 });
    (mockTransactionRepository.findOrCreate as jest.Mock).mockResolvedValue({
      isNew: true,
      transaction: {
        id: 42,
        amount: -1000,
        status: TransactionStatus.PROCESSING,
        key: "insufficient-funds",
      },
    });
    (mockDatasource.transaction as jest.Mock).mockRejectedValue(new Error("Insufficient bank funds"));

    await expect(
      service.processTransaction({
        personId: 1,
        bankId: 1,
        amount: -1000,
        key: "insufficient-funds",
      }),
    ).rejects.toThrow("Insufficient bank funds");

    expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
      42,
      TransactionStatus.FAILED,
      "Insufficient bank funds",
    );
  });

  it("maps settled results in the same order as input", async () => {
    const txOne = {
      id: 7,
      status: TransactionStatus.SUCCESS,
      errorMessage: null,
    };
    jest.spyOn(service, "processTransaction").mockImplementation(async (dto) => {
      if (dto.key === "first") throw new Error("failed first");
      return txOne as any;
    });

    const result = await service.processTransactionsBulk({
      transactions: [
        { personId: 1, bankId: 1, amount: 10, key: "first" },
        { personId: 2, bankId: 1, amount: 15, key: "second" },
      ],
    });

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]).toMatchObject({
      key: "first",
      status: TransactionStatus.FAILED,
      errorMessage: "failed first",
    });
    expect(result.transactions[1]).toMatchObject({
      key: "second",
      status: TransactionStatus.SUCCESS,
      transactionId: 7,
    });
    expect(result.processingTimeMs).toEqual(expect.any(Number));
  });
});
