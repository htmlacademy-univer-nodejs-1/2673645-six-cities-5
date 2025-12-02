import convict from 'convict';
import 'convict-format-with-validator';
import dotenv from 'dotenv';

dotenv.config();

const schema = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port the server will listen on',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  db: {
    host: {
      doc: 'Database host address',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'DB_HOST'
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 27017,
      env: 'DB_PORT'
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'six-cities',
      env: 'DB_NAME'
    },
    user: {
      doc: 'Database user',
      format: String,
      default: '',
      env: 'DB_USER'
    },
    password: {
      doc: 'Database password',
      format: String,
      default: '',
      env: 'DB_PASSWORD'
    }
  },
  salt: {
    doc: 'Salt for password hashing',
    format: String,
    default: '10',
    env: 'SALT'
  },
  uploadDir: {
    doc: 'Directory for uploaded files',
    format: String,
    default: './uploads',
    env: 'UPLOAD_DIR'
  },
  jwtSecret: {
    doc: 'JWT secret key',
    format: String,
    default: 'your-secret-key-change-in-production',
    env: 'JWT_SECRET',
    sensitive: true
  },
  jwtExpiration: {
    doc: 'JWT token expiration time',
    format: String,
    default: '24h',
    env: 'JWT_EXPIRATION'
  },
  logLevel: {
    doc: 'Log level',
    format: ['error', 'warn', 'info', 'debug', 'trace'],
    default: 'info',
    env: 'LOG_LEVEL'
  }
});

export function loadConfig(): convict.Config<any> {
  schema.validate({ allowed: 'strict' });
  return schema;
}

export const config = loadConfig();
