import { Request, Response } from 'express';
import {
  clearHistoryService,
  exportUserDataService,
  getSettingsService,
  updateSettingsService,
} from '../services/service_settings';
import { invalidateClearHistory } from '../utils/cacheUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { getUser } from '../middleware/jwt';
import { validateSettingsPayload } from '../utils/validationUtils';

export const handleGetSettings = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const settings = await getSettingsService(user.id);
  res.status(200).json({ success: true, message: 'Settings fetched successfully', data: settings });
});

export const handleUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const validated = validateSettingsPayload(req.body as Record<string, unknown>);
  const updatedSettings = await updateSettingsService(user.id, validated);

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: updatedSettings,
  });
});

export const handleExportUserData = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const data = await exportUserDataService(user.id);
  res.status(200).json({ success: true, message: 'Data export prepared', data });
});

export const handleClearHistory = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const result = await clearHistoryService(user.id);
  await invalidateClearHistory(user.id);

  res.status(200).json({
    success: true,
    message: 'History cleared successfully',
    data: result,
  });
});
