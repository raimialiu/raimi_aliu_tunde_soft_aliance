import { cleanEnv, port, str } from "envalid";
import { config } from "dotenv";

config({ path: __dirname + '/./../../.env' });

/**
 * Declare the application interface
*/
interface ICloudinary {
 CLOUD_NAME: string,
 CLOUD_API_KEY: string,
 CLOUD_API_SECRET: string
}

const CloudinaryConfig: Readonly<ICloudinary> = cleanEnv(process.env, {
  CLOUD_API_SECRET: str(),
  CLOUD_NAME: str(),
  CLOUD_API_KEY: str()
});

export default CloudinaryConfig;