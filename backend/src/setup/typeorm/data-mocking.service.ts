import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Bank } from "../../common/entities/bank.entity";
import { Person } from "../../common/entities/person.entity";

@Injectable()
export class DataMockingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly datasource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedBank();
    await this.seedPersons();
  }

  private async seedBank() {
    const bankRepo = this.datasource.getRepository(Bank);
    const count = await bankRepo.count();

    if (count > 0) return this.logger.log("Bank already seeded, skipping");

    await bankRepo.save({ balance: 100_000 });
    this.logger.log("Bank seeded with balance 100,000");
  }

  private async seedPersons() {
    const personRepo = this.datasource.getRepository(Person);
    const count = await personRepo.count();

    if (count > 0) return this.logger.log("Persons already seeded, skipping");

    const persons = [
      { name: "Alice Johnson" },
      { name: "Bob Smith" },
      { name: "Charlie Brown" },
      { name: "Diana Prince" },
      { name: "Edward Norton" },
    ];

    await personRepo.save(persons);
    this.logger.log(`${persons.length} persons seeded`);
  }
}
