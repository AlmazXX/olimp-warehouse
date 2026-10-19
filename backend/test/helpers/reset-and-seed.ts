import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SeedService } from "../../src/setup/seed/seed.service";

export const resetAndSeed = async (app: INestApplication) => {
  const dataSource = app.get(DataSource);

  await dataSource.query('TRUNCATE TABLE "transactions", "persons", "banks" RESTART IDENTITY CASCADE;');

  const seedService = app.get(SeedService);
  await seedService.onApplicationBootstrap();
};
