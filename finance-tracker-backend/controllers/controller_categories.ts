import { Request, Response } from 'express';
import { addingCategory, getSystemCategories, verifyCategoryOwnership } from '../services/service_categories';
import { validateCategory, validateUUID } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { getUser } from '../middleware/jwt';
import { AppError } from '../utils/AppError';

export const handleCategoryCreation = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { name, type, color, icon, parent_id, is_default } = req.body as Record<string, unknown>;

  const valid = validateCategory(name, type);

  // Validate and verify parent_id ownership if provided
  let validatedParentId: string | undefined;
  if (typeof parent_id === 'string' && parent_id.trim()) {
    validatedParentId = validateUUID(parent_id, 'Parent category ID');
    const ownsParent = await verifyCategoryOwnership(validatedParentId, user.id);
    if (!ownsParent) {
      throw AppError.forbidden('Parent category does not belong to you');
    }
  }

  const result = await addingCategory({
    client_id: user.id,
    name: valid.name,
    type: valid.type,
    color: typeof color === 'string' ? color : undefined,
    icon: typeof icon === 'string' ? icon : undefined,
    parent_id: validatedParentId,
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
