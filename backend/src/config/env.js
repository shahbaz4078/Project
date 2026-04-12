import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongodbUri: required('MONGODB_URI'),
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  chainRpcUrl: process.env.CHAIN_RPC_URL || '',
  chainId: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : undefined,
  shipmentAuditContract: process.env.SHIPMENT_AUDIT_CONTRACT || '',
  ethPrivateKey: process.env.ETH_PRIVATE_KEY || '',
};
