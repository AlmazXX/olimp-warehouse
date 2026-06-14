import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "./config/config.module";
import { DataMockingService } from "./typeorm/data-mocking.service";
import datasource from "./typeorm/datasource";

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(datasource.options)],
  providers: [
    DataMockingService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class SetupModule {}
