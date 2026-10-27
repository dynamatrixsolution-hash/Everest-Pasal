import { Request, Response, NextFunction } from 'express';
import { sendError } from '../types/context.js';

export interface ValidationRule {
  field: string;
  location?: 'body' | 'query' | 'params';
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'uuid' | 'email';
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (val: any) => boolean | string;
}

export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    for (const rule of rules) {
      const loc = rule.location || 'body';
      const value = (req as any)[loc]?.[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required in ${loc}` });
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'uuid') {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(String(value))) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid UUID` });
          }
        } else if (rule.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors.push({ field: rule.field, message: `${rule.field} must be a valid email address` });
          }
        } else if (rule.type === 'number') {
          if (isNaN(Number(value))) {
            errors.push({ field: rule.field, message: `${rule.field} must be a number` });
          } else {
            const num = Number(value);
            if (rule.min !== undefined && num < rule.min) {
              errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}` });
            }
            if (rule.max !== undefined && num > rule.max) {
              errors.push({ field: rule.field, message: `${rule.field} cannot exceed ${rule.max}` });
            }
          }
        } else if (rule.type === 'string') {
          if (typeof value !== 'string') {
            errors.push({ field: rule.field, message: `${rule.field} must be a string` });
          } else {
            if (rule.min !== undefined && value.length < rule.min) {
              errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min} characters` });
            }
            if (rule.max !== undefined && value.length > rule.max) {
              errors.push({ field: rule.field, message: `${rule.field} cannot exceed ${rule.max} characters` });
            }
          }
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push({ field: rule.field, message: `${rule.field} must be one of: ${rule.enum.join(', ')}` });
        }

        if (rule.custom) {
          const customRes = rule.custom(value);
          if (customRes !== true) {
            errors.push({ field: rule.field, message: typeof customRes === 'string' ? customRes : `Invalid ${rule.field}` });
          }
        }
      }
    }

    if (errors.length > 0) {
      sendError(res, 'VALIDATION_ERROR', 'Request validation failed', 422, errors);
      return;
    }

    next();
  };
}
