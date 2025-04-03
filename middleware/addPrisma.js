const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const addPrisma = async (req, res, next) => {
  req.prisma = prisma;
  next();
}

module.exports = addPrisma;