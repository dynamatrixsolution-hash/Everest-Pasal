import { Router } from 'express';
import { getCompaniesHandler, getFiscalYearsHandler, getFeatureFlagsHandler } from './system.controller.js';

const router = Router();

router.get('/companies', getCompaniesHandler);
router.get('/fiscal-years', getFiscalYearsHandler);
router.get('/feature-flags', getFeatureFlagsHandler);

export default router;
