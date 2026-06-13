import {Module} from '@nestjs/common';
import { SetupModule } from './setup/setup.module';


@Module({
  imports: [SetupModule]
})
export class AppModule {
}
