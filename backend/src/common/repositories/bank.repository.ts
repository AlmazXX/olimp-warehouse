import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Bank } from "../entities/bank.entity";

@Injectable()
export class BankRepository {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepo: Repository<Bank>,
  ) {}

  async findById(id: number): Promise<Bank | null> {
    return this.bankRepo.findOne({ where: { id } });
  }

  async count(): Promise<number> {
    return this.bankRepo.count();
  }

  async save(data: Partial<Bank>): Promise<Bank> {
    return this.bankRepo.save(data);
  }
}
