import { Request } from 'express';

export interface PaginationParams {
    page: number;
    limit: number;
    from: number;
    to: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

/**
 * Parse pagination query params from a request.
 * Defaults: page=1, limit=50, max limit=100.
 */
export function parsePagination(req: Request): PaginationParams {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
        Math.max(1, parseInt(req.query.limit as string) || 50),
        100
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return { page, limit, from, to };
}

/**
 * Build pagination metadata for the response.
 */
export function buildPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    return {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
    };
}
