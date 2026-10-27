// ==============================================================================
// EVEREST PASAL - SHOPPING CART CONTROLLER
// Handles active basket operations for authenticated customers
// ==============================================================================

import { Request, Response } from 'express';
import { cartService } from './cart.service.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getCartHandler(req: Request, res: Response): Promise<void> {
  try {
    const accountId = (req as any).user?.id;
    if (!accountId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required to view cart', 401);
      return;
    }
    const cart = await cartService.getOrCreateActiveBasket(accountId);
    sendSuccess(res, { cart }, 'Cart retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_CART_FAILED', err.message, 500);
  }
}

export async function addItemToCartHandler(req: Request, res: Response): Promise<void> {
  try {
    const accountId = (req as any).user?.id;
    if (!accountId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }
    const { offerId, quantity } = req.body;

    if (!offerId) {
      sendError(res, 'VALIDATION_FAILED', 'offerId is required.', 400);
      return;
    }

    const qty = quantity ? parseInt(quantity, 10) : 1;
    const cart = await cartService.addItem(accountId, offerId, qty);
    sendSuccess(res, { cart }, 'Item added to cart', 200);
  } catch (err: any) {
    sendError(res, 'ADD_ITEM_FAILED', err.message, 400);
  }
}

export async function updateCartItemQuantityHandler(req: Request, res: Response): Promise<void> {
  try {
    const accountId = (req as any).user?.id;
    if (!accountId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;
    if (quantity === undefined || quantity === null) {
      sendError(res, 'VALIDATION_FAILED', 'quantity is required.', 400);
      return;
    }
    const cart = await cartService.updateItemQuantity(accountId, itemId, parseInt(quantity, 10));
    sendSuccess(res, { cart }, 'Cart updated', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_QUANTITY_FAILED', err.message, 400);
  }
}

export async function removeCartItemHandler(req: Request, res: Response): Promise<void> {
  try {
    const accountId = (req as any).user?.id;
    if (!accountId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }
    const itemId = req.params.itemId as string;
    const cart = await cartService.removeItem(accountId, itemId);
    sendSuccess(res, { cart }, 'Item removed from cart', 200);
  } catch (err: any) {
    sendError(res, 'REMOVE_ITEM_FAILED', err.message, 400);
  }
}

export async function clearCartHandler(req: Request, res: Response): Promise<void> {
  try {
    const accountId = (req as any).user?.id;
    if (!accountId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }
    await cartService.clearCart(accountId);
    sendSuccess(res, { cleared: true }, 'Cart cleared successfully', 200);
  } catch (err: any) {
    sendError(res, 'CLEAR_CART_FAILED', err.message, 500);
  }
}
