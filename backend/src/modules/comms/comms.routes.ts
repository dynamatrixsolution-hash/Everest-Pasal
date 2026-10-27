import { Router } from 'express';
import {
  getUserNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
} from './comms.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getUserNotificationsHandler);
router.post('/:id/read', markNotificationReadHandler);
router.post('/read-all', markAllNotificationsReadHandler);

export default router;
