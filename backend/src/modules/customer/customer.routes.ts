import { Router } from 'express';
import {
  getCustomerProfileHandler,
  updateCustomerProfileHandler,
  getCustomerAddressesHandler,
  createCustomerAddressHandler,
  deleteCustomerAddressHandler,
} from './customer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getCustomerProfileHandler);
router.patch('/profile', updateCustomerProfileHandler);
router.get('/addresses', getCustomerAddressesHandler);
router.post(
  '/addresses',
  validate([
    { field: 'recipientName', required: true, type: 'string' },
    { field: 'phoneNo', required: true, type: 'string' },
    { field: 'addressLine1', required: true, type: 'string' },
    { field: 'city', required: true, type: 'string' },
    { field: 'stateProvince', required: true, type: 'string' },
  ]),
  createCustomerAddressHandler
);
router.delete('/addresses/:id', deleteCustomerAddressHandler);

export default router;
