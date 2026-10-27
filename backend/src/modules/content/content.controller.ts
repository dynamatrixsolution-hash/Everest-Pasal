import { Request, Response } from 'express';
import { ContentRepository } from '../../repositories/content.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getBannersHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const placement = req.query.placement as string;
    const repo = new ContentRepository(companyCode);
    const data = await repo.getBanners(placement);
    sendSuccess(res, data, 'Banners retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_BANNERS_FAILED', error.message, 500);
  }
}

export async function getAllBannersAdminHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new ContentRepository(companyCode);
    const data = await repo.getAllBanners();
    sendSuccess(res, data, 'All banners retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ALL_BANNERS_FAILED', error.message, 500);
  }
}

export async function createBannerHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new ContentRepository(companyCode);
    const banner = await repo.createBanner(req.body);
    sendSuccess(res, banner, 'Banner created successfully', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_BANNER_FAILED', error.message, 400);
  }
}

export async function updateBannerHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const id = String(req.params.id);
    const repo = new ContentRepository(companyCode);
    const banner = await repo.updateBanner(id, req.body);
    if (!banner) {
      sendError(res, 'BANNER_NOT_FOUND', 'Banner not found', 404);
      return;
    }
    sendSuccess(res, banner, 'Banner updated successfully', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_BANNER_FAILED', error.message, 400);
  }
}

export async function deleteBannerHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const id = String(req.params.id);
    const repo = new ContentRepository(companyCode);
    await repo.deleteBanner(id);
    sendSuccess(res, { id, deleted: true }, 'Banner deleted successfully', 200);
  } catch (error: any) {
    sendError(res, 'DELETE_BANNER_FAILED', error.message, 400);
  }
}

export async function seedBannersHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new ContentRepository(companyCode);
    await repo.seedDefaultBanners();
    const data = await repo.getAllBanners();
    sendSuccess(res, data, 'Default banners seeded successfully', 200);
  } catch (error: any) {
    sendError(res, 'SEED_BANNERS_FAILED', error.message, 500);
  }
}

export async function getPageBySlugHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const slug = req.params.slug as string;
    const repo = new ContentRepository(companyCode);
    const page = await repo.getPageBySlug(slug);
    if (!page) {
      sendError(res, 'PAGE_NOT_FOUND', 'CMS Page not found', 404);
      return;
    }
    sendSuccess(res, page, 'Page content retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PAGE_FAILED', error.message, 500);
  }
}

export async function getMenusHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const menuCode = req.query.menuCode as string;
    const repo = new ContentRepository(companyCode);
    const data = await repo.getMenus(menuCode);
    sendSuccess(res, data, 'Menus retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_MENUS_FAILED', error.message, 500);
  }
}

export async function getFaqsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const category = req.query.category as string;
    const repo = new ContentRepository(companyCode);
    const data = await repo.getFaqs(category);
    sendSuccess(res, data, 'FAQs retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_FAQS_FAILED', error.message, 500);
  }
}
