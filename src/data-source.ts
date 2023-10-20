import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import Database from "./config/database.config"

export const AppDataSource = new DataSource(<DataSourceOptions>{
    type: "mysql",
    host: Database.DATABASE_HOST,
    port: Database.DATABASE_PORT,
    username: Database.DATABASE_USER,
    password: Database.DATABASE_PASS,
    database: Database.DATABASE_NAME,
    synchronize: false,
    logging: true,
    logger: "advanced-console",
    supportBigNumbers: true,
    entities: [
      __dirname + "/entity/*.ts",
      __dirname + "/entity/*.js",
    ],
    migrations: [
      __dirname + "/migration/*.ts",
      __dirname + "/migration/*.js",
    ],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection has been established successfully!');
  }).catch((err: Error) => { console.log('Database failed to initialize', err) });
