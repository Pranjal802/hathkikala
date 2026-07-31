import { Cashfree, CFEnvironment } from 'cashfree-pg';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.CASHFREE_APP_ID || '';
const secretKey = process.env.CASHFREE_SECRET_KEY || '';
const env = process.env.CASHFREE_ENV?.toUpperCase() === 'PRODUCTION' 
  ? CFEnvironment.PRODUCTION 
  : CFEnvironment.SANDBOX;

(Cashfree as any).XClientId = appId;
(Cashfree as any).XClientSecret = secretKey;
(Cashfree as any).XEnvironment = env;

export { CFEnvironment };
export default Cashfree as any;
