import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { GetTransactionsDto } from "./dto/get-transactions.dto";
import { ProcessTransactionsBulkDto } from "./dto/transaction.dto";
import { TransactionService } from "./transaction.service";

@Controller({ path: "transactions", version: "1" })
export class TransactionV1Controller {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async processTransactionsBulk(@Body() transactions: ProcessTransactionsBulkDto) {
    return this.transactionService.processTransactionsBulk(transactions);
  }

  @Get()
  async get(@Query() pagination: GetTransactionsDto) {
    return this.transactionService.get(pagination);
  }
}
