import { Request, Response } from 'express';
import { CustomerRepository } from '../../repositories/customer.repository.js';
import { sendSuccess, sendError } from '../../types/context.js';

export async function getCustomerProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CustomerRepository(companyCode);

    const profile = await repo.getProfileByUserId(user.id);
    if (!profile) {
      sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer profile not found', 404);
      return;
    }
    sendSuccess(res, profile, 'Customer profile retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_PROFILE_FAILED', error.message, 500);
  }
}

export async function updateCustomerProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CustomerRepository(companyCode);

    const updated = await repo.updateProfile(user.id, req.body);
    sendSuccess(res, updated, 'Customer profile updated', 200);
  } catch (error: any) {
    sendError(res, 'UPDATE_PROFILE_FAILED', error.message, 400);
  }
}

export async function getCustomerAddressesHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CustomerRepository(companyCode);

    const profile = await repo.getProfileByUserId(user.id);
    if (!profile) {
      sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer profile not found', 404);
      return;
    }

    const addresses = await repo.getAddresses(profile.id);
    sendSuccess(res, addresses, 'Customer addresses retrieved', 200);
  } catch (error: any) {
    sendError(res, 'FETCH_ADDRESSES_FAILED', error.message, 500);
  }
}

export async function createCustomerAddressHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CustomerRepository(companyCode);

    const profile = await repo.getProfileByUserId(user.id);
    if (!profile) {
      sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer profile not found', 404);
      return;
    }

    const address = await repo.createAddress(profile.id, req.body);
    sendSuccess(res, address, 'Customer address added', 201);
  } catch (error: any) {
    sendError(res, 'CREATE_ADDRESS_FAILED', error.message, 400);
  }
}

export async function deleteCustomerAddressHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const addressId = req.params.id as string;
    const companyCode = (req as any).context?.companyCode || 'EP_NEPAL';
    const repo = new CustomerRepository(companyCode);

    const profile = await repo.getProfileByUserId(user.id);
    if (!profile) {
      sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer profile not found', 404);
      return;
    }

    await repo.deleteAddress(profile.id, addressId);
    sendSuccess(res, { deleted: true }, 'Address deleted successfully', 200);
  } catch (error: any) {
    sendError(res, 'DELETE_ADDRESS_FAILED', error.message, 400);
  }
}
