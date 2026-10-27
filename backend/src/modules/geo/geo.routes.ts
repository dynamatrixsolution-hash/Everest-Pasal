import { Router } from 'express';
import {
  getCountriesHandler,
  getProvincesHandler,
  getDistrictsHandler,
  getCitiesHandler,
  getDeliveryZonesHandler,
} from './geo.controller.js';

const router = Router();

router.get('/countries', getCountriesHandler);
router.get('/provinces', getProvincesHandler);
router.get('/districts', getDistrictsHandler);
router.get('/cities', getCitiesHandler);
router.get('/delivery-zones', getDeliveryZonesHandler);

export default router;
