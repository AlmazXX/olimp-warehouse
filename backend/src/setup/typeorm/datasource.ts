import "dotenv/config";

import { typeormEntities } from "src/common/entities";
import { DataSource } from "typeorm";
import { loadConfig } from "../config/config.schema";

const config = loadConfig();

export default new DataSource({
  type: "postgres",
  synchronize: true,
  host: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.db,
  username: config.postgres.user,
  password: config.postgres.password,
  entities: [...typeormEntities],
});
