const swaggerDocument = {
  swagger: '2.0',
  info: {
    title: 'RentFit API',
    description:
      "Backend API for RentFit.ai - India's rent management platform for tenants & property owners",
    version: '1.0.0',
    contact: {
      name: 'RentFit Team',
    },
  },
  host: process.env.SWAGGER_HOST || 'localhost:4000',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http', 'https'],
  basePath: '/api',
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Units',
      description: 'Property unit management endpoints',
    },
    {
      name: 'Tenancies',
      description: 'Tenancy management endpoints',
    },
    {
      name: 'Static',
      description: 'Static data management endpoints (Countries, States, Cities)',
    },
    {
      name: 'Upload',
      description: 'File upload endpoints (Cloudinary integration)',
    },
    {
      name: 'Agreements',
      description: 'Agreement templates and signing workflow endpoints',
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check if the API is running',
        responses: {
          200: {
            description: 'API is healthy',
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                message: { type: 'string', example: 'RentFit API is running' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account and get authentication token',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateUserRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'User registered successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User registered successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'User already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate user with email and password',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john.doe@example.com',
                },
                password: {
                  type: 'string',
                  example: 'SecurePass123',
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: 'Login successful',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Login successful' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          401: {
            description: 'Invalid credentials',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh JWT token',
        description: 'Generate a new JWT token for the authenticated user',
        produces: ['application/json'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Token refreshed successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Token refreshed successfully' },
                data: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Get the profile of the currently authenticated user',
        produces: ['application/json'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change user password',
        description: 'Change the password for the authenticated user',
        consumes: ['application/json'],
        produces: ['application/json'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: {
                  type: 'string',
                  example: 'OldPassword123',
                },
                newPassword: {
                  type: 'string',
                  minLength: 8,
                  example: 'NewPassword123',
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: 'Password changed successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Password changed successfully' },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          401: {
            description: 'Authentication required or invalid current password',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Register a new user in the system. Supports both tenant and landlord roles.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateUserRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'User created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'User already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of users with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Number of items per page',
          },
          {
            name: 'role',
            in: 'query',
            type: 'string',
            enum: ['tenant', 'landlord', 'admin'],
            description: 'Filter by user role',
          },
          {
            name: 'isActive',
            in: 'query',
            type: 'boolean',
            description: 'Filter by active status',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            description: 'Search by name, email, or phone',
          },
        ],
        responses: {
          200: {
            description: 'List of users retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/definitions/User' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid user ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user by ID',
        description: 'Update user information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateUserRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'User updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'Email or phone already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user by ID',
        description: 'Permanently delete a user from the system',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid user ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate user',
        description: 'Soft delete a user by setting isActive to false',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User deactivated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User deactivated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid user ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/units': {
      post: {
        tags: ['Units'],
        summary: 'Create a new unit',
        description: 'Create a new property unit',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateUnitRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'Unit created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Unit created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    unit: { $ref: '#/definitions/Unit' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Units'],
        summary: 'Get all units',
        description: 'Retrieve a list of units with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Number of items per page',
          },
          {
            name: 'ownerId',
            in: 'query',
            type: 'string',
            description: 'Filter by owner ID',
          },
          {
            name: 'status',
            in: 'query',
            type: 'string',
            enum: ['vacant', 'occupied', 'maintenance'],
            description: 'Filter by unit status',
          },
          {
            name: 'city',
            in: 'query',
            type: 'string',
            description: 'Filter by city',
          },
          {
            name: 'state',
            in: 'query',
            type: 'string',
            description: 'Filter by state',
          },
          {
            name: 'minBeds',
            in: 'query',
            type: 'integer',
            minimum: 0,
            description: 'Minimum number of beds',
          },
          {
            name: 'maxBeds',
            in: 'query',
            type: 'integer',
            minimum: 0,
            description: 'Maximum number of beds',
          },
          {
            name: 'minArea',
            in: 'query',
            type: 'number',
            minimum: 0,
            description: 'Minimum area in square feet',
          },
          {
            name: 'maxArea',
            in: 'query',
            type: 'number',
            minimum: 0,
            description: 'Maximum area in square feet',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            description: 'Search by title, address, city, state, or pincode',
          },
        ],
        responses: {
          200: {
            description: 'List of units retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    units: {
                      type: 'array',
                      items: { $ref: '#/definitions/Unit' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/units/{id}': {
      get: {
        tags: ['Units'],
        summary: 'Get unit by ID',
        description: 'Retrieve a specific unit by its ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Unit ID',
          },
        ],
        responses: {
          200: {
            description: 'Unit retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    unit: { $ref: '#/definitions/Unit' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid unit ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Unit not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Units'],
        summary: 'Update unit by ID',
        description: 'Update unit information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Unit ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateUnitRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'Unit updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Unit updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    unit: { $ref: '#/definitions/Unit' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Unit not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Units'],
        summary: 'Delete unit by ID',
        description: 'Permanently delete a unit from the system',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Unit ID',
          },
        ],
        responses: {
          200: {
            description: 'Unit deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Unit deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid unit ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Unit not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/tenancies': {
      post: {
        tags: ['Tenancies'],
        summary: 'Create a new tenancy',
        description: 'Create a new tenancy agreement between owner and tenant',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateTenancyRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'Tenancy created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Tenancy created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    tenancy: { $ref: '#/definitions/Tenancy' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Tenancies'],
        summary: 'Get all tenancies',
        description: 'Retrieve a list of tenancies with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Number of items per page',
          },
          {
            name: 'ownerId',
            in: 'query',
            type: 'string',
            description: 'Filter by owner ID',
          },
          {
            name: 'tenantId',
            in: 'query',
            type: 'string',
            description: 'Filter by tenant ID',
          },
          {
            name: 'unitId',
            in: 'query',
            type: 'string',
            description: 'Filter by unit ID',
          },
          {
            name: 'status',
            in: 'query',
            type: 'string',
            enum: ['active', 'terminated', 'pendingRenewal'],
            description: 'Filter by tenancy status',
          },
        ],
        responses: {
          200: {
            description: 'List of tenancies retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    tenancies: {
                      type: 'array',
                      items: { $ref: '#/definitions/Tenancy' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/tenancies/{id}': {
      get: {
        tags: ['Tenancies'],
        summary: 'Get tenancy by ID',
        description: 'Retrieve a specific tenancy by its ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Tenancy ID',
          },
        ],
        responses: {
          200: {
            description: 'Tenancy retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    tenancy: { $ref: '#/definitions/Tenancy' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid tenancy ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Tenancy not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Tenancies'],
        summary: 'Update tenancy by ID',
        description: 'Update tenancy information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Tenancy ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateTenancyRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'Tenancy updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Tenancy updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    tenancy: { $ref: '#/definitions/Tenancy' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Tenancy not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Tenancies'],
        summary: 'Delete tenancy by ID',
        description: 'Permanently delete a tenancy from the system',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Tenancy ID',
          },
        ],
        responses: {
          200: {
            description: 'Tenancy deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Tenancy deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid tenancy ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Tenancy not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/agreements': {
      post: {
        tags: ['Agreements'],
        summary: 'Create a new agreement',
        description:
          'Create a new agreement document. PDF will be automatically generated from the agreement data and uploaded to Cloudinary. Either provide tenancyId (if tenancy exists) or tenancyData (if creating agreement before tenancy).',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateAgreementRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'Agreement created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Agreement created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    agreement: { $ref: '#/definitions/Agreement' },
                  },
                },
              },
            },
          },
          400: {
            description:
              'Validation error (e.g., missing tenancyId/tenancyData, invalid IDs, or both provided)',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description:
              'Tenancy not found (when using tenancyId) or owner/tenant/unit not found (when using tenancyData)',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          500: {
            description: 'PDF generation or Cloudinary upload failed',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Agreements'],
        summary: 'Get agreements',
        description: 'Retrieve a list of agreements with pagination and filtering',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Number of items per page',
          },
          {
            name: 'tenancyId',
            in: 'query',
            type: 'string',
            description: 'Filter by tenancy ID',
          },
          {
            name: 'createdBy',
            in: 'query',
            type: 'string',
            description: 'Filter by creator user ID',
          },
          {
            name: 'status',
            in: 'query',
            type: 'string',
            enum: ['draft', 'pending_signature', 'signed', 'cancelled'],
            description: 'Filter by agreement status',
          },
        ],
        responses: {
          200: {
            description: 'List of agreements retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    agreements: {
                      type: 'array',
                      items: { $ref: '#/definitions/Agreement' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/agreements/{id}': {
      get: {
        tags: ['Agreements'],
        summary: 'Get agreement by ID',
        description: 'Retrieve a specific agreement by its ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Agreement ID',
          },
        ],
        responses: {
          200: {
            description: 'Agreement retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    agreement: { $ref: '#/definitions/Agreement' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid agreement ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Agreement not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Agreements'],
        summary: 'Update agreement by ID',
        description: 'Update agreement metadata, clauses, status, or signers',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Agreement ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateAgreementRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'Agreement updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Agreement updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    agreement: { $ref: '#/definitions/Agreement' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Agreement not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Agreements'],
        summary: 'Delete agreement by ID',
        description: 'Permanently delete an agreement',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Agreement ID',
          },
        ],
        responses: {
          200: {
            description: 'Agreement deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Agreement deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid agreement ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Agreement not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/agreements/{id}/sign': {
      post: {
        tags: ['Agreements'],
        summary: 'Sign agreement',
        description:
          'Add or update a signature for a user on an agreement. Updates agreement status automatically based on signing progress. If all signers have signed, status is updated to "signed".',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Agreement ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/SignAgreementRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'Agreement signed successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Agreement signed successfully' },
                data: {
                  type: 'object',
                  properties: {
                    agreement: { $ref: '#/definitions/Agreement' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or agreement already signed/cancelled',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Agreement not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/static/countries': {
      post: {
        tags: ['Static'],
        summary: 'Create multiple countries',
        description:
          'Create multiple country entries. Request body must be an array of country objects.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            description: 'Array of country objects',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/CreateCountryRequest' },
              minItems: 1,
            },
          },
        ],
        responses: {
          201: {
            description: 'Countries created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '3 countries created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    countries: {
                      type: 'array',
                      items: { $ref: '#/definitions/Country' },
                    },
                    count: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'Country already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Static'],
        summary: 'Get all countries',
        description: 'Retrieve a list of countries with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 500,
            default: 100,
            description: 'Number of items per page',
          },
          {
            name: 'isActive',
            in: 'query',
            type: 'boolean',
            description: 'Filter by active status',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            description: 'Search by name or code',
          },
        ],
        responses: {
          200: {
            description: 'List of countries retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'array',
                  items: { $ref: '#/definitions/Country' },
                },
                meta: {
                  type: 'object',
                  properties: {
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 100 },
                        total: { type: 'integer', example: 195 },
                        totalPages: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/static/countries/{id}': {
      get: {
        tags: ['Static'],
        summary: 'Get country by ID',
        description: 'Retrieve a specific country by its ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Country ID',
          },
        ],
        responses: {
          200: {
            description: 'Country retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    country: { $ref: '#/definitions/Country' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid country ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Country not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Static'],
        summary: 'Update country by ID',
        description: 'Update country information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Country ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateCountryRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'Country updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Country updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    country: { $ref: '#/definitions/Country' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Country not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Static'],
        summary: 'Delete country by ID',
        description: 'Permanently delete a country from the system. Cannot delete if states exist.',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Country ID',
          },
        ],
        responses: {
          200: {
            description: 'Country deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Country deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid country ID or country has associated states',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Country not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/static/states': {
      post: {
        tags: ['Static'],
        summary: 'Create multiple states',
        description:
          'Create multiple state entries. Request body must be an array of state objects.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            description: 'Array of state objects',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/CreateStateRequest' },
              minItems: 1,
            },
          },
        ],
        responses: {
          201: {
            description: 'States created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '5 states created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    states: {
                      type: 'array',
                      items: { $ref: '#/definitions/State' },
                    },
                    count: { type: 'integer', example: 5 },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'Country not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Static'],
        summary: 'Get all states',
        description: 'Retrieve a list of states with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 500,
            default: 100,
            description: 'Number of items per page',
          },
          {
            name: 'countryId',
            in: 'query',
            type: 'string',
            description: 'Filter by country ID',
          },
          {
            name: 'isActive',
            in: 'query',
            type: 'boolean',
            description: 'Filter by active status',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            description: 'Search by name or code',
          },
        ],
        responses: {
          200: {
            description: 'List of states retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'array',
                  items: { $ref: '#/definitions/State' },
                },
                meta: {
                  type: 'object',
                  properties: {
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 100 },
                        total: { type: 'integer', example: 36 },
                        totalPages: { type: 'integer', example: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/static/states/{id}': {
      get: {
        tags: ['Static'],
        summary: 'Get state by ID',
        description: 'Retrieve a specific state by its ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'State ID',
          },
        ],
        responses: {
          200: {
            description: 'State retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    state: { $ref: '#/definitions/State' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid state ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'State not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Static'],
        summary: 'Update state by ID',
        description: 'Update state information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'State ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateStateRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'State updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'State updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    state: { $ref: '#/definitions/State' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'State or country not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Static'],
        summary: 'Delete state by ID',
        description: 'Permanently delete a state from the system. Cannot delete if cities exist.',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'State ID',
          },
        ],
        responses: {
          200: {
            description: 'State deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'State deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid state ID or state has associated cities',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'State not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/static/cities': {
      post: {
        tags: ['Static'],
        summary: 'Create multiple cities',
        description: 'Create multiple city entries. Request body must be an array of city objects.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            description: 'Array of city objects',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/CreateCityRequest' },
              minItems: 1,
            },
          },
        ],
        responses: {
          201: {
            description: 'Cities created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '10 cities created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    cities: {
                      type: 'array',
                      items: { $ref: '#/definitions/City' },
                    },
                    count: { type: 'integer', example: 10 },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'State not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Static'],
        summary: 'Get all cities',
        description: 'Retrieve a list of cities with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 500,
            default: 100,
            description: 'Number of items per page',
          },
          {
            name: 'stateId',
            in: 'query',
            type: 'string',
            description: 'Filter by state ID',
          },
          {
            name: 'isActive',
            in: 'query',
            type: 'boolean',
            description: 'Filter by active status',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            description: 'Search by name',
          },
        ],
        responses: {
          200: {
            description: 'List of cities retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'array',
                  items: { $ref: '#/definitions/City' },
                },
                meta: {
                  type: 'object',
                  properties: {
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 100 },
                        total: { type: 'integer', example: 500 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/static/cities/{id}': {
      get: {
        tags: ['Static'],
        summary: 'Get city by ID',
        description: 'Retrieve a specific city by its ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'City ID',
          },
        ],
        responses: {
          200: {
            description: 'City retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    city: { $ref: '#/definitions/City' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid city ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'City not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Static'],
        summary: 'Update city by ID',
        description: 'Update city information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'City ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateCityRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'City updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'City updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    city: { $ref: '#/definitions/City' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'City or state not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Static'],
        summary: 'Delete city by ID',
        description: 'Permanently delete a city from the system',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'City ID',
          },
        ],
        responses: {
          200: {
            description: 'City deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'City deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid city ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'City not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a single file',
        description: 'Upload a single file (image, video, or document) to Cloudinary',
        consumes: ['multipart/form-data'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'file',
            in: 'formData',
            type: 'file',
            required: true,
            description: 'File to upload (image, video, or document)',
          },
          {
            name: 'folder',
            in: 'formData',
            type: 'string',
            description: 'Cloudinary folder path (default: rentfit)',
            example: 'rentfit/units',
          },
          {
            name: 'tags',
            in: 'formData',
            type: 'string',
            description: 'Comma-separated tags for the file',
            example: 'unit,property,photo',
          },
        ],
        responses: {
          200: {
            description: 'File uploaded successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'File uploaded successfully' },
                data: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'uri',
                          example: 'https://res.cloudinary.com/...',
                        },
                        publicId: { type: 'string', example: 'rentfit/abc123' },
                        format: { type: 'string', example: 'jpg' },
                        width: { type: 'integer', example: 1920 },
                        height: { type: 'integer', example: 1080 },
                        bytes: { type: 'integer', example: 245678 },
                        resourceType: { type: 'string', example: 'image' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or no file provided',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/upload/multiple': {
      post: {
        tags: ['Upload'],
        summary: 'Upload multiple files',
        description: 'Upload multiple files to Cloudinary (max 10 files)',
        consumes: ['multipart/form-data'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'files',
            in: 'formData',
            type: 'array',
            items: { type: 'file' },
            required: true,
            description: 'Files to upload (max 10)',
          },
          {
            name: 'folder',
            in: 'formData',
            type: 'string',
            description: 'Cloudinary folder path (default: rentfit)',
            example: 'rentfit/units',
          },
          {
            name: 'tags',
            in: 'formData',
            type: 'string',
            description: 'Comma-separated tags for the files',
            example: 'unit,property,photo',
          },
        ],
        responses: {
          200: {
            description: 'Files uploaded successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '3 file(s) uploaded successfully' },
                data: {
                  type: 'object',
                  properties: {
                    files: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', format: 'uri' },
                          publicId: { type: 'string' },
                          format: { type: 'string' },
                          width: { type: 'integer' },
                          height: { type: 'integer' },
                          bytes: { type: 'integer' },
                          resourceType: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or no files provided',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/upload/image': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a single image',
        description: 'Upload a single image file to Cloudinary',
        consumes: ['multipart/form-data'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'image',
            in: 'formData',
            type: 'file',
            required: true,
            description: 'Image file to upload (JPEG, PNG, WebP, GIF)',
          },
          {
            name: 'folder',
            in: 'formData',
            type: 'string',
            description: 'Cloudinary folder path (default: rentfit/images)',
            example: 'rentfit/units/photos',
          },
          {
            name: 'tags',
            in: 'formData',
            type: 'string',
            description: 'Comma-separated tags for the image',
            example: 'unit,property,photo',
          },
        ],
        responses: {
          200: {
            description: 'Image uploaded successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Image uploaded successfully' },
                data: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'uri',
                          example: 'https://res.cloudinary.com/...',
                        },
                        publicId: { type: 'string', example: 'rentfit/images/abc123' },
                        format: { type: 'string', example: 'jpg' },
                        width: { type: 'integer', example: 1920 },
                        height: { type: 'integer', example: 1080 },
                        bytes: { type: 'integer', example: 245678 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or no image provided',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/upload/video': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a single video',
        description: 'Upload a single video file to Cloudinary',
        consumes: ['multipart/form-data'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'video',
            in: 'formData',
            type: 'file',
            required: true,
            description: 'Video file to upload (MP4, MPEG, MOV, AVI)',
          },
          {
            name: 'folder',
            in: 'formData',
            type: 'string',
            description: 'Cloudinary folder path (default: rentfit/videos)',
            example: 'rentfit/units/videos',
          },
          {
            name: 'tags',
            in: 'formData',
            type: 'string',
            description: 'Comma-separated tags for the video',
            example: 'unit,property,video',
          },
        ],
        responses: {
          200: {
            description: 'Video uploaded successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Video uploaded successfully' },
                data: {
                  type: 'object',
                  properties: {
                    video: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'uri',
                          example: 'https://res.cloudinary.com/...',
                        },
                        publicId: { type: 'string', example: 'rentfit/videos/abc123' },
                        format: { type: 'string', example: 'mp4' },
                        width: { type: 'integer', example: 1920 },
                        height: { type: 'integer', example: 1080 },
                        bytes: { type: 'integer', example: 5245678 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or no video provided',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/upload/document': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a single document',
        description: 'Upload a single document file to Cloudinary',
        consumes: ['multipart/form-data'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'document',
            in: 'formData',
            type: 'file',
            required: true,
            description: 'Document file to upload (PDF, DOC, DOCX, TXT)',
          },
          {
            name: 'folder',
            in: 'formData',
            type: 'string',
            description: 'Cloudinary folder path (default: rentfit/documents)',
            example: 'rentfit/agreements',
          },
          {
            name: 'tags',
            in: 'formData',
            type: 'string',
            description: 'Comma-separated tags for the document',
            example: 'agreement,contract',
          },
        ],
        responses: {
          200: {
            description: 'Document uploaded successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Document uploaded successfully' },
                data: {
                  type: 'object',
                  properties: {
                    document: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'uri',
                          example: 'https://res.cloudinary.com/...',
                        },
                        publicId: { type: 'string', example: 'rentfit/documents/abc123' },
                        format: { type: 'string', example: 'pdf' },
                        bytes: { type: 'integer', example: 1245678 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or no document provided',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'User ID',
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
        },
        firstName: {
          type: 'string',
          description: 'User first name',
        },
        lastName: {
          type: 'string',
          description: 'User last name',
        },
        phone: {
          type: 'string',
          description: 'User phone number (Indian format)',
        },
        role: {
          type: 'string',
          enum: ['tenant', 'landlord', 'admin'],
          description: 'User role',
          default: 'tenant',
        },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
          default: false,
        },
        isPhoneVerified: {
          type: 'boolean',
          description: 'Phone verification status',
          default: false,
        },
        profilePicture: {
          type: 'string',
          description: 'Profile picture URL (Cloudinary)',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', description: 'Street address' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State' },
            pincode: { type: 'string', description: '6-digit pincode' },
            country: { type: 'string', description: 'Country', default: 'India' },
          },
        },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          description: 'Date of birth',
        },
        aadhaarNumber: {
          type: 'string',
          description: '12-digit Aadhaar number',
        },
        panNumber: {
          type: 'string',
          description: 'PAN number',
        },
        isActive: {
          type: 'boolean',
          description: 'User active status',
          default: true,
        },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          description: 'Last login timestamp',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Account creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateUserRequest: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          minLength: 8,
          description: 'Password (min 8 characters, must contain uppercase, lowercase, and number)',
          example: 'SecurePass123',
        },
        firstName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User first name',
          example: 'John',
        },
        lastName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User last name',
          example: 'Doe',
        },
        phone: {
          type: 'string',
          pattern: '^[6-9]\\d{9}$',
          description: 'Indian phone number (10 digits starting with 6-9)',
          example: '9876543210',
        },
        role: {
          type: 'string',
          enum: ['tenant', 'landlord', 'admin'],
          description:
            'User role. Can be tenant, landlord, or admin. Defaults to tenant if not provided.',
          default: 'tenant',
          example: 'landlord',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^\\d{6}$', example: '400001' },
            country: { type: 'string', default: 'India', example: 'India' },
          },
        },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          description: 'Date of birth',
          example: '1990-01-15T00:00:00.000Z',
        },
        aadhaarNumber: {
          type: 'string',
          pattern: '^\\d{12}$',
          description: '12-digit Aadhaar number',
          example: '123456789012',
        },
        panNumber: {
          type: 'string',
          pattern: '^[A-Z]{5}\\d{4}[A-Z]{1}$',
          description: 'PAN number',
          example: 'ABCDE1234F',
        },
      },
    },
    UpdateUserRequest: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          minLength: 8,
          description: 'Password (min 8 characters, must contain uppercase, lowercase, and number)',
          example: 'NewSecurePass123',
        },
        firstName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User first name',
          example: 'John',
        },
        lastName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User last name',
          example: 'Doe',
        },
        phone: {
          type: 'string',
          pattern: '^[6-9]\\d{9}$',
          description: 'Indian phone number (10 digits starting with 6-9)',
          example: '9876543210',
        },
        role: {
          type: 'string',
          enum: ['tenant', 'landlord', 'admin'],
          description: 'User role',
          example: 'tenant',
        },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
          example: true,
        },
        isPhoneVerified: {
          type: 'boolean',
          description: 'Phone verification status',
          example: false,
        },
        profilePicture: {
          type: 'string',
          format: 'uri',
          description: 'Profile picture URL (Cloudinary)',
          example: 'https://res.cloudinary.com/example/image/upload/v1234567890/profile.jpg',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^\\d{6}$', example: '400001' },
            country: { type: 'string', example: 'India' },
          },
        },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          description: 'Date of birth',
          example: '1990-01-15T00:00:00.000Z',
        },
        aadhaarNumber: {
          type: 'string',
          pattern: '^\\d{12}$',
          description: '12-digit Aadhaar number',
          example: '123456789012',
        },
        panNumber: {
          type: 'string',
          pattern: '^[A-Z]{5}\\d{4}[A-Z]{1}$',
          description: 'PAN number',
          example: 'ABCDE1234F',
        },
        isActive: {
          type: 'boolean',
          description: 'User active status',
          example: true,
        },
      },
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              description: 'Validation errors (if applicable)',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' },
                },
              },
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
            },
          },
        },
      },
    },
    Error: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error type',
        },
        message: {
          type: 'string',
          description: 'Error message',
        },
      },
    },
    Unit: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'Unit ID',
        },
        ownerId: {
          type: 'string',
          description: 'Owner user ID (populated with user info when fetched)',
        },
        title: {
          type: 'string',
          description: 'Unit title/name',
        },
        address: {
          type: 'object',
          properties: {
            line1: { type: 'string', description: 'Address line 1' },
            line2: { type: 'string', description: 'Address line 2' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State' },
            pincode: { type: 'string', description: '6-digit pincode' },
          },
        },
        geo: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['Point'],
              description: 'GeoJSON type',
              default: 'Point',
            },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2,
              description: 'Geographic coordinates [longitude, latitude]',
              example: [72.8777, 19.076],
            },
          },
        },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'uri' },
          description: 'Array of photo URLs (Cloudinary)',
        },
        beds: {
          type: 'integer',
          description: 'Number of bedrooms',
        },
        areaSqFt: {
          type: 'number',
          description: 'Area in square feet',
        },
        status: {
          type: 'string',
          enum: ['vacant', 'occupied', 'maintenance'],
          description: 'Unit status',
          default: 'vacant',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Unit creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateUnitRequest: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: {
          type: 'string',
          description: 'Owner user ID',
          example: '507f1f77bcf86cd799439011',
        },
        title: {
          type: 'string',
          minLength: 3,
          maxLength: 200,
          description: 'Unit title/name',
          example: '2BHK Apartment in Bandra',
        },
        address: {
          type: 'object',
          properties: {
            line1: { type: 'string', example: '123 Main Street' },
            line2: { type: 'string', example: 'Building A, Floor 3' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^\\d{6}$', example: '400050' },
          },
        },
        geo: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['Point'],
              default: 'Point',
            },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2,
              description: 'Geographic coordinates [longitude, latitude]',
              example: [72.8777, 19.076],
            },
          },
        },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'uri' },
          description: 'Array of photo URLs (Cloudinary)',
          example: ['https://res.cloudinary.com/example/image/upload/v1234567890/unit1.jpg'],
        },
        beds: {
          type: 'integer',
          minimum: 0,
          description: 'Number of bedrooms',
          example: 2,
        },
        areaSqFt: {
          type: 'number',
          minimum: 0,
          description: 'Area in square feet',
          example: 1200,
        },
        status: {
          type: 'string',
          enum: ['vacant', 'occupied', 'maintenance'],
          description: 'Unit status',
          default: 'vacant',
          example: 'vacant',
        },
      },
    },
    UpdateUnitRequest: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          minLength: 3,
          maxLength: 200,
          description: 'Unit title/name',
          example: '2BHK Apartment in Bandra',
        },
        address: {
          type: 'object',
          properties: {
            line1: { type: 'string', example: '123 Main Street' },
            line2: { type: 'string', example: 'Building A, Floor 3' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^\\d{6}$', example: '400050' },
          },
        },
        geo: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['Point'],
              default: 'Point',
            },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2,
              description: 'Geographic coordinates [longitude, latitude]',
              example: [72.8777, 19.076],
            },
          },
        },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'uri' },
          description: 'Array of photo URLs (Cloudinary)',
          example: ['https://res.cloudinary.com/example/image/upload/v1234567890/unit1.jpg'],
        },
        beds: {
          type: 'integer',
          minimum: 0,
          description: 'Number of bedrooms',
          example: 2,
        },
        areaSqFt: {
          type: 'number',
          minimum: 0,
          description: 'Area in square feet',
          example: 1200,
        },
        status: {
          type: 'string',
          enum: ['vacant', 'occupied', 'maintenance'],
          description: 'Unit status',
          example: 'vacant',
        },
      },
    },
    Country: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'Country ID',
        },
        name: {
          type: 'string',
          description: 'Country name',
          example: 'India',
        },
        code: {
          type: 'string',
          description: 'ISO 2-letter country code',
          example: 'IN',
        },
        phoneCode: {
          type: 'string',
          description: 'International dialing code',
          example: '+91',
        },
        isActive: {
          type: 'boolean',
          description: 'Country active status',
          default: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateCountryRequest: {
      type: 'object',
      required: ['name', 'code'],
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'Country name',
          example: 'India',
        },
        code: {
          type: 'string',
          pattern: '^[A-Z]{2}$',
          description: 'ISO 2-letter country code (uppercase)',
          example: 'IN',
        },
        phoneCode: {
          type: 'string',
          maxLength: 10,
          description: 'International dialing code',
          example: '+91',
        },
        isActive: {
          type: 'boolean',
          description: 'Country active status',
          default: true,
        },
      },
    },
    UpdateCountryRequest: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'Country name',
          example: 'India',
        },
        code: {
          type: 'string',
          pattern: '^[A-Z]{2}$',
          description: 'ISO 2-letter country code (uppercase)',
          example: 'IN',
        },
        phoneCode: {
          type: 'string',
          maxLength: 10,
          description: 'International dialing code',
          example: '+91',
        },
        isActive: {
          type: 'boolean',
          description: 'Country active status',
        },
      },
    },
    State: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'State ID',
        },
        name: {
          type: 'string',
          description: 'State name',
          example: 'Maharashtra',
        },
        code: {
          type: 'string',
          description: 'State code',
          example: 'MH',
        },
        countryId: {
          type: 'object',
          description: 'Country reference (populated with country info when fetched)',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'India' },
            code: { type: 'string', example: 'IN' },
          },
        },
        isActive: {
          type: 'boolean',
          description: 'State active status',
          default: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateStateRequest: {
      type: 'object',
      required: ['name', 'countryId'],
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'State name',
          example: 'Maharashtra',
        },
        code: {
          type: 'string',
          maxLength: 10,
          description: 'State code',
          example: 'MH',
        },
        countryId: {
          type: 'string',
          description: 'Country ID',
          example: '507f1f77bcf86cd799439011',
        },
        isActive: {
          type: 'boolean',
          description: 'State active status',
          default: true,
        },
      },
    },
    UpdateStateRequest: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'State name',
          example: 'Maharashtra',
        },
        code: {
          type: 'string',
          maxLength: 10,
          description: 'State code',
          example: 'MH',
        },
        countryId: {
          type: 'string',
          description: 'Country ID',
          example: '507f1f77bcf86cd799439011',
        },
        isActive: {
          type: 'boolean',
          description: 'State active status',
        },
      },
    },
    City: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'City ID',
        },
        name: {
          type: 'string',
          description: 'City name',
          example: 'Mumbai',
        },
        stateId: {
          type: 'object',
          description: 'State reference (populated with state and country info when fetched)',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Maharashtra' },
            code: { type: 'string', example: 'MH' },
            countryId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string', example: 'India' },
                code: { type: 'string', example: 'IN' },
              },
            },
          },
        },
        isActive: {
          type: 'boolean',
          description: 'City active status',
          default: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateCityRequest: {
      type: 'object',
      required: ['name', 'stateId'],
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'City name',
          example: 'Mumbai',
        },
        stateId: {
          type: 'string',
          description: 'State ID',
          example: '507f1f77bcf86cd799439011',
        },
        isActive: {
          type: 'boolean',
          description: 'City active status',
          default: true,
        },
      },
    },
    UpdateCityRequest: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'City name',
          example: 'Mumbai',
        },
        stateId: {
          type: 'string',
          description: 'State ID',
          example: '507f1f77bcf86cd799439011',
        },
        isActive: {
          type: 'boolean',
          description: 'City active status',
        },
      },
    },
    Tenancy: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'Tenancy ID',
        },
        unitId: {
          type: 'object',
          description: 'Unit reference (populated with unit info when fetched)',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: '2BHK Apartment in Bandra' },
            address: {
              type: 'object',
              properties: {
                line1: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
              },
            },
          },
        },
        ownerId: {
          type: 'object',
          description: 'Owner user reference (populated with user info when fetched)',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
          },
        },
        tenantId: {
          type: 'object',
          description: 'Tenant user reference (populated with user info when fetched)',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' },
            email: { type: 'string', example: 'jane.smith@example.com' },
          },
        },
        agreement: {
          type: 'object',
          description: 'Agreement details',
          properties: {
            agreementId: {
              type: 'string',
              description: 'Agreement document ID',
            },
            pdfUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to the agreement PDF',
            },
            version: {
              type: 'integer',
              description: 'Agreement version number',
              example: 1,
            },
            signedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when agreement was signed',
            },
          },
        },
        rent: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              description: 'Monthly rent amount',
              example: 25000,
            },
            cycle: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'yearly'],
              description: 'Rent payment cycle',
              default: 'monthly',
              example: 'monthly',
            },
            dueDateDay: {
              type: 'integer',
              minimum: 1,
              maximum: 31,
              description: 'Day of month when rent is due',
              example: 5,
            },
            utilitiesIncluded: {
              type: 'boolean',
              description: 'Whether utilities are included in rent',
              default: false,
              example: false,
            },
          },
        },
        deposit: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Security deposit amount',
              example: 50000,
            },
            status: {
              type: 'string',
              enum: ['upcoming', 'held', 'returned', 'disputed'],
              description: 'Deposit status',
              default: 'upcoming',
              example: 'upcoming',
            },
          },
        },
        payments: {
          type: 'array',
          description: 'Array of payment records',
          items: {
            type: 'object',
            properties: {
              paymentId: {
                type: 'string',
                description: 'Payment transaction ID',
              },
              amount: {
                type: 'number',
                description: 'Payment amount',
                example: 25000,
              },
              date: {
                type: 'string',
                format: 'date-time',
                description: 'Payment date',
              },
              method: {
                type: 'string',
                description: 'Payment method',
                example: 'UPI',
              },
              reference: {
                type: 'string',
                description: 'Payment reference number',
                example: 'TXN123456789',
              },
              receiptUrl: {
                type: 'string',
                format: 'uri',
                description: 'URL to payment receipt',
              },
            },
          },
        },
        evidence: {
          type: 'array',
          description: 'Array of evidence documents (photos, videos, documents)',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['photo', 'video', 'document'],
                description: 'Type of evidence',
                example: 'photo',
              },
              url: {
                type: 'string',
                format: 'uri',
                description: 'URL to the evidence file',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'When the evidence was uploaded',
              },
              uploaderId: {
                type: 'string',
                description: 'ID of user who uploaded the evidence',
              },
              meta: {
                type: 'object',
                description: 'Additional metadata about the evidence',
              },
            },
          },
        },
        status: {
          type: 'string',
          enum: ['active', 'terminated', 'pendingRenewal'],
          description: 'Tenancy status',
          default: 'active',
          example: 'active',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateTenancyRequest: {
      type: 'object',
      required: ['unitId', 'ownerId', 'tenantId', 'rent'],
      properties: {
        unitId: {
          type: 'string',
          description: 'Unit ID',
          example: '507f1f77bcf86cd799439011',
        },
        ownerId: {
          type: 'string',
          description: 'Owner user ID',
          example: '507f1f77bcf86cd799439012',
        },
        tenantId: {
          type: 'string',
          description: 'Tenant user ID',
          example: '507f1f77bcf86cd799439013',
        },
        agreementId: {
          type: 'string',
          description:
            'Existing Agreement ID to link. When provided, tenancy.agreement will be populated from the Agreement document.',
          example: '507f1f77bcf86cd799439014',
        },
        rent: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Monthly rent amount',
              example: 25000,
            },
            cycle: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'yearly'],
              description: 'Rent payment cycle',
              default: 'monthly',
              example: 'monthly',
            },
            dueDateDay: {
              type: 'integer',
              minimum: 1,
              maximum: 31,
              description: 'Day of month when rent is due',
              example: 5,
            },
            utilitiesIncluded: {
              type: 'boolean',
              description: 'Whether utilities are included in rent',
              default: false,
              example: false,
            },
          },
        },
        deposit: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Security deposit amount',
              example: 50000,
            },
            status: {
              type: 'string',
              enum: ['upcoming', 'held', 'returned', 'disputed'],
              description: 'Deposit status',
              default: 'upcoming',
              example: 'upcoming',
            },
          },
        },
        status: {
          type: 'string',
          enum: ['active', 'terminated', 'pendingRenewal'],
          description: 'Tenancy status',
          default: 'active',
          example: 'active',
        },
      },
    },
    UpdateTenancyRequest: {
      type: 'object',
      properties: {
        agreement: {
          type: 'object',
          properties: {
            agreementId: {
              type: 'string',
              description: 'Agreement document ID',
              example: '507f1f77bcf86cd799439014',
            },
            pdfUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to the agreement PDF',
              example: 'https://example.com/agreements/agreement.pdf',
            },
            version: {
              type: 'integer',
              minimum: 1,
              description: 'Agreement version number',
              example: 1,
            },
            signedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when agreement was signed',
            },
          },
        },
        rent: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Monthly rent amount',
              example: 25000,
            },
            cycle: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'yearly'],
              description: 'Rent payment cycle',
              example: 'monthly',
            },
            dueDateDay: {
              type: 'integer',
              minimum: 1,
              maximum: 31,
              description: 'Day of month when rent is due',
              example: 5,
            },
            utilitiesIncluded: {
              type: 'boolean',
              description: 'Whether utilities are included in rent',
              example: false,
            },
          },
        },
        deposit: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Security deposit amount',
              example: 50000,
            },
            status: {
              type: 'string',
              enum: ['held', 'returned', 'disputed'],
              description: 'Deposit status',
              example: 'held',
            },
          },
        },
        payments: {
          type: 'array',
          description: 'Array of payment records to append',
          items: {
            type: 'object',
            properties: {
              paymentId: {
                type: 'string',
                description: 'Payment transaction ID',
              },
              amount: {
                type: 'number',
                minimum: 0,
                description: 'Payment amount',
                example: 25000,
              },
              date: {
                type: 'string',
                format: 'date-time',
                description: 'Payment date',
              },
              method: {
                type: 'string',
                description: 'Payment method',
                example: 'UPI',
              },
              reference: {
                type: 'string',
                description: 'Payment reference number',
                example: 'TXN123456789',
              },
              receiptUrl: {
                type: 'string',
                format: 'uri',
                description: 'URL to payment receipt',
              },
            },
          },
        },
        evidence: {
          type: 'array',
          description: 'Array of evidence documents to append',
          items: {
            type: 'object',
            required: ['url', 'uploaderId'],
            properties: {
              type: {
                type: 'string',
                enum: ['photo', 'video', 'document'],
                description: 'Type of evidence',
                example: 'photo',
              },
              url: {
                type: 'string',
                format: 'uri',
                description: 'URL to the evidence file',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'When the evidence was uploaded',
              },
              uploaderId: {
                type: 'string',
                description: 'ID of user who uploaded the evidence',
                example: '507f1f77bcf86cd799439012',
              },
              meta: {
                type: 'object',
                description: 'Additional metadata about the evidence',
              },
            },
          },
        },
        status: {
          type: 'string',
          enum: ['active', 'terminated', 'pendingRenewal'],
          description: 'Tenancy status',
          example: 'active',
        },
      },
    },
    Agreement: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'Agreement ID',
        },
        templateName: {
          type: 'string',
          description: 'Name of the agreement template',
          example: 'Standard Residential Rent Agreement',
        },
        stateCode: {
          type: 'string',
          description: 'State code for localized legal clauses',
          example: 'MH',
        },
        clauses: {
          type: 'array',
          description: 'Array of clause objects',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'Optional key identifier for the clause',
                example: 'RENT_PAYMENT',
              },
              text: {
                type: 'string',
                description: 'Full text of the clause',
                example: 'Tenant agrees to pay rent on or before the 5th of each month.',
              },
            },
          },
        },
        pdfUrl: {
          type: 'string',
          format: 'uri',
          description:
            'URL to the generated agreement PDF (automatically generated and uploaded to Cloudinary when agreement is created)',
          example:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/rentfit/agreements/agreement-abc123.pdf',
        },
        version: {
          type: 'integer',
          description: 'Version number of the agreement',
          example: 1,
        },
        createdBy: {
          type: 'string',
          description: 'User ID of the creator',
        },
        tenancyId: {
          type: 'string',
          description: 'Linked tenancy ID',
        },
        status: {
          type: 'string',
          enum: ['draft', 'pending_signature', 'signed', 'cancelled'],
          description: 'Agreement status',
          example: 'draft',
        },
        signers: {
          type: 'array',
          description: 'Array of signer records',
          items: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID of the signer',
              },
              name: {
                type: 'string',
                description: 'Display name of signer',
              },
              method: {
                type: 'string',
                enum: ['esign', 'otp', 'manual'],
                description: 'Signing method used',
              },
              signedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp when the user signed',
              },
              meta: {
                type: 'object',
                description: 'Additional signing metadata',
              },
            },
          },
        },
        lastSignedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp when the last signature was recorded',
        },
        meta: {
          type: 'object',
          description: 'Additional metadata for internal use',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateAgreementRequest: {
      type: 'object',
      description:
        'Either tenancyId or tenancyData must be provided. If tenancyId is provided, the agreement will use data from the existing tenancy. If tenancyData is provided, the agreement will be created before the tenancy exists (useful for create-tenancy flow).',
      properties: {
        tenancyId: {
          type: 'string',
          description: 'Linked tenancy ID (optional - use when tenancy already exists)',
          example: '507f1f77bcf86cd799439011',
        },
        tenancyData: {
          type: 'object',
          description:
            'Tenancy data to use for PDF generation (optional - use when tenancy does not exist yet)',
          properties: {
            ownerId: {
              type: 'string',
              description: 'Owner/landlord user ID',
              example: '507f1f77bcf86cd799439012',
            },
            tenantId: {
              type: 'string',
              description: 'Tenant user ID',
              example: '507f1f77bcf86cd799439013',
            },
            unitId: {
              type: 'string',
              description: 'Property unit ID',
              example: '507f1f77bcf86cd799439014',
            },
            rent: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: {
                  type: 'number',
                  description: 'Monthly rent amount',
                  example: 25000,
                },
                cycle: {
                  type: 'string',
                  enum: ['monthly', 'quarterly', 'yearly'],
                  description: 'Rent payment cycle',
                  default: 'monthly',
                  example: 'monthly',
                },
                dueDateDay: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 31,
                  description: 'Day of month when rent is due',
                  example: 5,
                },
                utilitiesIncluded: {
                  type: 'boolean',
                  description: 'Whether utilities are included in rent',
                  default: false,
                  example: false,
                },
              },
            },
            deposit: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  minimum: 0,
                  description: 'Security deposit amount',
                  example: 50000,
                },
                status: {
                  type: 'string',
                  enum: ['held', 'returned', 'disputed'],
                  description: 'Deposit status',
                  default: 'held',
                  example: 'held',
                },
              },
            },
          },
        },
        templateName: {
          type: 'string',
          description: 'Name of the agreement template (optional)',
          example: 'Standard Residential Rent Agreement',
        },
        stateCode: {
          type: 'string',
          description: 'State code (optional)',
          example: 'MH',
        },
        clauses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'Optional key identifier for the clause',
                example: 'RENT_PAYMENT',
              },
              text: {
                type: 'string',
                description: 'Full text of the clause',
              },
            },
          },
        },
        version: {
          type: 'integer',
          minimum: 1,
          description: 'Version number of the agreement (optional, defaults to 1)',
          example: 1,
        },
        createdBy: {
          type: 'string',
          description: 'User ID of the creator',
        },
        status: {
          type: 'string',
          enum: ['draft', 'pending_signature', 'signed', 'cancelled'],
          description: 'Agreement status',
          example: 'draft',
        },
        signers: {
          type: 'array',
          description: 'Initial signers to attach to the agreement',
          items: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID of the signer',
              },
              name: {
                type: 'string',
                description: 'Display name of signer',
              },
              method: {
                type: 'string',
                enum: ['esign', 'otp', 'manual'],
                description: 'Signing method used',
              },
              signedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp when the user signed',
              },
              meta: {
                type: 'object',
                description: 'Additional signing metadata',
              },
            },
          },
        },
        meta: {
          type: 'object',
          description: 'Additional metadata for internal use (optional)',
        },
      },
    },
    UpdateAgreementRequest: {
      type: 'object',
      properties: {
        templateName: {
          type: 'string',
          description: 'Name of the agreement template',
        },
        stateCode: {
          type: 'string',
          description: 'State code',
        },
        clauses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'Optional key identifier for the clause',
              },
              text: {
                type: 'string',
                description: 'Full text of the clause',
              },
            },
          },
        },
        pdfUrl: {
          type: 'string',
          format: 'uri',
          description:
            'URL to the agreement PDF. Note: On creation, this is automatically generated and uploaded to Cloudinary. On update, this can be manually set if needed.',
          example:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/rentfit/agreements/agreement-abc123.pdf',
        },
        version: {
          type: 'integer',
          minimum: 1,
          description: 'Version number of the agreement',
        },
        status: {
          type: 'string',
          enum: ['draft', 'pending_signature', 'signed', 'cancelled'],
          description: 'Agreement status',
        },
        signers: {
          type: 'array',
          description: 'Replace the set of signers with this array',
          items: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID of the signer',
              },
              name: {
                type: 'string',
                description: 'Display name of signer',
              },
              method: {
                type: 'string',
                enum: ['esign', 'otp', 'manual'],
                description: 'Signing method used',
              },
              signedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp when the user signed',
              },
              meta: {
                type: 'object',
                description: 'Additional signing metadata',
              },
            },
          },
        },
        meta: {
          type: 'object',
          description: 'Additional metadata for internal use',
        },
      },
    },
    SignAgreementRequest: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
          description: 'User ID of the person signing the agreement',
          example: '507f1f77bcf86cd799439011',
        },
        name: {
          type: 'string',
          maxLength: 200,
          description: 'Display name of the signer (optional)',
          example: 'John Doe',
        },
        method: {
          type: 'string',
          enum: ['esign', 'otp', 'manual'],
          description: 'Signing method used',
          default: 'manual',
          example: 'manual',
        },
        meta: {
          type: 'object',
          description:
            'Additional signing metadata (e.g., IP address, device info, OTP verification details)',
          example: {
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            otpVerified: true,
          },
        },
      },
    },
  },
};

export default swaggerDocument;
