import { Router } from 'express';
import {
  getBannersHandler,
  getAllBannersAdminHandler,
  createBannerHandler,
  updateBannerHandler,
  deleteBannerHandler,
  seedBannersHandler,
  getPageBySlugHandler,
  getMenusHandler,
  getFaqsHandler,
} from './content.controller.js';

const router = Router();

// Storefront Public & Management Endpoints
router.get('/banners', getBannersHandler);
router.get('/banners/all', getAllBannersAdminHandler);
router.post('/banners', createBannerHandler);
router.put('/banners/:id', updateBannerHandler);
router.delete('/banners/:id', deleteBannerHandler);
router.post('/banners/seed', seedBannersHandler);

// CMS Pages, Menus & FAQs
router.get('/pages/:slug', getPageBySlugHandler);
router.get('/menus', getMenusHandler);
router.get('/faqs', getFaqsHandler);

export default router;
