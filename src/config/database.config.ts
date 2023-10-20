import { cleanEnv, port, str } from "envalid";
import { config } from "dotenv";

config({ path: __dirname + '/./../../.env' });

/**
 * Declare the database interface
*/
interface IDatabase {
  DATABASE_PORT: number,
  DATABASE_HOST: string,
  DATABASE_USER: string,
  DATABASE_PASS: string,
  DATABASE_NAME: string
}

const Database: Readonly<IDatabase> = cleanEnv(process.env, {
  DATABASE_PORT: port(),
  DATABASE_HOST: str(),
  DATABASE_USER: str(),
  DATABASE_PASS: str(),
  DATABASE_NAME: str()
});

export default Database;