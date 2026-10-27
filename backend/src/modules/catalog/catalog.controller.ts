// ==============================================================================
// EVEREST PASAL - CATALOG & PRODUCT CONTROLLER
// Express handlers for catalog resources with standard API formatting
// ==============================================================================

import { Request, Response } from 'express';
import { CatalogService } from './catalog.service.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function listProductsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);
    const { page, limit, search, brand, categoryId, sortBy, sortOrder } = req.query;

    const result = await catalogService.listProducts({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      brand: brand as string,
      categoryId: ((categoryId || req.query.category) as string),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    });

    sendSuccess(res, result.data, 'Products retrieved successfully', 200, result.pagination);
  } catch (err: any) {
    sendError(res, 'FETCH_PRODUCTS_FAILED', err.message, 500);
  }
}

export async function searchProductsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);
    const q = req.query.q as string;
    const categoryId = req.query.category as string || req.query.categoryId as string;
    const brandId = req.query.brand as string || req.query.brandId as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    const result = await catalogService.searchProducts({
      q,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      page,
      pageSize,
    });

    sendSuccess(res, result.data, 'Search results retrieved', 200, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err: any) {
    sendError(res, 'SEARCH_PRODUCTS_FAILED', err.message, 500);
  }
}

export async function getProductByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const product = await catalogService.getProductById(id);
    if (!product) {
      sendError(res, 'NOT_FOUND', `Product "${id}" not found.`, 404);
      return;
    }
    sendSuccess(res, { product }, 'Product details retrieved', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_PRODUCT_FAILED', err.message, 500);
  }
}

export async function createProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const product = await catalogService.createProduct(req.body);
    sendSuccess(res, { product }, 'Product created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_PRODUCT_FAILED', err.message, 400);
  }
}

export async function updateProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const product = await catalogService.updateProduct(id, req.body);
    sendSuccess(res, { product }, 'Product updated successfully', 200);
  } catch (err: any) {
    sendError(res, 'UPDATE_PRODUCT_FAILED', err.message, 400);
  }
}

export async function setProductStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status) {
      sendError(res, 'VALIDATION_FAILED', 'Status is required.', 400);
      return;
    }
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const product = await catalogService.setProductStatus(id, status);
    sendSuccess(res, { product }, 'Product status updated', 200);
  } catch (err: any) {
    sendError(res, 'STATUS_UPDATE_FAILED', err.message, 400);
  }
}

export async function deactivateProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const product = await catalogService.setProductStatus(id, 'ARCHIVED');
    sendSuccess(res, { product }, 'Product archived successfully', 200);
  } catch (err: any) {
    sendError(res, 'DEACTIVATE_FAILED', err.message, 400);
  }
}

export async function listCategoriesHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const categories = await catalogService.listCategories();
    sendSuccess(res, { categories }, 'Categories retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_CATEGORIES_FAILED', err.message, 500);
  }
}

export async function listBrandsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const brands = await catalogService.listBrands();
    sendSuccess(res, { brands }, 'Brands retrieved successfully', 200);
  } catch (err: any) {
    sendError(res, 'FETCH_BRANDS_FAILED', err.message, 500);
  }
}

export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const category = await catalogService.createCategory(req.body);
    sendSuccess(res, { category }, 'Category created successfully', 201);
  } catch (err: any) {
    sendError(res, 'CREATE_CATEGORY_FAILED', err.message, 400);
  }
}

export async function adjustStockHandler(req: any, res: Response): Promise<void> {
  try {
    const { offerId } = req.params;
    const { delta, reason } = req.body;
    const deltaNum = parseInt(delta, 10);

    if (isNaN(deltaNum)) {
      sendError(res, 'VALIDATION_FAILED', 'Valid integer delta is required.', 400);
      return;
    }

    const companyCode = req.context?.companyCode || 'EP_NEPAL';
    const catalogService = new CatalogService(companyCode);

    const position = await catalogService.adjustStock(offerId, deltaNum, reason, req.user?.id);
    sendSuccess(res, { position }, 'Stock adjusted successfully', 200);
  } catch (err: any) {
    sendError(res, 'ADJUST_STOCK_FAILED', err.message, 400);
  }
}
