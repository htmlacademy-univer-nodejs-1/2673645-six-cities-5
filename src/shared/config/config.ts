import convict from 'convict';
import 'convict-format-with-validator';

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
    }
  },
  salt: {
    doc: 'Salt for password hashing',
    format: String,
    default: '',
    env: 'SALT',
    sensitive: true
  },
  jwtSecret: {
    doc: 'JWT secret key',
    format: String,
    default: '',
    env: 'JWT_SECRET',
    sensitive: true
  }
});

export function loadConfig(): convict.Config<any> {
  try {
    require('dotenv').config();
  } catch (error) {
  }

  schema.validate({ allowed: 'strict' });
  return schema;
}

export const config = loadConfig();
