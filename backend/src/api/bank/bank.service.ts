import { Injectable, NotFoundException } from "@nestjs/common";
import { BankResponse } from "@olipm/contracts";
import { BankRepository } from "src/common/repositories/bank.repository";

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: BankRepository) {}

  async getOne(id: number): Promise<BankResponse> {
    const bank = await this.bankRepository.findById(id);

    if (!bank) throw new NotFoundException(`Bank ${id} not found`);

    return bank;
  }
}
