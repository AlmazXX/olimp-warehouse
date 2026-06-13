import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { loadConfig } from "./config.schema";

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: loadConfig,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
