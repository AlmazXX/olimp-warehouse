import { Module } from "@nestjs/common";
import { BankModule } from "./bank/bank.module";
import { TransactionModule } from "./transaction/transaction.module";

@Module({
  imports: [TransactionModule, BankModule],
})
export class ApiModule {}
