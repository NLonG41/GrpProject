import { prisma } from "./prisma";

export const pingDatabase = async () => {
  await prisma.$queryRaw`SELECT 1`;
};

