import { Sequelize } from 'sequelize';

// You will need to provide your PostgreSQL connection string in the environment variables
// Example: postgres://user:password@host:port/database

const dbUrl = process.env.DATABASE_URL;

const isValidDbUrl = dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://') || dbUrl.startsWith('sqlite:'));

if (!isValidDbUrl) {
  console.warn("⚠️ Valid DATABASE_URL environment variable is missing or malformed. Using dummy Postgres connection placeholder. The DB will fail to connect until you set a valid DATABASE_URL in the Secrets panel.");
}

export const sequelize = new Sequelize(isValidDbUrl ? dbUrl : 'postgres://dummy:dummy@localhost:5432/dummy', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false, // Set to console.log to see SQL queries
});
