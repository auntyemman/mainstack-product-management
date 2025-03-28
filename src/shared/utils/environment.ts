import { config } from 'dotenv';

config();

export const environment = {
  database: {
    db_uri: getEnvVariable('DATABASE_URI'),
    // host: getEnvVariable('DB_HOST'),
    // port: parseInt(getEnvVariable('DB_PORT'), 10),
    // username: getEnvVariable('DB_USER'),
    // password: getEnvVariable('DB_PASSWORD'),
    // name: getEnvVariable('DB_NAME'),
  },
  jwt: {
    secret: getEnvVariable('JWT_SECRET'),
    expiresIn: getEnvVariable('JWT_EXPIRES_IN'),
    freshTokenExpiresIn: getEnvVariable('JWT_REFRESH_EXPIRES_IN'),
  },
  app: {
    port: parseInt(getEnvVariable('PORT'), 10),
    node_env: getEnvVariable('NODE_ENV'),
    // frontendDomain: getEnvVariable('FRONTEND_URL'),
    backendDomain: getBackendDomain(),
  },
};

function getBackendDomain(): string {
  const nodeEnv = getEnvVariable('NODE_ENV', false) || 'local';
  // Replace with actual environment variable name for each node environment
  switch (nodeEnv) {
    case 'development':
      return 'https://development.com/v1';
    case 'production':
      return 'https://production-domain.com/v1';
    case 'local':
    default:
      return 'http://127.0.0.1:5500/v1';
  }
}

function getEnvVariable(key: string, required = true): string {
  const value = process.env[key];

  if (required && (value === undefined || value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value!;
}