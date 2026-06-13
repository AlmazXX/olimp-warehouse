import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Person } from "../../common/entities/person.entity";
import { Transaction } from "../../common/entities/transaction.entity";
import { PersonRepository } from "../../common/repositories/person.repository";
import { TransactionRepository } from "../../common/repositories/transaction.repository";
import { ConfigModule } from "../../setup/config/config.module";
import { TransactionV1Controller } from "./transaction-v1.controller";
import { TransactionService } from "./transaction.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Transaction, Person])],
  controllers: [TransactionV1Controller],
  providers: [TransactionService, TransactionRepository, PersonRepository],
})
export class TransactionModule {}
