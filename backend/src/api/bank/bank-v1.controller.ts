import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { BankService } from "./bank.service";

@Controller({ path: "banks", version: "1" })
export class BankV1Controller {
  constructor(private readonly bankService: BankService) {}

  @Get(":id")
  async getOne(@Param("id", ParseIntPipe) id: number) {
    return this.bankService.getOne(id);
  }
}
