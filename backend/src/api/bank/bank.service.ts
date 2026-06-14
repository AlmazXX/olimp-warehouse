import { Injectable, NotFoundException } from "@nestjs/common";
import { Bank } from "src/common/entities/bank.entity";
import { BankRepository } from "src/common/repositories/bank.repository";

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: BankRepository) {}

  async getOne(id: number): Promise<Bank> {
    const bank = await this.bankRepository.findById(id);

    if (!bank) throw new NotFoundException(`Bank ${id} not found`);

    return bank;
  }
}
