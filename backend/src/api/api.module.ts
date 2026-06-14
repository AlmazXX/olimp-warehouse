import { Module } from "@nestjs/common";
import { BankModule } from "./bank/bank.module";
import { PersonModule } from "./person/person.module";
import { TransactionModule } from "./transaction/transaction.module";

@Module({
  imports: [TransactionModule, BankModule, PersonModule],
})
export class ApiModule {}
