// ==============================================================================
// EVEREST PASAL - CATALOG & PRODUCT MODULE TYPES
// ==============================================================================

import { ProductStatus, OfferStatus, MediaType } from '@prisma/client';

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  brand?: string;
  barcode?: string;
  categoryIds?: string[];
  status?: ProductStatus;
  tags?: string[];
  // Initial offer/pricing
  sku: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  organizationId?: string; // Vendor organization
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  brand?: string;
  barcode?: string;
  categoryIds?: string[];
  status?: ProductStatus;
  tags?: string[];
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  brand?: string;
  categoryId?: string;
  organizationId?: string;
  sortBy?: 'createdAt' | 'name' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}
