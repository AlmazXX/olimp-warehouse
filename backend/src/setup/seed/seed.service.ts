import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { BankRepository } from "src/common/repositories/bank.repository";
import { PersonRepository } from "src/common/repositories/person.repository";

const SEED_BANK = { balance: 100_000 };

const SEED_PERSONS = [
  { name: "Alice Johnson" },
  { name: "Bob Smith" },
  { name: "Charlie Brown" },
  { name: "Diana Prince" },
  { name: "Edward Norton" },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly bankRepository: BankRepository,
    private readonly personRepository: PersonRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.seedBank();
    await this.seedPersons();
  }

  private async seedBank() {
    const count = await this.bankRepository.count();

    if (count > 0) return this.logger.log("Bank already seeded, skipping");

    await this.bankRepository.save(SEED_BANK);
    this.logger.log(`Bank seeded with balance ${SEED_BANK.balance.toLocaleString()}`);
  }

  private async seedPersons() {
    const count = await this.personRepository.count();

    if (count > 0) return this.logger.log("Persons already seeded, skipping");

    await this.personRepository.saveMany(SEED_PERSONS);
    this.logger.log(`${SEED_PERSONS.length} persons seeded`);
  }
}
