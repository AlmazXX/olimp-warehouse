import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bank } from "src/common/entities/bank.entity";
import { Person } from "src/common/entities/person.entity";
import { Transaction } from "src/common/entities/transaction.entity";
import { BankRepository } from "src/common/repositories/bank.repository";
import { PersonRepository } from "src/common/repositories/person.repository";
import { TransactionRepository } from "src/common/repositories/transaction.repository";
import { ConfigModule } from "src/setup/config/config.module";
import { TransactionV1Controller } from "./transaction-v1.controller";
import { TransactionService } from "./transaction.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Transaction, Person, Bank])],
  controllers: [TransactionV1Controller],
  providers: [TransactionService, TransactionRepository, PersonRepository, BankRepository],
})
export class TransactionModule {}
