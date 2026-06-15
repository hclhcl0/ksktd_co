module.exports = {
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_URL,
  },
};
