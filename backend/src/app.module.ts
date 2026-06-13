import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { SetupModule } from "./setup/setup.module";

@Module({
  imports: [SetupModule, ApiModule],
})
export class AppModule {}
