import {VERSION_NEUTRAL, VersioningType} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {AppConfig} from "./setup/config/config.schema";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const port = app.get(ConfigService<AppConfig, true>).get("port", 8000, {infer: true});

  app.enableVersioning({type: VersioningType.URI, defaultVersion: VERSION_NEUTRAL})
  app.enableShutdownHooks()

  await app.listen(port);
}
void bootstrap();
