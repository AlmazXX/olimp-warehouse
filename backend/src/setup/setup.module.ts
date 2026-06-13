import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "./config/config.module";
import { DataMockingService } from "./typeorm/data-mocking.service";
import datasource from "./typeorm/datasource";

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(datasource.options)],
  providers: [DataMockingService],
})
export class SetupModule {}
