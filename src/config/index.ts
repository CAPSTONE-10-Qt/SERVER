import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * port
   */
  port: parseInt(process.env.PORT as string, 10) as number,
  /**
   * EC2
   */
  ec2URL: process.env.EC2_URL as string,
  /**
   * JWT
   */
  jwtSecret: process.env.JWT_SECRET as string,
  jwtAlgo: process.env.JWT_ALGORITHM as string,
};