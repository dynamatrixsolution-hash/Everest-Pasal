// ==============================================================================
// EVEREST PASAL - SHOPPING CART ROUTES
// ==============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getCartHandler,
  addItemToCartHandler,
  updateCartItemQuantityHandler,
  removeCartItemHandler,
  clearCartHandler,
} from './cart.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getCartHandler);
router.post('/items', addItemToCartHandler);
router.patch('/items/:itemId', updateCartItemQuantityHandler);
router.delete('/items/:itemId', removeCartItemHandler);
router.delete('/', clearCartHandler);

export default router;
