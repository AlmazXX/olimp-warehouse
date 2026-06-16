import { Injectable } from "@nestjs/common";
import { PersonResponse } from "@olimp/contracts";
import { PersonRepository } from "src/common/repositories/person.repository";
import { GetPersonsDto } from "./dto/get-persons.dto";

@Injectable()
export class PersonService {
  constructor(private readonly personRepository: PersonRepository) {}

  async get(pagination: GetPersonsDto): Promise<PersonResponse[]> {
    return this.personRepository.find(pagination);
  }
}
