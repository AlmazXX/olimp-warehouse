import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { TypeOrmModule } from "@nestjs/typeorm";

import datasource from "./typeorm/datasource";

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(datasource.options)],
})
export class SetupModule {}
