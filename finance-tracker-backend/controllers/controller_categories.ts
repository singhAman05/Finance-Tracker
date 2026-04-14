import { Request, Response } from 'express';
import { addingCategory, getSystemCategories } from '../services/service_categories';
import { validateCategory } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { getUser } from '../middleware/jwt';
import { AppError } from '../utils/AppError';

export const handleCategoryCreation = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { name, type, color, icon, parent_id, is_default } = req.body as Record<string, unknown>;

  const valid = validateCategory(name, type);

  const result = await addingCategory({
    client_id: user.id,
    name: valid.name,
    type: valid.type,
    color: typeof color === 'string' ? color : undefined,
    icon: typeof icon === 'string' ? icon : undefined,
    parent_id: typeof parent_id === 'string' ? parent_id : undefined,
    is_default: typeof is_default === 'boolean' ? is_default : undefined,
  });

  if (result.error || !result.data) {
    throw AppError.internal('Failed to create category', result.error);
  }

  res.status(201).json({
    success: true,
    message: 'Category added successfully',
    category: result.data,
  });
});

export const handleSystemCategoryfetch = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getSystemCategories();
  if (result.error) {
    throw AppError.internal('Cannot fetch system categories', result.error);
  }

  res.status(200).json({
    success: true,
    message: 'System categories fetched',
    data: result.data ?? [],
  });
});
