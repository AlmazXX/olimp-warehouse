import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bank } from "src/common/entities/bank.entity";
import { Person } from "src/common/entities/person.entity";
import { BankRepository } from "src/common/repositories/bank.repository";
import { PersonRepository } from "src/common/repositories/person.repository";
import { SeedService } from "./seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([Bank, Person])],
  providers: [SeedService, BankRepository, PersonRepository],
})
export class SeedModule {}
