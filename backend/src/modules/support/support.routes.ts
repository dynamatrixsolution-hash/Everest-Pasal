import { Router } from 'express';
import {
  createTicketHandler,
  getTicketsHandler,
  getTicketDetailsHandler,
  addTicketMessageHandler,
  updateTicketStatusHandler,
} from './support.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getTicketsHandler);
router.get('/:id', getTicketDetailsHandler);

router.post(
  '/',
  validate([
    { field: 'ticketType', required: true, type: 'string' },
    { field: 'subject', required: true, type: 'string' },
    { field: 'initialMessage', required: true, type: 'string' },
  ]),
  createTicketHandler
);

router.post(
  '/:id/messages',
  validate([
    { field: 'messageBody', required: true, type: 'string' },
  ]),
  addTicketMessageHandler
);

router.patch(
  '/:id/status',
  validate([
    { field: 'status', required: true, type: 'string' },
  ]),
  updateTicketStatusHandler
);

export default router;
