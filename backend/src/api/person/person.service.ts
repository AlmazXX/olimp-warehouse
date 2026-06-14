import { Injectable } from "@nestjs/common";
import { Person } from "src/common/entities/person.entity";
import { PersonRepository } from "src/common/repositories/person.repository";
import { GetPersonsDto } from "./dto/get-persons.dto";

@Injectable()
export class PersonService {
  constructor(private readonly personRepository: PersonRepository) {}

  async get(pagination: GetPersonsDto): Promise<Person[]> {
    return this.personRepository.find(pagination);
  }
}
