// ==============================================================================
// EVEREST PASAL - BACKUP HEALTH CONTROLLER
// Exposes operational backup status for administration, monitoring, and DR audits
// ==============================================================================

import { Request, Response } from 'express';
import { getBackupHealthStatus } from './backup.service.js';

export function getBackupStatusHandler(req: Request, res: Response) {
  try {
    const status = getBackupHealthStatus();
    const httpStatus = status.serviceStatus === 'HEALTHY' ? 200 : 200; // Return 200 with status flag for monitor observability
    res.status(httpStatus).json(status);
  } catch (err: any) {
    res.status(500).json({
      serviceStatus: 'UNHEALTHY',
      error: 'Failed to retrieve backup health status.',
    });
  }
}
