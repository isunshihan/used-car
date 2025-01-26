import { PrismaClient } from '@prisma/client'

// 在开发环境中避免热重载时创建多个 Prisma 实例
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
