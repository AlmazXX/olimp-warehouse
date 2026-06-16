import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "./config/config.module";
import { SeedModule } from "./seed/seed.module";
import datasource from "./typeorm/datasource";

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(datasource.options), SeedModule],
  providers: [
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
