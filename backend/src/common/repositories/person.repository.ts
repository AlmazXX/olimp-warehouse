import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Person } from "../entities/person.entity";

@Injectable()
export class PersonRepository {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async findById(id: number): Promise<Person | null> {
    return this.personRepo.findOne({ where: { id } });
  }
}
