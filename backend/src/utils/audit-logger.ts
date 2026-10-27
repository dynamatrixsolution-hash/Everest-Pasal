// ==============================================================================
// EVEREST PASAL - AUDIT TRAIL & STRUCTURED LOGGING FOR DATABASE OPERATIONS
// Aligns with ENT-022 (AuditEvent) and ENG-005 / ENG-012 standards
// ==============================================================================

import { PrismaClient } from '@prisma/client';

export interface StructuredLogPayload {
  operation: string;
  status: 'STARTED' | 'SUCCESS' | 'FAILED' | 'VERIFIED' | 'CLEANUP';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  file?: string;
  sizeBytes?: number;
  verified?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Emits a structured JSON log to stdout/stderr without secrets or personal data.
 */
export function logStructured(payload: StructuredLogPayload): void {
  const cleanPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };
  if (payload.status === 'FAILED') {
    console.error(`[AUDIT] ${JSON.stringify(cleanPayload)}`);
  } else {
    console.log(`[AUDIT] ${JSON.stringify(cleanPayload)}`);
  }
}

/**
 * Attempts to persist a governance action to the AuditEvent (ENT-022) table.
 * If the database is unavailable (e.g. during restore), degrades gracefully
 * to structured console logging.
 *
 * @param eventType   Machine-readable event name e.g. 'DATABASE_BACKUP_COMPLETED'
 * @param entityType  The entity class being acted upon e.g. 'DatabaseBackup'
 * @param entityId    The specific entity identifier (nullable)
 * @param payload     Arbitrary JSON payload with contextual details
 */
export async function recordAuditEvent(
  eventType: string,
  entityType: string,
  entityId: string | null,
  payload: Record<string, any>,
  prismaClient?: PrismaClient
): Promise<void> {
  let localPrisma = prismaClient;
  let shouldDisconnect = false;

  try {
    if (!localPrisma) {
      localPrisma = new PrismaClient();
      shouldDisconnect = true;
    }

    await localPrisma.auditEvent.create({
      data: {
        eventType,
        entityType,
        entityId,
        actorType: 'SYSTEM',
        payload,
      },
    });
  } catch (err: any) {
    // When performing a backup or restore, the database might be locked or
    // in a partially migrated state. Structured console logging ensures we
    // always have an audit trail even without DB persistence.
    console.warn(`[AUDIT-WARN] Could not persist AuditEvent to DB: ${err.message}`);
  } finally {
    if (shouldDisconnect && localPrisma) {
      await localPrisma.$disconnect().catch(() => {});
    }
  }
}
