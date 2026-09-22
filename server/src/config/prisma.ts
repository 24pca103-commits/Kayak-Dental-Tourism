import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient; isDbConnected?: boolean };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let dbOnline = false;

export const setDbConnected = (status: boolean) => {
  dbOnline = status;
};

export const isDbOnline = (): boolean => {
  return dbOnline;
};

export default prisma;
