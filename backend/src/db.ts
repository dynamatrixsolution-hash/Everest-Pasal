// ==============================================================================
// EVEREST PASAL - POSTGRESQL DATABASE CLIENT & QUERY EXECUTOR
// Provides high-performance parameterized access across all 21 schemas
// ==============================================================================

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Execute a parameterized raw query across the 21 PostgreSQL schemas
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    return await prisma.$queryRawUnsafe<T[]>(sql, ...params);
  } catch (error: any) {
    console.error(`[DB-ERROR] Query failed: ${sql}`, error);
    throw error;
  }
}

/**
 * Execute a DML/DDL statement
 */
export async function execute(sql: string, params: any[] = []): Promise<number> {
  try {
    return await prisma.$executeRawUnsafe(sql, ...params);
  } catch (error: any) {
    console.error(`[DB-ERROR] Execution failed: ${sql}`, error);
    throw error;
  }
}

export default prisma;
