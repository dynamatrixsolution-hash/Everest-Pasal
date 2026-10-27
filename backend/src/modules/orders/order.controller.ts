// ==============================================================================
// EVEREST PASAL - ORDER & MULTI-VENDOR FULFILLMENT CONTROLLER
// Customer checkout, customer order tracking, vendor order fulfillment, and admin queries
// ==============================================================================

import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function checkoutHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required to checkout', 401);
      return;
    }

    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);
    const { idempotencyKey, addressId, paymentGateway, notes, cartId, recipientName, recipientPhone, addressLine1, cityName } = req.body;

    const key = idempotencyKey || `chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const order = await orderService.checkout(user.id, key, {
      cartId,
      recipientName: recipientName || user.displayName,
      recipientPhone: recipientPhone || user.phone || '9800000000',
      addressLine1: addressLine1 || 'Kathmandu, Nepal',
      cityName: cityName || 'Kathmandu',
      paymentMethod: paymentGateway || 'COD',
    });

    sendSuccess(res, { order }, 'Order created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CHECKOUT_FAILED', err.message, 400);
  }
}

export async function getCustomerOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);

    const orders = await orderService.getCustomerOrders(user.id);
    sendSuccess(res, { orders }, 'Orders retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_ORDERS_FAILED', err.message, 500);
  }
}

export async function getOrderByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const id = req.params.id as string;
    const isStaff = user.roles.some((r: any) =>
      ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'PLATFORM_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT'].includes(typeof r === 'string' ? r : r.role)
    );

    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);

    const order = await orderService.getOrderById(id, isStaff ? undefined : user.id);
    if (!order) {
      sendError(res, 'NOT_FOUND', `Order "${id}" not found.`, 404);
      return;
    }

    sendSuccess(res, { order }, 'Order details retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_ORDER_FAILED', err.message, 403);
  }
}

export async function getVendorFulfillmentUnitsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const vendorId = req.query.organizationId as string || user.vendorId || user.id;

    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);

    const status = req.query.status as string | undefined;
    const fulfillmentUnits = await orderService.getVendorFulfillmentUnits(vendorId, status);
    sendSuccess(res, { fulfillmentUnits }, 'Vendor orders retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_VENDOR_ORDERS_FAILED', err.message, 500);
  }
}

export async function updateVendorFulfillmentStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const unitId = req.params.unitId as string;
    const { status, organizationId } = req.body;
    const orgId = organizationId || user.vendorId || user.id;

    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);

    const updatedUnit = await orderService.updateFulfillmentUnitStatus(
      unitId,
      orgId,
      status as any,
      req.body,
      user.id
    );

    sendSuccess(res, { fulfillmentUnit: updatedUnit }, 'Fulfillment status updated', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_FULFILLMENT_FAILED', err.message, 400);
  }
}

export async function getAdminOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);

    const { page, limit, status, search } = req.query;
    const result = await orderService.getAdminOrders({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      status: status as any,
      search: search as string,
    });
    sendSuccess(res, result.orders, 'Admin orders retrieved', 200, { total: result.total });
  } catch (err: any) {
    sendError(res, 'FETCH_ADMIN_ORDERS_FAILED', err.message, 500);
  }
}

export async function cancelOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;
    const isStaff = user.roles.some((r: any) =>
      ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'PLATFORM_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT'].includes(typeof r === 'string' ? r : r.role)
    );
    const { reason } = req.body;

    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const orderService = new OrderService(companyCode);

    const order = await orderService.cancelOrder(id, user.id, reason, isStaff);
    sendSuccess(res, { order }, 'Order cancelled successfully.', 200);
  } catch (err: any) {
    sendError(res, 'CANCEL_ORDER_FAILED', err.message, 400);
  }
}
