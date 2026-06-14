import { Controller, Get, Query } from "@nestjs/common";
import { GetPersonsDto } from "./dto/get-persons.dto";
import { PersonService } from "./person.service";

@Controller({ path: "persons", version: "1" })
export class PersonV1Controller {
  constructor(private readonly personService: PersonService) {}

  @Get()
  async get(@Query() pagination: GetPersonsDto) {
    return this.personService.get(pagination);
  }
}
