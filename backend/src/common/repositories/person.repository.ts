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

  async find({ page, limit }: { page: number; limit: number }) {
    return this.personRepo.find({ skip: (page - 1) * limit, take: limit });
  }

  async count(): Promise<number> {
    return this.personRepo.count();
  }

  async saveMany(data: Partial<Person>[]): Promise<Person[]> {
    return this.personRepo.save(data);
  }
}
