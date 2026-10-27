import { Request, Response } from 'express';
import { InventoryRepository } from '../../repositories/inventory.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getWarehousesHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new InventoryRepository(companyCode);
    const data = await repo.getWarehouses();
    sendSuccess(res, data, 'Warehouses retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_WAREHOUSES_FAILED', error.message, 500);
  }
}

export async function getStockItemsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new InventoryRepository(companyCode);
    const warehouseId = req.query.warehouseId as string;
    const listingVariantId = req.query.listingVariantId as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    const result = await repo.getStockItems({ warehouseId, listingVariantId, page, pageSize });
    sendSuccess(res, result.data, 'Stock items retrieved', 200, {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (error: any) {
    sendError(res, 'FETCH_STOCK_FAILED', error.message, 500);
  }
}

export async function adjustStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new InventoryRepository(companyCode);

    const result = await repo.adjustStock({
      ...req.body,
      performedByUserId: user?.id,
    });
    sendSuccess(res, result, 'Stock adjusted successfully with movement log', 200);
  } catch (error: any) {
    sendError(res, 'STOCK_ADJUST_FAILED', error.message, 400);
  }
}

export async function reserveStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new InventoryRepository(companyCode);

    const reservation = await repo.reserveStock(req.body);
    sendSuccess(res, reservation, 'Stock reserved successfully', 201);
  } catch (error: any) {
    sendError(res, 'STOCK_RESERVE_FAILED', error.message, 400);
  }
}

export async function releaseStockHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new InventoryRepository(companyCode);
    const { reservationId } = req.body;

    await repo.releaseReservation(reservationId);
    sendSuccess(res, { released: true }, 'Stock reservation released', 200);
  } catch (error: any) {
    sendError(res, 'STOCK_RELEASE_FAILED', error.message, 400);
  }
}
