import { Module } from "@nestjs/common";
import { BankService } from "./bank.service";
import { BankV1Controller } from "./bank-v1.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bank } from "src/common/entities/bank.entity";
import { BankRepository } from "src/common/repositories/bank.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Bank])],
  controllers: [BankV1Controller],
  providers: [BankService, BankRepository],
})
export class BankModule {}
