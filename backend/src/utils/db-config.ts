// ==============================================================================
// EVEREST PASAL - DATABASE & POSTGRESQL BINARY CONFIGURATION UTILITY
// ==============================================================================

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl?: boolean;
  sanitizedUrl: string;
}

/**
 * Safely parses a PostgreSQL connection URL without throwing uncaught errors
 * or leaking raw credentials.
 */
export function parseDatabaseUrl(connectionUrl: string): DatabaseConfig {
  if (!connectionUrl || typeof connectionUrl !== 'string') {
    throw new Error('DATABASE_URL is required and must be a valid string.');
  }

  try {
    const url = new URL(connectionUrl);
    if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
      throw new Error(`Unsupported database protocol: ${url.protocol}`);
    }

    const host = url.hostname || 'localhost';
    const port = url.port ? parseInt(url.port, 10) : 5432;
    const database = url.pathname ? url.pathname.replace(/^\//, '') : '';
    const user = decodeURIComponent(url.username || 'postgres');
    const password = url.password ? decodeURIComponent(url.password) : undefined;
    const ssl = url.searchParams.get('sslmode') === 'require' || url.searchParams.get('ssl') === 'true';

    if (!database) {
      throw new Error('Database name could not be parsed from DATABASE_URL.');
    }

    const sanitizedUrl = redactDatabaseUrl(connectionUrl);

    return {
      host,
      port,
      database,
      user,
      password,
      ssl,
      sanitizedUrl,
    };
  } catch (err: any) {
    if (err.message?.includes('DATABASE_URL') || err.message?.includes('Database name')) {
      throw err;
    }
    throw new Error(`Invalid PostgreSQL connection URL format: ${err.message}`);
  }
}

/**
 * Redacts passwords and sensitive tokens from PostgreSQL URLs.
 */
export function redactDatabaseUrl(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr);
    if (parsed.password) {
      parsed.password = '*****';
    }
    // Remove trailing slash if original didn't have one and replace URL encoded characters cleanly
    return parsed.toString();
  } catch {
    return urlStr.replace(/(postgres(?:ql)?:\/\/[^:]+:)(.*)(@.+)/i, '$1*****$3');
  }
}

/**
 * Locates PostgreSQL client binaries (pg_dump, pg_restore, psql).
 * Checks PG_BIN_PATH environment variable, PATH, and standard Windows directories.
 */
export function findPgBinary(binaryName: 'pg_dump' | 'pg_restore' | 'psql'): string {
  const isWindows = process.platform === 'win32';
  const executableName = isWindows ? `${binaryName}.exe` : binaryName;

  // 1. Check explicit PG_BIN_PATH from environment
  const envBinPath = process.env.PG_BIN_PATH;
  if (envBinPath) {
    const fullPath = path.join(envBinPath, executableName);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // 2. Check standard Windows installations if running on Windows
  if (isWindows) {
    const versions = ['18', '17', '16', '15', '14'];
    for (const v of versions) {
      const standardPath = path.join('C:', 'Program Files', 'PostgreSQL', v, 'bin', executableName);
      if (fs.existsSync(standardPath)) {
        return standardPath;
      }
    }
  }

  // 3. Fallback to assuming it's available in global PATH
  return executableName;
}
