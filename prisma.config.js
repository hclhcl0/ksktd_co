require('dotenv').config();

module.exports = {
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  },
};
