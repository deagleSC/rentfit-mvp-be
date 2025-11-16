import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    errors?: any[];
    stack?: string;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Standardized success response
 */
export class ApiResponseHandler {
  /**
   * Send success response with data
   */
  static success<T>(
    res: Response,
    data: T | null,
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
    };

    if (data !== null && data !== undefined) {
      response.data = data;
    }

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send success response with pagination metadata
   */
  static successWithPagination<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T[]>> {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      meta: {
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
        },
      },
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(res: Response, data: T, message?: string): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any[],
    stack?: string
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
      },
    };

    if (errors && errors.length > 0) {
      response.error!.errors = errors;
    }

    if (stack && process.env.NODE_ENV === 'development') {
      response.error!.stack = stack;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response (400)
   */
  static validationError(
    res: Response,
    message: string = 'Validation failed',
    errors?: any[]
  ): Response<ApiResponse> {
    return this.error(res, message, 400, errors);
  }

  /**
   * Send unauthorized error response (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Authentication required'
  ): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden error response (403)
   */
  static forbidden(res: Response, message: string = 'Access denied'): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  /**
   * Send not found error response (404)
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  /**
   * Send conflict error response (409)
   */
  static conflict(
    res: Response,
    message: string = 'Resource already exists'
  ): Response<ApiResponse> {
    return this.error(res, message, 409);
  }
}
