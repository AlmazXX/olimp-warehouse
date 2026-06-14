import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Person } from "src/common/entities/person.entity";
import { PersonRepository } from "src/common/repositories/person.repository";
import { PersonV1Controller } from "./person-v1.controller";
import { PersonService } from "./person.service";

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PersonV1Controller],
  providers: [PersonService, PersonRepository],
})
export class PersonModule {}
