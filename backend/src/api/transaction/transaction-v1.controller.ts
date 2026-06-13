import { Body, Controller, Post } from "@nestjs/common";
import { ProcessTransactionsBulkDto } from "./dto/create-transactions-bulk.dto";
import { TransactionService } from "./transaction.service";

@Controller({ path: "transactions", version: "1" })
export class TransactionV1Controller {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  processTransactionsBulk(@Body() transactions: ProcessTransactionsBulkDto) {
    return this.transactionService.processTransactionsBulk(transactions);
  }
}
